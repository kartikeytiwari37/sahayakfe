import React from 'react';
import './AgentSectionTwo.css';

const AgentSectionTwo = ({ onSelectAgent }) => {
  const agents = [
    {
      id: 'kalam-sir',
      name: 'Kalam Sir',
      description: 'Your friendly AI teacher who makes learning super fun!',
      icon: '🤖',
      status: 'Available',
      subjects: ['Math', 'Science', 'English'],
      character: '👨‍🚀',
      features: ['Voice Chat', 'Screen Share', 'Text Chat'],
      actionButton: 'Start Learning'
    },
    {
      id: 'udaan',
      name: 'Udaan',
      description: 'Create inspiring future roadmaps and career plans!',
      icon: '🚀',
      status: 'Available',
      subjects: ['Career Planning', 'Future Goals', 'Motivation'],
      character: '🎯'
    },
    {
      id: 'exam-taker',
      name: 'Exam Creator',
      description: 'AI-Powered Examination System',
      icon: '📝',
      status: 'Available',
      subjects: ['All Subjects'],
      character: '🧑‍🏫',
      actionButton: 'Try it'
    },
    {
      id: 'exam-evaluator',
      name: 'Exam Evaluator',
      description: 'AI-Powered Worksheet Evaluation System',
      icon: '📊',
      status: 'Available',
      subjects: ['All Subjects'],
      character: '👩‍💼',
      actionButton: 'Try it'
    },
    {
      id: 'science-explorer',
      name: 'Science Explorer',
      description: 'Discover amazing experiments and cool facts!',
      icon: '⚗️',
      status: 'Coming Soon',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      character: '👩‍🔬'
    },
    {
      id: 'creative-artist',
      name: 'Creative Artist',
      description: 'Express yourself through art, music, and stories!',
      icon: '🖌️',
      status: 'Coming Soon',
      subjects: ['Drawing', 'Music', 'Writing'],
      character: '👩‍🎨'
    }
  ];

  return (
    <div className="agents-section-two-container">
      <div className="agents-section-two-header">
        <h2 className="agents-title-two">Meet Your AI Learning Companions</h2>
        <p className="agents-subtitle-two">Discover personalized AI assistants designed to transform your educational journey</p>
      </div>
      
      <div className="agents-grid-two">
        {agents.map(agent => (
          <div 
            key={agent.id} 
            className={`agent-card-two ${agent.status === 'Coming Soon' ? 'coming-soon-two' : ''}`}
          >
            <div className="card-header-two">
              <div className="agent-avatar-two">
                <span className="agent-character-two">{agent.character}</span>
              </div>
              <div className="status-badge-two">
                <span className={`status-text-two ${agent.status === 'Available' ? 'available-status' : 'coming-soon-status'}`}>
                  {agent.status}
                </span>
              </div>
            </div>
            
            <div className="card-content-two">
              <h3 className="agent-name-two">{agent.name}</h3>
              <p className="agent-description-two">{agent.description}</p>
              
              <div className="agent-subjects-two">
                <div className="subjects-label">Subjects:</div>
                <div className="subjects-list">
                  {agent.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag-two">{subject}</span>
                  ))}
                </div>
              </div>
              
              {agent.features && (
                <div className="agent-features-two">
                  <div className="features-label">Features:</div>
                  <div className="features-list">
                    {agent.features.map((feature, index) => (
                      <span key={index} className="feature-tag-two">{feature}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="card-footer-two">
              {agent.status === 'Available' && (
                <button 
                  className="action-button-two"
                  onClick={() => onSelectAgent(agent.id)}
                >
                  {agent.actionButton || 'Start Learning'}
                </button>
              )}
              
              {agent.status === 'Coming Soon' && (
                <div className="coming-soon-button">
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentSectionTwo;
