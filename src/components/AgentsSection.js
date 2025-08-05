import React from 'react';
import './AgentsSection.css';

const AgentsSection = ({ onSelectAgent }) => {
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
    <div className="agents-section-container">
      <div className="agents-section-header">
        <h2 className="agents-title">Sahayak AI Assistants</h2>
        <p className="agents-subtitle">Choose your specialized AI assistant to enhance your educational experience</p>
      </div>
      
      <div className="agents-grid">
        {agents.map(agent => (
          <div 
            key={agent.id} 
            className={`agent-card-new ${agent.status === 'Coming Soon' ? 'coming-soon' : ''}`}
            onClick={() => agent.status === 'Available' && onSelectAgent(agent.id)}
          >
            <div className="agent-card-header">
              <div className="agent-avatar">
                <span className="agent-character">{agent.character}</span>
              </div>
              <div className="agent-status">
                <span className={`status-badge ${agent.status === 'Available' ? 'available' : 'coming-soon'}`}>
                  {agent.status}
                </span>
              </div>
            </div>
            
            <div className="agent-card-body">
              <h3 className="agent-name-new">{agent.name}</h3>
              <p className="agent-description-new">{agent.description}</p>
              
              <div className="agent-subjects-new">
                {agent.subjects.map((subject, index) => (
                  <span key={index} className="subject-tag-new">{subject}</span>
                ))}
              </div>
            </div>
            
            <div className="agent-card-footer">
              {agent.features && (
                <div className="agent-features-new">
                  {agent.features.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              )}
              
              {agent.actionButton && agent.status === 'Available' && (
                <button 
                  className="action-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAgent(agent.id);
                  }}
                >
                  {agent.actionButton}
                </button>
              )}
              
              {agent.status === 'Available' && !agent.features && !agent.actionButton && (
                <button 
                  className="start-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAgent(agent.id);
                  }}
                >
                  Start Learning
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsSection;
