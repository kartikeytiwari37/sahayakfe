import React from 'react';
import './Hero.css';

const Hero = () => {
  const scrollToAgents = () => {
    const agentsSection = document.querySelector('.agents-section-container');
    if (agentsSection) {
      agentsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('.features-section-container');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <div className="hero-container">
      
      <div className="hero-content-wrapper">
        <div className="hero-left">
          <div className="hero-badge">
            AI-Powered Education Platform
          </div>
          
          <h1 className="hero-main-title">
            Welcome to<br />
            <span className="highlight-text">Sahayak</span><br />
            Your AI Teaching Assistant
          </h1>
          
          <div className="hero-buttons">
            <button className="btn-primary" onClick={scrollToAgents}>Start Learning</button>
            <button className="btn-secondary" onClick={scrollToFeatures}>Explore Features</button>
          </div>
          
          <div className="hero-stats-new">
            <div className="stat-item">
              <div className="stat-icon">🎓</div>
              <div className="stat-info">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Available</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">∞</div>
              <div className="stat-info">
                <span className="stat-number">∞</span>
                <span className="stat-label">Patience</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🧠</div>
              <div className="stat-info">
                <span className="stat-number">AI</span>
                <span className="stat-label">Powered</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-right">
          <div className="hero-visual-container">
            <svg className="main-illustration" width="350" height="350" viewBox="0 0 350 350" fill="none">
              {/* Soft background circle */}
              <circle cx="175" cy="175" r="150" fill="url(#bgGradient)" opacity="0.08"/>
              
              {/* Central learning symbol */}
              <circle cx="175" cy="175" r="60" fill="none" stroke="url(#primaryGradient)" strokeWidth="3" opacity="0.6"/>
              <circle cx="175" cy="175" r="40" fill="none" stroke="url(#secondaryGradient)" strokeWidth="2" opacity="0.4"/>
              
              {/* Elegant book icon */}
              <rect x="155" y="160" width="40" height="30" rx="3" fill="none" stroke="#7209B7" strokeWidth="2" opacity="0.7"/>
              <line x1="160" y1="165" x2="190" y2="165" stroke="#7209B7" strokeWidth="1" opacity="0.5"/>
              <line x1="160" y1="170" x2="185" y2="170" stroke="#7209B7" strokeWidth="1" opacity="0.5"/>
              <line x1="160" y1="175" x2="190" y2="175" stroke="#7209B7" strokeWidth="1" opacity="0.5"/>
              
              {/* Minimalist graduation cap */}
              <path d="M175 140 L195 148 L175 156 L155 148 Z" fill="#2D1B69" opacity="0.8"/>
              <rect x="173" y="135" width="4" height="12" fill="#2D1B69" opacity="0.8"/>
              <circle cx="177" cy="135" r="2" fill="#E91E63" opacity="0.9"/>
              
              {/* Simple growth elements */}
              <circle cx="220" cy="130" r="8" fill="#81C784" opacity="0.6"/>
              <circle cx="225" cy="120" r="5" fill="#81C784" opacity="0.4"/>
              <circle cx="215" cy="115" r="3" fill="#81C784" opacity="0.3"/>
              
              {/* Elegant connecting dots */}
              <circle cx="130" cy="200" r="3" fill="#F4A261" opacity="0.7"/>
              <circle cx="140" cy="210" r="2" fill="#F4A261" opacity="0.5"/>
              <circle cx="150" cy="220" r="1.5" fill="#F4A261" opacity="0.4"/>
              
              <circle cx="220" cy="220" r="3" fill="#E91E63" opacity="0.7"/>
              <circle cx="210" cy="230" r="2" fill="#E91E63" opacity="0.5"/>
              <circle cx="200" cy="240" r="1.5" fill="#E91E63" opacity="0.4"/>
              
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7209B7"/>
                  <stop offset="100%" stopColor="#E91E63"/>
                </linearGradient>
                <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7209B7"/>
                  <stop offset="100%" stopColor="#E91E63"/>
                </linearGradient>
                <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F4A261"/>
                  <stop offset="100%" stopColor="#E76F51"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
