import React from 'react';
import './HomePage.css';

function HomePage({ onSelectAgent }) {
  const agents = [
    {
      id: 'kalam-sir',
      name: 'Kalam Sir',
      description: 'Virtual Teaching Assistant Creator',
      icon: '🚀',
      color: '#4CAF50',
      status: 'Available'
    },
    {
      id: 'exam-taker',
      name: 'Exam Taker',
      description: 'AI-Powered Examination System',
      icon: '📝',
      color: '#FF9800',
      status: 'Available'
    },
    {
      id: 'evaluator',
      name: 'Evaluator',
      description: 'Intelligent Assessment Tool',
      icon: '📊',
      color: '#2196F3',
      status: 'Coming Soon'
    },
    {
      id: 'tutor',
      name: 'Personal Tutor',
      description: 'One-on-One Learning Assistant',
      icon: '👨‍🏫',
      color: '#9C27B0',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Sahayak</span>
            <br />
            Teaching Assistant
          </h1>
          <p className="hero-subtitle">
            Empowering Education with AI-Powered Learning Companions
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Patience</span>
            </div>
            <div className="stat">
              <span className="stat-number">🧠</span>
              <span className="stat-label">AI Powered</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-elements">
            <div className="floating-element">🎓</div>
            <div className="floating-element">📚</div>
            <div className="floating-element">🔬</div>
            <div className="floating-element">🎨</div>
            <div className="floating-element">🌟</div>
          </div>
        </div>
      </div>

      <div className="agents-section">
        <h2 className="section-title">Choose Your Learning Companion</h2>
        <div className="agents-grid">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className={`agent-card ${agent.status === 'Coming Soon' ? 'disabled' : ''}`}
              onClick={() => agent.status === 'Available' && onSelectAgent(agent.id)}
            >
              <div className="agent-icon" style={{ backgroundColor: agent.color }}>
                {agent.icon}
              </div>
              <h3 className="agent-name">{agent.name}</h3>
              <p className="agent-description">{agent.description}</p>
              <div className={`agent-status ${agent.status.toLowerCase().replace(' ', '-')}`}>
                {agent.status}
              </div>
              {agent.status === 'Available' && agent.id === 'kalam-sir' && (
                <div className="agent-features">
                  <span className="feature">🎤 Voice Chat</span>
                  <span className="feature">📺 Screen Share</span>
                  <span className="feature">💬 Text Chat</span>
                </div>
              )}
              {agent.status === 'Available' && agent.id === 'exam-taker' && (
                <div className="agent-features">
                  <span className="feature try-it-button" onClick={() => onSelectAgent(agent.id)}>🚀 Try it</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Why Choose Sahayak?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Learning</h3>
            <p>AI adapts to your learning style and pace for optimal education experience</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Multilingual Support</h3>
            <p>Learn in your preferred language with native accent support</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Interaction</h3>
            <p>Instant responses with voice, video, and screen sharing capabilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Safe & Secure</h3>
            <p>Your learning data is protected with enterprise-grade security</p>
          </div>
        </div>
      </div>

      <footer className="homepage-footer">
        <p>© 2025 Sahayak Teaching Assistant. Empowering minds, one lesson at a time.</p>
      </footer>
    </div>
  );
}

export default HomePage;
