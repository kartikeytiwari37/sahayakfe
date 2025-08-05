import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import AgentHeader from './AgentHeader';
import './KalamSir.css';

function KalamSir({ onBackToHome, onStartTeaching }) {
  const [promptCreatorConnected, setPromptCreatorConnected] = useState(false);
  const [promptCreatorConnecting, setPromptCreatorConnecting] = useState(false);
  const [promptMessages, setPromptMessages] = useState([]);
  const [promptInput, setPromptInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isPromptReady, setIsPromptReady] = useState(false);
  const [currentStep, setCurrentStep] = useState('input'); // input, generating, ready
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState(''); // For accumulating streaming response
  const [isReceivingPrompt, setIsReceivingPrompt] = useState(false); // Track if we're receiving FINAL_PROMPT
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false); // Track if user has sent at least one message

  const promptSocketRef = useRef(null);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    // Add initial welcome message
    addPromptMessage('system', 'Welcome to Kalam Sir! I\'ll help you create the perfect teaching assistant. Tell me what kind of teaching assistant you need.');
    
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
      const socket = new SockJS('https://sahayak-backend-199913799544.us-central1.run.app/sahayak-teacher');
      
      socket.onopen = () => {
        console.log('Connected to Prompt Creator WebSocket');
        
        // Send special initialization message to indicate this is a prompt creator session
        const initMessage = {
          type: 'init',
          mode: 'prompt-creator'
        };
        socket.send(JSON.stringify(initMessage));
        
        setPromptCreatorConnected(true);
        setPromptCreatorConnecting(false);
        addPromptMessage('system', 'Connected to Kalam Sir! Now tell me about your teaching requirements.');
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handlePromptCreatorMessage(data);
      };
      
      socket.onclose = () => {
        console.log('Disconnected from Prompt Creator');
        setPromptCreatorConnected(false);
        setPromptCreatorConnecting(false);
        addPromptMessage('system', 'Disconnected from prompt creator');
      };
      
      socket.onerror = (error) => {
        console.error('Prompt Creator WebSocket error:', error);
        setPromptCreatorConnecting(false);
        addPromptMessage('error', 'Connection error occurred');
      };
      
      promptSocketRef.current = socket;
    } catch (error) {
      console.error('Failed to connect to prompt creator:', error);
      setPromptCreatorConnecting(false);
      addPromptMessage('error', 'Failed to connect to prompt creator');
    }
  };

  const handlePromptCreatorMessage = (data) => {
    console.log('Received prompt creator message:', data);
    
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
              // Check if we have a complete prompt
              const promptMatch = newFullMessage.match(/FINAL_PROMPT:\s*(.*)/s);
              if (promptMatch && promptMatch[1] && 
                  (response.includes('\n') || response.endsWith('.') || response.endsWith('.\n'))) {
                
                const extractedPrompt = promptMatch[1].trim();
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
                      content: messageBeforePrompt || 'Perfect! I\'ve created your teaching assistant.',
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
                  addPromptMessage('system', '🎉 Perfect! Your teaching assistant is ready. Click "Start Teaching Session" to begin!');
                }, 100);
                
                setIsPromptReady(true);
                setCurrentStep('ready');
                setIsReceivingPrompt(false);
                
                // Return empty string to reset accumulator
                return '';
              } else if (isStartingPrompt) {
                // We're starting to receive FINAL_PROMPT, set the flag
                setIsReceivingPrompt(true);
                // Don't update UI
                return newFullMessage;
              } else {
                // Still receiving FINAL_PROMPT parts, don't update UI
                return newFullMessage;
              }
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
                
                // Auto-scroll to bottom when assistant message is updated
                setTimeout(() => {
                  if (chatMessagesRef.current) {
                    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
                  }
                }, 50);
                
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
        console.log('Unknown prompt creator message type:', data.type);
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
    
    // Auto-scroll to bottom when new message is added
    setTimeout(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }, 100);
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
    setHasUserSentMessage(true); // Mark that user has sent a message
    
    if (currentStep === 'input') {
      setCurrentStep('generating');
    }
  };

  const handleStartTeaching = () => {
    if (generatedPrompt && onStartTeaching) {
      onStartTeaching(generatedPrompt);
    }
  };

  const exampleRequests = [
    "I want a teaching assistant to help children learn about space and rockets",
    "Create an assistant for teaching basic mathematics to 5th grade students",
    "I need help teaching English grammar to high school students",
    "Make an assistant for teaching science experiments to middle school kids"
  ];

  return (
    <div className="kalam-sir">
      <AgentHeader
        agentName="Kalam Sir"
        agentDescription="Virtual Teaching Assistant Creator"
        agentIcon="👨‍🚀"
        onBackToHome={onBackToHome}
        backButtonText="← Back to Home"
      />

      <div className="kalam-content">
        <div className="content-wrapper">
          {/* Progress Section */}
          <div className="progress-section">
            <h2 className="section-title">Create Your Teaching Assistant</h2>
            <div className="progress-steps">
              <div className={`progress-step ${currentStep === 'input' || currentStep === 'generating' || currentStep === 'ready' ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <span>Describe</span>
              </div>
              <div className={`progress-step ${currentStep === 'generating' || currentStep === 'ready' ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <span>Generate</span>
              </div>
              <div className={`progress-step ${currentStep === 'ready' ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <span>Ready</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="main-content-grid">
            {/* Chat Section */}
            <div className="chat-section">
              <div className="chat-header">
                <h3>💬 Chat with Kalam Sir</h3>
                <div className="connection-status">
                  <div className={`status-dot ${promptCreatorConnected ? 'connected' : 'disconnected'}`}></div>
                  <span>{promptCreatorConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
              
              <div className="chat-messages" ref={chatMessagesRef}>
                {promptMessages.map(message => (
                  <div key={message.id} className={`chat-message ${message.type === "teacher" ? "user" : message.type}`}>
                    <div className="message-avatar">
                      {message.type === 'teacher' ? '👤' : 
                       message.type === 'assistant' ? '👨‍🚀' : 
                       message.type === 'system' ? '⚙️' : '❌'}
                    </div>
                    <div className="message-content">
                      <div className="message-sender">
                        {message.type === 'teacher' ? 'You' : 
                         message.type === 'assistant' ? 'Kalam Sir' : 
                         message.type === 'system' ? 'System' : 'Error'}
                        <span className="message-timestamp">{message.timestamp}</span>
                      </div>
                      <div className="message-text">{message.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-section">
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendPromptMessage()}
                    placeholder="Describe what kind of teaching assistant you need..."
                    disabled={!promptCreatorConnected}
                    className="chat-input"
                  />
                  <button 
                    onClick={sendPromptMessage} 
                    disabled={!promptCreatorConnected || !promptInput.trim()}
                    className="send-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Section - Hide after user sends first message */}
            {!hasUserSentMessage && (
              <div className="sidebar-section">
                {/* Example Requests */}
                {currentStep === 'input' && (
                  <div className="examples-section">
                    <h4 className="sidebar-title">💡 Example Requests</h4>
                    <div className="examples-list">
                      {exampleRequests.map((example, index) => (
                        <div 
                          key={index} 
                          className="example-item"
                          onClick={() => setPromptInput(example)}
                        >
                          <div className="example-icon">💭</div>
                          <div className="example-text">{example}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!promptCreatorConnected && 
                  <div className="actions-section">
                      <button 
                        className="action-button primary"
                        onClick={connectToPromptCreator}
                        disabled={promptCreatorConnecting}
                      >
                        {promptCreatorConnecting ? 'Connecting...' : 'Connect to Kalam Sir'}
                      </button>
                  </div>
                }
              </div>
            )}

            {/* Action Buttons for Ready State - Show even after first message */}
            {hasUserSentMessage && isPromptReady && (
              <div className="sidebar-section">
                <div className="actions-section">
                  <div className="ready-actions">
                    <button 
                      className="action-button success"
                      onClick={handleStartTeaching}
                    >
                      🎓 Start Teaching Session
                    </button>
                    <button 
                      className="action-button secondary"
                      onClick={() => {
                        setIsPromptReady(false);
                        setCurrentStep('input');
                        setGeneratedPrompt('');
                        setHasUserSentMessage(false); // Reset to show sidebar again
                        addPromptMessage('system', 'Let\'s modify your teaching assistant. What changes would you like to make?');
                      }}
                    >
                      ✏️ Modify Requirements
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KalamSir;
