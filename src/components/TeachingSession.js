import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import './TeachingSession.css';

function TeachingSession({ customPrompt, onBackToHome }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [currentTeacherMessage, setCurrentTeacherMessage] = useState(''); // For accumulating streaming response
  const [chatHistory, setChatHistory] = useState([]); // Store complete chat history for video generation
  const [videoGeneration, setVideoGeneration] = useState({
    isGenerating: false,
    operationName: null,
    status: 'idle', // idle, generating-prompt, generating-video, polling, completed, error
    progress: 0,
    videoUrl: null,
    error: null
  });
  
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingAudioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Audio streaming setup
  const audioContextRef = useRef(null);
  const nextPlayTimeRef = useRef(0);

  useEffect(() => {
    // Auto-connect when component mounts
    connectToTeacher();
    
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    stopRecording();
    stopScreenShare();
  };

  // Connect to WebSocket with custom prompt
  const connectToTeacher = async () => {
    if (connecting || connected) return;
    
    setConnecting(true);
    addMessage('system', 'Connecting to your personalized AI teacher...');
    
    try {
      const socket = new SockJS('http://localhost:8080/sahayak-teacher');
      
      socket.onopen = () => {
        console.log('Connected to Sahayak Teacher');
        
        // Send initialization message to create teacher session with custom prompt
        const initMessage = {
          type: 'init',
          mode: 'teacher',
          customPrompt: customPrompt || null
        };
        socket.send(JSON.stringify(initMessage));
        
        setConnected(true);
        setConnecting(false);
        addMessage('system', 'Connected! Your AI teacher is ready with your custom requirements.');
        
        // Send the introduction request after session is created
        if (customPrompt) {
          setTimeout(() => {
            const setupMessage = {
              type: 'text',
              data: 'Please introduce yourself and ask how you can help me today.'
            };
            socket.send(JSON.stringify(setupMessage));
            addMessage('system', 'Custom teaching requirements applied successfully!');
          }, 2000); // Give more time for session creation
        }
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
      };
      
      socket.onclose = () => {
        console.log('Disconnected from Sahayak Teacher');
        setConnected(false);
        setConnecting(false);
        addMessage('system', 'Disconnected from AI Teacher');
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnecting(false);
        addMessage('error', 'Connection error occurred');
      };
      
      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnecting(false);
      addMessage('error', 'Failed to connect to AI Teacher');
    }
  };

  const handleServerMessage = (data) => {
    console.log('Received message:', data);
    
    switch (data.type) {
      case 'connection':
        if (data.subType === 'success') {
          addMessage('system', data.data);
        } else if (data.subType === 'error') {
          addMessage('error', data.data);
        }
        break;
        
      case 'audio':
        if (data.subType === 'data') {
          playAudioResponse(data.data);
        }
        break;
        
      case 'content':
        if (data.subType === 'text') {
          const response = data.data;
          
          // Accumulate streaming response
          setCurrentTeacherMessage(prev => {
            const newMessage = prev + response;
            
            // Update the last teacher message in real-time
            setMessages(prevMessages => {
              const messages = [...prevMessages];
              const lastMessageIndex = messages.length - 1;
              
              if (lastMessageIndex >= 0 && messages[lastMessageIndex].type === 'teacher' && messages[lastMessageIndex].isStreaming) {
                // Update existing streaming message
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: newMessage,
                  timestamp: new Date().toLocaleTimeString()
                };
              } else {
                // Create new streaming message
                messages.push({
                  id: Date.now() + Math.random(),
                  type: 'teacher',
                  content: newMessage,
                  timestamp: new Date().toLocaleTimeString(),
                  isStreaming: true
                });
              }
              
              return messages;
            });
            
            return newMessage;
          });
        }
        break;
        
      case 'error':
        addMessage('error', data.data);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const addMessage = (type, content) => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, message]);
    
    // Add to chat history for video generation (exclude system messages)
    if (type === 'student' || type === 'teacher') {
      setChatHistory(prev => [...prev, {
        role: type === 'student' ? 'user' : 'assistant',
        content: content,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const sendTextMessage = () => {
    if (!inputText.trim() || !connected) return;
    
    // Reset teacher message accumulator when sending new message
    setCurrentTeacherMessage('');
    
    // Mark any existing streaming message as complete
    setMessages(prevMessages => {
      const messages = [...prevMessages];
      const lastMessageIndex = messages.length - 1;
      if (lastMessageIndex >= 0 && messages[lastMessageIndex].type === 'teacher' && messages[lastMessageIndex].isStreaming) {
        messages[lastMessageIndex].isStreaming = false;
      }
      return messages;
    });
    
    const message = {
      type: 'text',
      data: inputText
    };
    
    socketRef.current.send(JSON.stringify(message));
    addMessage('student', inputText);
    setInputText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      recordingAudioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      setIsRecording(true);
      monitorVolume();
      
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      let audioBuffer = [];
      const CHUNK_SIZE = 16000;
      let isStreamingActive = true;
      
      scriptProcessor.onaudioprocess = (event) => {
        if (!isStreamingActive) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        audioBuffer.push(...pcmData);
        
        if (audioBuffer.length >= CHUNK_SIZE) {
          const chunkToSend = new Int16Array(audioBuffer.splice(0, CHUNK_SIZE));
          const uint8Array = new Uint8Array(chunkToSend.buffer);
          const base64Audio = btoa(String.fromCharCode.apply(null, uint8Array));
          
          if (connected && socketRef.current) {
            const message = {
              type: 'audio',
              data: base64Audio
            };
            socketRef.current.send(JSON.stringify(message));
          }
        }
      };
      
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      mediaRecorderRef.current = {
        scriptProcessor,
        stream,
        source,
        isStreamingActive,
        stop: () => {
          isStreamingActive = false;
          
          if (audioBuffer.length > 0) {
            const remainingChunk = new Int16Array(audioBuffer);
            const uint8Array = new Uint8Array(remainingChunk.buffer);
            const base64Audio = btoa(String.fromCharCode.apply(null, uint8Array));
            
            if (connected && socketRef.current) {
              const message = {
                type: 'audio',
                data: base64Audio
              };
              socketRef.current.send(JSON.stringify(message));
            }
          }
          
          scriptProcessor.disconnect();
          source.disconnect();
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      addMessage('system', 'Voice conversation started - speak anytime!');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      addMessage('error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setVolume(0);
      addMessage('system', 'Voice conversation stopped');
    }
  };

  const monitorVolume = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateVolume = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setVolume(Math.min(average / 128, 1));
      
      requestAnimationFrame(updateVolume);
    };
    
    updateVolume();
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsScreenSharing(true);
      addMessage('system', 'Screen sharing started - your teacher can now see your screen!');
      
      if (!isRecording) {
        await startRecording();
      }
      
      const sendVideoFrameContinuously = () => {
        const isStreamActive = streamRef.current && streamRef.current.active;
        
        if (!isStreamActive || !canvasRef.current || !videoRef.current || !streamRef.current) {
          return;
        }
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          return;
        }
        
        canvas.width = video.videoWidth * 0.25;
        canvas.height = video.videoHeight * 0.25;
        
        if (canvas.width > 0 && canvas.height > 0) {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 1.0);
            const data = base64Image.slice(base64Image.indexOf(",") + 1, Infinity);
            
            if (data && data.length > 1000 && connected && socketRef.current) {
              const message = {
                type: 'video',
                data: data
              };
              socketRef.current.send(JSON.stringify(message));
            }
          } catch (error) {
            console.error('Error capturing video frame:', error);
          }
        }
      };
      
      let timeoutId = -1;
      const sendVideoFrame = () => {
        sendVideoFrameContinuously();
        if (connected && streamRef.current && streamRef.current.active) {
          timeoutId = window.setTimeout(sendVideoFrame, 2000);
        }
      };
      
      requestAnimationFrame(sendVideoFrame);
      streamRef.current.frameTimeout = timeoutId;
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
    } catch (error) {
      console.error('Error starting screen share:', error);
      addMessage('error', 'Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      if (streamRef.current.frameTimeout) {
        clearTimeout(streamRef.current.frameTimeout);
      }
      
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScreenSharing(false);
    addMessage('system', 'Screen sharing stopped');
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      nextPlayTimeRef.current = audioContextRef.current.currentTime;
    }
  };

  const playAudioResponse = async (base64Audio) => {
    try {
      initAudioContext();
      
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      const pcmData = new Int16Array(arrayBuffer);
      const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < pcmData.length; i++) {
        channelData[i] = pcmData[i] / 32768.0;
      }
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      const now = audioContextRef.current.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
      
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Video Generation Functions
  const generateVideo = async () => {
    if (chatHistory.length === 0) {
      addMessage('error', 'No conversation history available for video generation');
      return;
    }

    setVideoGeneration(prev => ({
      ...prev,
      isGenerating: true,
      status: 'generating-prompt',
      progress: 10,
      error: null,
      videoUrl: null
    }));

    try {
      // Step 1: Generate video prompt
      const context = {
        teachingPrompt: customPrompt,
        chatHistory: chatHistory.slice(-10), // Last 10 messages for context
        timestamp: new Date().toISOString()
      };

      const promptResponse = await fetch('http://localhost:8080/api/sahayak/video/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context })
      });

      if (!promptResponse.ok) {
        throw new Error('Failed to generate video prompt');
      }

      const promptData = await promptResponse.json();
      
      setVideoGeneration(prev => ({
        ...prev,
        status: 'generating-video',
        progress: 30
      }));

      // Step 2: Generate video
      const videoResponse = await fetch('http://localhost:8080/api/sahayak/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptData.prompt })
      });

      if (!videoResponse.ok) {
        throw new Error('Failed to start video generation');
      }

      const videoData = await videoResponse.json();
      
      setVideoGeneration(prev => ({
        ...prev,
        operationName: videoData.operationName,
        status: 'polling',
        progress: 50
      }));

      // Step 3: Poll for completion
      pollVideoStatus(videoData.operationName);

    } catch (error) {
      console.error('Video generation error:', error);
      setVideoGeneration(prev => ({
        ...prev,
        isGenerating: false,
        status: 'error',
        error: error.message
      }));
      addMessage('error', `Video generation failed: ${error.message}`);
    }
  };

  const pollVideoStatus = async (operationName) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

      const poll = async () => {
        try {
          attempts++;
          const response = await fetch(`http://localhost:8080/api/sahayak/video/status?operationName=${encodeURIComponent(operationName)}`);
        
        if (!response.ok) {
          throw new Error('Failed to check video status');
        }

        const data = await response.json();
        
        if (data.done) {
          // Video generation completed
          setVideoGeneration(prev => ({
            ...prev,
            status: 'completed',
            progress: 90
          }));

          // Download the video
          downloadVideo(data.videoUri);
        } else if (attempts >= maxAttempts) {
          throw new Error('Video generation timeout');
        } else {
          // Update progress
          const progress = Math.min(50 + (attempts / maxAttempts) * 40, 90);
          setVideoGeneration(prev => ({
            ...prev,
            progress: progress
          }));

          // Continue polling
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Polling error:', error);
        setVideoGeneration(prev => ({
          ...prev,
          isGenerating: false,
          status: 'error',
          error: error.message
        }));
        addMessage('error', `Video polling failed: ${error.message}`);
      }
    };

    poll();
  };

  const downloadVideo = async (videoUri) => {
    try {
      const response = await fetch('http://localhost:8080/api/sahayak/video/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUri })
      });

      if (!response.ok) {
        throw new Error('Failed to download video');
      }

      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      setVideoGeneration(prev => ({
        ...prev,
        isGenerating: false,
        status: 'completed',
        progress: 100,
        videoUrl: videoUrl
      }));

      addMessage('system', '🎬 Educational video generated successfully! Check the video player below.');
    } catch (error) {
      console.error('Video download error:', error);
      setVideoGeneration(prev => ({
        ...prev,
        isGenerating: false,
        status: 'error',
        error: error.message
      }));
      addMessage('error', `Video download failed: ${error.message}`);
    }
  };

  const resetVideoGeneration = () => {
    if (videoGeneration.videoUrl) {
      URL.revokeObjectURL(videoGeneration.videoUrl);
    }
    setVideoGeneration({
      isGenerating: false,
      operationName: null,
      status: 'idle',
      progress: 0,
      videoUrl: null,
      error: null
    });
  };

  return (
    <div className="teaching-session">
      <div className="session-header">
        <div className="session-info">
          <div className="teacher-avatar">🎓</div>
          <div className="session-details">
            <h2>Teaching Session</h2>
            <p>Personalized AI Teacher</p>
          </div>
        </div>
        <div className="session-controls">
          <button className="back-to-home-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
          <div className="connection-status">
            {connected ? (
              <span className="status connected">● Connected</span>
            ) : connecting ? (
              <span className="status connecting">● Connecting...</span>
            ) : (
              <span className="status disconnected">● Disconnected</span>
            )}
          </div>
        </div>
      </div>

      <div className="session-content">
        <div className="main-content">
          <div className="chat-section">
            <div className="chat-header">
              <h3>💬 Chat with Your AI Teacher</h3>
              <p>Ask questions, get explanations, and learn interactively</p>
            </div>

            <div className="messages-container">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <strong>
                      {message.type === 'student' ? 'You' : 
                       message.type === 'teacher' ? 'AI Teacher' : 
                       message.type === 'system' ? 'System' : 'Error'}:
                    </strong>
                    <span>{message.content}</span>
                  </div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              ))}
            </div>

            <div className="input-section">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                placeholder="Ask your personalized teacher a question..."
                disabled={!connected}
              />
              <button 
                className="send-btn"
                onClick={sendTextMessage} 
                disabled={!connected || !inputText.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="controls-section">
          <div className="connection-panel">
            <h4>🎤 Voice & Screen</h4>
            <div className="connection-buttons">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!connected}
                className={`connect-btn ${isRecording ? 'recording' : ''}`}
              >
                {isRecording ? '🛑 End Voice Chat' : '🎤 Start Voice Chat'}
              </button>

              <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                disabled={!connected}
                className={`connect-btn ${isScreenSharing ? 'sharing' : ''}`}
              >
                {isScreenSharing ? '📱 Stop Sharing' : '📺 Share Screen'}
              </button>
            </div>
          </div>

          <div className="media-panel">
            <h4>🎬 Video Generation</h4>
            <div className="media-controls">
              <button
                onClick={generateVideo}
                disabled={!connected || videoGeneration.isGenerating || chatHistory.length === 0}
                className={`media-btn ${videoGeneration.isGenerating ? 'generating' : ''}`}
              >
                {videoGeneration.isGenerating ? '🎬 Generating...' : '🎬 Generate Video'}
              </button>
            </div>

            {videoGeneration.isGenerating && (
              <div className="video-generation-progress">
                <div className="progress-header">
                  <span className="progress-title">Creating Educational Video</span>
                  <span className="progress-percentage">{Math.round(videoGeneration.progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${videoGeneration.progress}%` }}
                  ></div>
                </div>
                <div className="progress-status">
                  {videoGeneration.status === 'generating-prompt' && 'Creating video prompt...'}
                  {videoGeneration.status === 'generating-video' && 'Starting video generation...'}
                  {videoGeneration.status === 'polling' && 'AI is creating your video...'}
                  {videoGeneration.status === 'completed' && 'Finalizing video...'}
                </div>
              </div>
            )}

            {videoGeneration.error && (
              <div className="error-message">
                <div className="error-header">
                  <span className="error-icon">❌</span>
                  <span className="error-title">Video Generation Failed</span>
                </div>
                <div className="error-text">{videoGeneration.error}</div>
                <button 
                  className="media-btn"
                  onClick={() => {
                    resetVideoGeneration();
                    generateVideo();
                  }}
                >
                  🔄 Try Again
                </button>
              </div>
            )}
          </div>

          {isRecording && (
            <div className="volume-panel">
              <h4>🔊 Voice Level</h4>
              <div className="volume-indicator">
                <div className="volume-bar">
                  <div 
                    className="volume-level" 
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
                <span>Volume: {Math.round(volume * 100)}%</span>
              </div>
            </div>
          )}

          {videoGeneration.videoUrl && (
            <div className="video-panel">
              <div className="video-header">
                <h4>🎬 Video Ready!</h4>
                <button 
                  className="reset-video-btn"
                  onClick={resetVideoGeneration}
                  title="Generate new video"
                >
                  🔄
                </button>
              </div>
              <div className="video-preview">
                <div className="video-thumbnail">
                  <div className="play-icon">▶️</div>
                  <span>Educational Video Generated</span>
                </div>
                <button 
                  className="watch-video-btn"
                  onClick={() => setVideoGeneration(prev => ({ ...prev, showModal: true }))}
                >
                  🎬 Watch Video
                </button>
              </div>
              <div className="video-actions">
                <a 
                  href={videoGeneration.videoUrl} 
                  download="educational-video.mp4"
                  className="download-btn"
                >
                  📥 Download
                </a>
              </div>
            </div>
          )}
        </div>

        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          style={{ display: 'none' }}
          className="screen-preview"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Video Modal */}
      {videoGeneration.showModal && videoGeneration.videoUrl && (
        <div className="video-modal-overlay" onClick={() => setVideoGeneration(prev => ({ ...prev, showModal: false }))}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>🎬 Educational Video</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setVideoGeneration(prev => ({ ...prev, showModal: false }))}
              >
                ✕
              </button>
            </div>
            <div className="video-modal-content">
              <video 
                controls 
                autoPlay
                className="modal-video"
                src={videoGeneration.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-modal-actions">
              <a 
                href={videoGeneration.videoUrl} 
                download="educational-video.mp4"
                className="download-btn"
              >
                📥 Download Video
              </a>
              <button 
                className="generate-btn"
                onClick={() => {
                  setVideoGeneration(prev => ({ ...prev, showModal: false }));
                  resetVideoGeneration();
                }}
              >
                🔄 Generate New Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachingSession;
