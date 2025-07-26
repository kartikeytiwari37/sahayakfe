import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import './Udaan.css';

function Udaan({ onBackToHome, onStartUdaanSession }) {
  const [promptCreatorConnected, setPromptCreatorConnected] = useState(false);
  const [promptCreatorConnecting, setPromptCreatorConnecting] = useState(false);
  const [promptMessages, setPromptMessages] = useState([]);
  const [promptInput, setPromptInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isPromptReady, setIsPromptReady] = useState(false);
  const [currentStep, setCurrentStep] = useState('input'); // input, generating, ready
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState(''); // For accumulating streaming response
  const [isReceivingPrompt, setIsReceivingPrompt] = useState(false); // Track if we're receiving FINAL_PROMPT
  const [promptTimeout, setPromptTimeout] = useState(null); // Timeout for prompt completion

  const promptSocketRef = useRef(null);

  useEffect(() => {
    // Add initial welcome message
    addPromptMessage('system', 'Welcome to Udaan! 🚀 I\'ll help you create an inspiring future roadmap for any student. Tell me about the student and their career dreams!');
    
    // Auto-connect to prompt creator
    connectToPromptCreator();
    
    return () => {
      if (promptSocketRef.current) {
        promptSocketRef.current.close();
      }
    };
  }, []);

  const connectToPromptCreator = async () => {
    if (promptCreatorConnecting || promptCreatorConnected) return;
    
    setPromptCreatorConnecting(true);
    try {
      // Connect to WebSocket with special parameter to indicate prompt creator mode
      const socket = new SockJS('http://localhost:8080/sahayak-teacher');
      
      socket.onopen = () => {
        console.log('Connected to Udaan Prompt Creator WebSocket');
        
        // Send special initialization message to indicate this is a udaan prompt creator session
        const initMessage = {
          type: 'init',
          mode: 'udaan-prompt-creator'
        };
        socket.send(JSON.stringify(initMessage));
        
        setPromptCreatorConnected(true);
        setPromptCreatorConnecting(false);
        addPromptMessage('system', 'Connected to Udaan! Now tell me about the student and their career aspirations.');
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handlePromptCreatorMessage(data);
      };
      
      socket.onclose = () => {
        console.log('Disconnected from Udaan Prompt Creator');
        setPromptCreatorConnected(false);
        setPromptCreatorConnecting(false);
        addPromptMessage('system', 'Disconnected from Udaan prompt creator');
      };
      
      socket.onerror = (error) => {
        console.error('Udaan Prompt Creator WebSocket error:', error);
        setPromptCreatorConnecting(false);
        addPromptMessage('error', 'Connection error occurred');
      };
      
      promptSocketRef.current = socket;
    } catch (error) {
      console.error('Failed to connect to Udaan prompt creator:', error);
      setPromptCreatorConnecting(false);
      addPromptMessage('error', 'Failed to connect to Udaan prompt creator');
    }
  };

  const handlePromptCreatorMessage = (data) => {
    console.log('Received Udaan prompt creator message:', data);
    
    switch (data.type) {
      case 'connection':
        if (data.subType === 'success') {
          addPromptMessage('system', data.data);
        } else if (data.subType === 'error') {
          addPromptMessage('error', data.data);
        }
        break;
        
      case 'content':
        if (data.subType === 'text') {
          const response = data.data;
          
          // Update accumulator and messages
          setCurrentAssistantMessage(prev => {
            const newFullMessage = prev + response;
            
            // Check if we're starting to receive FINAL_PROMPT
            const isStartingPrompt = response === 'FINAL_PROMPT' || response.includes('FINAL_PROMPT');
            const hasPrompt = newFullMessage.includes('FINAL_PROMPT');
            
            // If we have FINAL_PROMPT in the message
            if (hasPrompt) {
              // Clear any existing timeout
              if (promptTimeout) {
                clearTimeout(promptTimeout);
              }
              
              // Set a timeout to process the prompt after a brief pause (to collect all parts)
              const timeoutId = setTimeout(() => {
                const promptMatch = newFullMessage.match(/FINAL_PROMPT:\s*(.*)/s);
                if (promptMatch && promptMatch[1]) {
                  const extractedPrompt = promptMatch[1].trim();
                  console.log('Final extracted prompt:', extractedPrompt);
                  setGeneratedPrompt(extractedPrompt);
                  
                  // Get the content before FINAL_PROMPT
                  const messageBeforePrompt = newFullMessage.split('FINAL_PROMPT')[0].trim();
                  
                  // Update messages to show only the part before FINAL_PROMPT
                  setPromptMessages(prevMessages => {
                    const messages = [...prevMessages];
                    const lastMessageIndex = messages.length - 1;
                    
                    if (lastMessageIndex >= 0 && messages[lastMessageIndex].type === 'assistant') {
                      messages[lastMessageIndex] = {
                        ...messages[lastMessageIndex],
                        content: messageBeforePrompt || 'Perfect! I\'ve created your student\'s future roadmap prompt.',
                        isStreaming: false
                      };
                    } else if (messageBeforePrompt) {
                      messages.push({
                        id: Date.now() + Math.random(),
                        type: 'assistant',
                        content: messageBeforePrompt,
                        timestamp: new Date().toLocaleTimeString(),
                        isStreaming: false
                      });
                    }
                    
                    return messages;
                  });
                  
                  // Add system message and automatically transition
                  setTimeout(() => {
                    addPromptMessage('system', '🎉 Amazing! Your student\'s future roadmap prompt is ready. Click "Generate Future Plan" to create their inspiring journey!');
                  }, 100);
                  
                  setIsPromptReady(true);
                  setCurrentStep('ready');
                  setIsReceivingPrompt(false);
                  setPromptTimeout(null);
                  
                  // Reset accumulator
                  setCurrentAssistantMessage('');
                }
              }, 1000); // Wait 1 second for all parts to arrive
              
              setPromptTimeout(timeoutId);
              setIsReceivingPrompt(true);
              
              // Don't update UI while receiving FINAL_PROMPT
              return newFullMessage;
            } else {
              // Normal streaming response - update UI
              setPromptMessages(prevMessages => {
                const messages = [...prevMessages];
                const lastMessageIndex = messages.length - 1;
                
                if (lastMessageIndex >= 0 && messages[lastMessageIndex].type === 'assistant' && messages[lastMessageIndex].isStreaming) {
                  messages[lastMessageIndex] = {
                    ...messages[lastMessageIndex],
                    content: newFullMessage,
                    timestamp: new Date().toLocaleTimeString()
                  };
                } else {
                  messages.push({
                    id: Date.now() + Math.random(),
                    type: 'assistant',
                    content: newFullMessage,
                    timestamp: new Date().toLocaleTimeString(),
                    isStreaming: true
                  });
                }
                
                return messages;
              });
            }
            
            return newFullMessage;
          });
        }
        break;
        
      case 'error':
        addPromptMessage('error', data.data);
        break;
        
      default:
        console.log('Unknown Udaan prompt creator message type:', data.type);
    }
  };

  const addPromptMessage = (type, content) => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    };
    setPromptMessages(prev => [...prev, message]);
  };

  const sendPromptMessage = () => {
    if (!promptInput.trim() || !promptCreatorConnected) return;
    
    // Reset the accumulator for new message
    setCurrentAssistantMessage('');
    setIsReceivingPrompt(false);
    
    // Mark any existing streaming message as complete
    setPromptMessages(prevMessages => {
      const messages = [...prevMessages];
      const lastMessageIndex = messages.length - 1;
      if (lastMessageIndex >= 0 && messages[lastMessageIndex].type === 'assistant' && messages[lastMessageIndex].isStreaming) {
        messages[lastMessageIndex].isStreaming = false;
      }
      return messages;
    });
    
    const message = {
      type: 'text',
      data: promptInput
    };
    
    promptSocketRef.current.send(JSON.stringify(message));
    addPromptMessage('teacher', promptInput);
    setPromptInput('');
    
    if (currentStep === 'input') {
      setCurrentStep('generating');
    }
  };

  const handleStartUdaanSession = () => {
    if (generatedPrompt && onStartUdaanSession) {
      onStartUdaanSession(generatedPrompt);
    }
  };

  const exampleRequests = [
    "Priya is 15 years old from Mumbai and wants to become a doctor",
    "Arjun is 12 years old from Delhi and dreams of becoming a software engineer",
    "Sneha is 16 years old from Bangalore and wants to be an astronaut",
    "Rahul is 14 years old from Chennai and aspires to be a professional cricketer",
    "Kavya is 13 years old from Pune and wants to become a wildlife photographer",
    "Aman is 17 years old from Kolkata and dreams of being a filmmaker"
  ];

  return (
    <div className="udaan">
      <div className="udaan-header">
        <div className="udaan-info">
          <div className="udaan-avatar">🚀</div>
          <div className="udaan-details">
            <h2>Udaan - Future Planner</h2>
            <p>Creating Inspiring Career Roadmaps</p>
          </div>
        </div>
        <button className="back-to-home-btn" onClick={onBackToHome}>
          ← Back to Home
        </button>
      </div>

      <div className="udaan-content">
        <div className="prompt-creator-single">
          <div className="prompt-header">
            <h3>🎯 Tell Me About The Student</h3>
            <p>Share the student's name, age, location, and career dreams. I'll create an inspiring future roadmap!</p>
          </div>

          <div className="form-group">
            <label>Step Progress</label>
            <div className="subject-tags">
              <div className={`subject-tag ${currentStep === 'input' ? 'selected' : currentStep === 'generating' || currentStep === 'ready' ? 'selected' : ''}`}>
                1. Student Info
              </div>
              <div className={`subject-tag ${currentStep === 'generating' ? 'selected' : currentStep === 'ready' ? 'selected' : ''}`}>
                2. Generate Plan
              </div>
              <div className={`subject-tag ${currentStep === 'ready' ? 'selected' : ''}`}>
                3. Ready
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Chat with Udaan</label>
            <div className="prompt-display">
              {promptMessages.map(message => (
                <div key={message.id} className={`message-item ${message.type}`}>
                  <div className="message-header">
                    <strong>
                      {message.type === 'teacher' ? 'You' : 
                       message.type === 'assistant' ? 'Udaan' : 
                       message.type === 'system' ? 'System' : 'Error'}:
                    </strong>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Your Message</label>
            <div className="input-group">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendPromptMessage()}
                placeholder="Tell me about the student: name, age, location, and career goal..."
                disabled={!promptCreatorConnected}
              />
              <button 
                onClick={sendPromptMessage} 
                disabled={!promptCreatorConnected || !promptInput.trim()}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>

          {currentStep === 'input' && (
            <div className="form-group">
              <label>💡 Example Student Profiles</label>
              <div className="examples-grid">
                {exampleRequests.map((example, index) => (
                  <div 
                    key={index} 
                    className="example-card"
                    onClick={() => setPromptInput(example)}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            {!promptCreatorConnected && (
              <button 
                className="generate-btn"
                onClick={connectToPromptCreator}
                disabled={promptCreatorConnecting}
              >
                {promptCreatorConnecting ? 'Connecting...' : 'Connect to Udaan'}
              </button>
            )}
            
            {isPromptReady && (
              <>
                <button 
                  className="start-session-btn"
                  onClick={handleStartUdaanSession}
                >
                  🎓 Generate Future Plan
                </button>
                <button 
                  className="generate-btn"
                  onClick={() => {
                    setIsPromptReady(false);
                    setCurrentStep('input');
                    setGeneratedPrompt('');
                    addPromptMessage('system', 'Let\'s create another student\'s future roadmap. Tell me about them!');
                  }}
                >
                  ✏️ Plan for Another Student
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Udaan;
