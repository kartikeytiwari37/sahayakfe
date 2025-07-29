import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: '🎮',
      title: 'Fun & Interactive',
      description: 'Learning feels like playing your favorite games! 🎯',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      delay: '0.1s'
    },
    {
      id: 2,
      icon: '🤗',
      title: 'Super Friendly',
      description: 'Our AI teachers are always kind and patient with you! �',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      delay: '0.2s'
    },
    {
      id: 3,
      icon: '�',
      title: 'Earn Rewards',
      description: 'Get stars and badges when you learn new things! ⭐',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      delay: '0.3s'
    },
    {
      id: 4,
      icon: '🛡️',
      title: 'Safe Space',
      description: 'A secure place where you can learn and grow safely! 🌈',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      delay: '0.4s'
    }
  ];

  return (
    <div className="features-section-container">
      <div className="features-section-header">
        <h2 className="features-title">✨ Why kids love learning with us?</h2>
        <p className="features-subtitle">
          Discover what makes our AI teaching assistants special and loved by students everywhere
        </p>
      </div>
      
      <div className="features-grid-new">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className="feature-card-new"
            style={{ animationDelay: feature.delay }}
          >
            <div className="feature-card-inner">
              <div className="feature-icon-container">
                <div 
                  className="feature-icon-bg"
                  style={{ background: feature.gradient }}
                >
                  <span className="feature-icon-new">{feature.icon}</span>
                </div>
                <div className="feature-icon-glow"></div>
              </div>
              
              <div className="feature-content">
                <h3 className="feature-title-new">{feature.title}</h3>
                <p className="feature-description-new">{feature.description}</p>
              </div>
              
              <div className="feature-card-decoration">
                <div className="decoration-dot"></div>
                <div className="decoration-dot"></div>
                <div className="decoration-dot"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
