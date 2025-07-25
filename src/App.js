import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import HomePage from './components/HomePage';
import KalamSir from './components/KalamSir';
import TeachingSession from './components/TeachingSession';
import './App.css';
import ExamCreator from './ExamCreator';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentView, setCurrentView] = useState('home'); // home, kalam-sir, teaching-session
  const [customPrompt, setCustomPrompt] = useState('');

  const handleSelectAgent = (agentId) => {
    if (agentId === 'kalam-sir') {
      setCurrentView('kalam-sir');
    } else if (agentId === 'exam-taker') {
      setCurrentView('exam-creator');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCustomPrompt('');
  };

  const handleStartTeaching = (generatedPrompt) => {
    setCustomPrompt(generatedPrompt);
    setCurrentView('teaching-session');
  };

  if (currentView === 'home') {
    return <HomePage onSelectAgent={handleSelectAgent} />;
  }

  if (currentView === 'kalam-sir') {
    return (
      <KalamSir
        onBackToHome={handleBackToHome}
        onStartTeaching={handleStartTeaching}
      />
    );
  }

  if (currentView === 'teaching-session') {
    return (
      <TeachingSession
        customPrompt={customPrompt}
        onBackToHome={handleBackToHome}
      />
    );
  }

  if (currentView === 'exam-creator') {
    return <ExamCreator onBackToHome={handleBackToHome} />;
  }

  return null;
}

function OldApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingAudioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Connect to WebSocket
  const connectToTeacher = async () => {
    if (connecting || connected) return;
    
    setConnecting(true);
    try {
      const socket = new SockJS('https://sahayak-backend-199913799544.us-central1.run.app/sahayak-teacher');
      
      socket.onopen = () => {
        console.log('Connected to Sahayak Teacher');
        setConnected(true);
        setConnecting(false);
        addMessage('system', 'Connected to AI Teacher');
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

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    stopRecording();
    stopScreenShare();
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
          addMessage('teacher', data.data);
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
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, message]);
  };

  const sendTextMessage = () => {
    if (!inputText.trim() || !connected) return;
    
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
      
      // Set recording state first
      setIsRecording(true);
      
      // Start volume monitoring
      monitorVolume();
      
      // Use ScriptProcessorNode for continuous PCM streaming (Gemini expects raw PCM)
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      let audioBuffer = [];
      const CHUNK_SIZE = 16000; // 1 second of audio at 16kHz
      let isStreamingActive = true;
      
      scriptProcessor.onaudioprocess = (event) => {
        if (!isStreamingActive) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert float32 to int16 PCM (Gemini format)
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        // Add to buffer
        audioBuffer.push(...pcmData);
        
        // Send chunks continuously when buffer reaches threshold
        if (audioBuffer.length >= CHUNK_SIZE) {
          const chunkToSend = new Int16Array(audioBuffer.splice(0, CHUNK_SIZE));
          
          // Convert to base64 and send immediately
          const uint8Array = new Uint8Array(chunkToSend.buffer);
          const base64Audio = btoa(String.fromCharCode.apply(null, uint8Array));
          
          console.log('Sending PCM audio chunk, size:', base64Audio.length);
          
          if (connected && socketRef.current) {
            const message = {
              type: 'audio',
              data: base64Audio
            };
            socketRef.current.send(JSON.stringify(message));
          }
        }
      };
      
      // Connect the audio processing chain
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      // Store references for cleanup
      mediaRecorderRef.current = {
        scriptProcessor,
        stream,
        source,
        isStreamingActive,
        stop: () => {
          isStreamingActive = false;
          
          // Send any remaining audio in buffer
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
          
          // Cleanup
          scriptProcessor.disconnect();
          source.disconnect();
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      addMessage('system', 'Continuous conversation started - speak anytime!');
      console.log('Continuous audio streaming started');
      
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
      addMessage('system', 'Recording stopped');
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
      // Get screen + audio stream (like Live API console)
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true // Include system audio
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsScreenSharing(true);
      addMessage('system', 'Screen sharing with audio started - continuous streaming!');
      
      // Start continuous audio streaming if not already started
      if (!isRecording) {
        await startRecording();
      }
      
      // Continuous video frame streaming with detailed debugging
      const sendVideoFrameContinuously = () => {
        console.log('🔍 sendVideoFrameContinuously called');
        
        // Check if stream is still active (more reliable than state)
        const isStreamActive = streamRef.current && streamRef.current.active;
        console.log('🔍 streamRef.current.active:', isStreamActive);
        console.log('🔍 isScreenSharing (state):', isScreenSharing);
        console.log('🔍 canvasRef.current:', !!canvasRef.current);
        console.log('🔍 videoRef.current:', !!videoRef.current);
        console.log('🔍 streamRef.current:', !!streamRef.current);
        console.log('🔍 connected:', connected);
        console.log('🔍 socketRef.current:', !!socketRef.current);
        
        // Use stream active state instead of React state (fixes closure issue)
        if (!isStreamActive || !canvasRef.current || !videoRef.current || !streamRef.current) {
          console.log('❌ Stopping video streaming - stream inactive or refs missing');
          return;
        }
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        console.log('🔍 video.videoWidth:', video.videoWidth);
        console.log('🔍 video.videoHeight:', video.videoHeight);
        
        // Validate video dimensions before processing
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.log('❌ Video not ready, skipping frame');
          return;
        }
        
        // Set canvas size exactly like Live API console
        canvas.width = video.videoWidth * 0.25;
        canvas.height = video.videoHeight * 0.25;
        
        console.log('🔍 canvas.width:', canvas.width);
        console.log('🔍 canvas.height:', canvas.height);
        
        if (canvas.width > 0 && canvas.height > 0) {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 1.0); // Max quality like Live API console
            
            // Extract base64 data (remove data:image/jpeg;base64, prefix)
            const data = base64Image.slice(base64Image.indexOf(",") + 1, Infinity);
            
            console.log('🔍 data.length:', data.length);
            console.log('🔍 data && data.length > 1000:', data && data.length > 1000);
            console.log('🔍 connected:', connected);
            console.log('🔍 socketRef.current:', !!socketRef.current);
            
            // Validate base64 image before sending
            if (data && data.length > 1000 && connected && socketRef.current) {
              const message = {
                type: 'video',
                data: data // Send clean base64 data like Live API console
              };
              socketRef.current.send(JSON.stringify(message));
              console.log('✅ Sending video frame (Live API format), size:', data.length, 'dimensions:', canvas.width, 'x', canvas.height);
            } else {
              console.log('❌ Invalid video frame, skipping - data.length:', data?.length, 'connected:', connected, 'socket:', !!socketRef.current);
            }
          } catch (error) {
            console.error('❌ Error capturing video frame:', error);
          }
        } else {
          console.log('❌ Canvas dimensions invalid:', canvas.width, 'x', canvas.height);
        }
      };
      
      // Debug video loading and start frame streaming
      console.log('🔍 Setting up video loading handlers');
      console.log('🔍 videoRef.current:', !!videoRef.current);
      
      // Start frame streaming exactly like Live API console (requestAnimationFrame + setTimeout)
      console.log('🔄 Starting frame streaming like Live API console');
      
      let timeoutId = -1;
      const sendVideoFrame = () => {
        sendVideoFrameContinuously();
        if (connected && streamRef.current && streamRef.current.active) {
          timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5); // 2000ms like Live API console
        }
      };
      
      // Start with requestAnimationFrame like Live API console
      requestAnimationFrame(sendVideoFrame);
      
      // Store timeout reference for cleanup
      streamRef.current.frameTimeout = timeoutId;
      
      if (videoRef.current) {
        // Add event listeners for debugging (but don't rely on them)
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video onloadedmetadata fired');
        };
        
        videoRef.current.onloadeddata = () => {
          console.log('✅ Video onloadeddata fired');
        };
        
        videoRef.current.oncanplay = () => {
          console.log('✅ Video oncanplay fired');
        };
        
        videoRef.current.onplay = () => {
          console.log('✅ Video onplay fired');
        };
        
        console.log('🔍 Video event listeners set up');
      } else {
        console.log('❌ videoRef.current is null!');
      }
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        console.log('Screen sharing ended by user');
        stopScreenShare();
      };
      
    } catch (error) {
      console.error('Error starting screen share:', error);
      addMessage('error', 'Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      // Clear the frame interval
      if (streamRef.current.frameInterval) {
        clearInterval(streamRef.current.frameInterval);
      }
      
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScreenSharing(false);
    addMessage('system', 'Screen sharing stopped');
    console.log('Screen sharing and continuous frame streaming stopped');
  };

  // Audio streaming setup
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);

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
      
      // Convert raw PCM data to AudioBuffer
      const pcmData = new Int16Array(arrayBuffer);
      const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert 16-bit PCM to float32 (-1 to 1 range)
      for (let i = 0; i < pcmData.length; i++) {
        channelData[i] = pcmData[i] / 32768.0;
      }
      
      // Schedule audio to play seamlessly
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      // Calculate when to start this chunk
      const now = audioContextRef.current.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      
      source.start(startTime);
      
      // Update next play time for seamless playback
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
      
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Navigate to Exam Creator page
  const navigateToExamCreator = () => {
    setCurrentPage('examCreator');
  };

  // Navigate to Home page
  const navigateToHome = () => {
    setCurrentPage('home');
  };

  // Render based on current page
  if (currentPage === 'examCreator') {
    return <ExamCreator />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎓 Sahayak - AI Teacher</h1>
        <div className="connection-status">
          {connected ? (
            <span className="status connected">● Connected</span>
          ) : (
            <span className="status disconnected">● Disconnected</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="chat-container">
          <div className="messages">
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

          <div className="input-area">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="Ask your teacher a question..."
              disabled={!connected}
            />
            <button onClick={sendTextMessage} disabled={!connected || !inputText.trim()}>
              Send
            </button>
          </div>
        </div>

        <div className="controls">
          <div className="connection-controls">
            {!connected ? (
              <button 
                onClick={connectToTeacher} 
                disabled={connecting}
                className="connect-btn"
              >
                {connecting ? 'Connecting...' : 'Connect to Teacher'}
              </button>
            ) : (
              <button onClick={disconnect} className="disconnect-btn">
                Disconnect
              </button>
            )}
          </div>

          <div className="media-controls">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!connected}
              className={`media-btn ${isRecording ? 'recording' : ''}`}
            >
              {isRecording ? '🛑 End Conversation' : '🎤 Start Conversation'}
            </button>

            <button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              disabled={!connected}
              className={`media-btn ${isScreenSharing ? 'sharing' : ''}`}
            >
              {isScreenSharing ? '📱 Stop Sharing' : '📺 Share Screen'}
            </button>
          </div>

          {isRecording && (
            <div className="volume-indicator">
              <div className="volume-bar">
                <div 
                  className="volume-level" 
                  style={{ width: `${volume * 100}%` }}
                ></div>
              </div>
              <span>Volume: {Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>

        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          style={{ display: isScreenSharing ? 'block' : 'none', maxWidth: '300px' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </main>
    </div>
  );
}

export default App;
