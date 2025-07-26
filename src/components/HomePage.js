import React from 'react';
import './HomePage.css';

function HomePage({ onSelectAgent }) {
  const agents = [
    {
      id: 'kalam-sir',
      name: '🚀 Kalam Sir',
      description: 'Your friendly AI teacher who makes learning super fun!',
      icon: '🤖',
      color: '#8B7ED8',
      status: 'Available',
      subjects: ['Math', 'Science', 'English'],
      character: '👨‍🚀'
    },
    {
      id: 'udaan',
      name: '🌟 Udaan',
      description: 'Create inspiring future roadmaps and career plans!',
      icon: '🚀',
      color: '#E91E63',
      status: 'Available',
      subjects: ['Career Planning', 'Future Goals', 'Motivation'],
      character: '🎯'
    },
    {
      id: 'exam-taker',
      name: 'Exam Taker',
      description: 'AI-Powered Examination System',
      icon: '📝',
      color: '#FF9800',
      status: 'Available',
      subjects: ['All Subjects'],
      character: '🧑‍🏫'
    },
    {
      id: 'exam-evaluator',
      name: 'Exam Evaluator',
      description: 'AI-Powered Worksheet Evaluation System',
      icon: '📊',
      color: '#4CAF50',
      status: 'Available',
      subjects: ['All Subjects'],
      character: '👩‍💼'
    },
    {
      id: 'science-explorer',
      name: '🔬 Science Explorer',
      description: 'Discover amazing experiments and cool facts!',
      icon: '⚗️',
      color: '#81C784',
      status: 'Coming Soon',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      character: '👩‍🔬'
    },
    {
      id: 'creative-artist',
      name: '🎨 Creative Artist',
      description: 'Express yourself through art, music, and stories!',
      icon: '🖌️',
      color: '#FFB74D',
      status: 'Coming Soon',
      subjects: ['Drawing', 'Music', 'Writing'],
      character: '👩‍🎨'
    }
  ];

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Let's learn with</span>
            <br />
            <span className="gradient-text">lots of fun!</span>
          </h1>
          <p className="hero-subtitle">
            🌟 Learning with us will be fun and make you happy! 🌈
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
        <h2 className="section-title">🎪 Learning Companions</h2>
        <div className="agents-grid">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className={`agent-card ${agent.status === 'Coming Soon' ? 'disabled' : ''}`}
              onClick={() => agent.status === 'Available' && onSelectAgent(agent.id)}
            >
              <div className="agent-character">{agent.character}</div>
              <div className="agent-icon" style={{ backgroundColor: agent.color }}>
                {agent.icon}
              </div>
              <h3 className="agent-name">{agent.name}</h3>
              <p className="agent-description">{agent.description}</p>
                <div className="agent-subjects">
                  {agent.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag">{subject}</span>
                  ))}
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
              {agent.status === 'Available' && agent.id === 'exam-evaluator' && (
                <div className="agent-features">
                  <span className="feature try-it-button" onClick={() => onSelectAgent(agent.id)}>📊 Try it</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">🌟 Why kids love learning with us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Fun & Interactive</h3>
            <p>Learning feels like playing your favorite games! 🎯</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤗</div>
            <h3>Super Friendly</h3>
            <p>Our AI teachers are always kind and patient with you! 💝</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Earn Rewards</h3>
            <p>Get stars and badges when you learn new things! ⭐</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Safe Space</h3>
            <p>A secure place where you can learn and grow safely! 🌈</p>
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
