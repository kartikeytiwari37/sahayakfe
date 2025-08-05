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
      
      {/* Mathematical Design Element */}
      <div className="hero-math-design">
        <svg width="100%" height="35" viewBox="0 0 1200 35" fill="none" preserveAspectRatio="none">
          {/* Mathematical symbols with more spacing */}
          <text x="80" y="22" fill="#7209B7" fontSize="16" fontFamily="serif" opacity="0.7">∫</text>
          <text x="100" y="26" fill="#E91E63" fontSize="12" fontFamily="serif" opacity="0.6">dx</text>
          
          <text x="180" y="22" fill="#2D1B69" fontSize="16" fontFamily="serif" opacity="0.7">π</text>
          <text x="200" y="16" fill="#7209B7" fontSize="10" fontFamily="serif" opacity="0.5">r²</text>
          
          <text x="280" y="22" fill="#E91E63" fontSize="16" fontFamily="serif" opacity="0.7">Σ</text>
          <text x="300" y="26" fill="#2D1B69" fontSize="9" fontFamily="serif" opacity="0.5">n=1</text>
          <text x="300" y="14" fill="#7209B7" fontSize="9" fontFamily="serif" opacity="0.5">∞</text>
          
          <text x="380" y="22" fill="#7209B7" fontSize="16" fontFamily="serif" opacity="0.7">√</text>
          <line x1="395" y1="16" x2="415" y2="16" stroke="#E91E63" strokeWidth="1" opacity="0.6"/>
          <text x="400" y="26" fill="#2D1B69" fontSize="12" fontFamily="serif" opacity="0.6">x</text>
          
          <text x="480" y="22" fill="#E91E63" fontSize="16" fontFamily="serif" opacity="0.7">α</text>
          <text x="510" y="22" fill="#7209B7" fontSize="14" fontFamily="serif" opacity="0.6">β</text>
          
          <text x="580" y="22" fill="#2D1B69" fontSize="16" fontFamily="serif" opacity="0.7">∞</text>
          
          <text x="680" y="22" fill="#7209B7" fontSize="16" fontFamily="serif" opacity="0.7">θ</text>
          <text x="700" y="22" fill="#2D1B69" fontSize="12" fontFamily="serif" opacity="0.6">=</text>
          <text x="715" y="22" fill="#E91E63" fontSize="12" fontFamily="serif" opacity="0.6">sin</text>
          <text x="735" y="26" fill="#7209B7" fontSize="9" fontFamily="serif" opacity="0.5">-1</text>
          
          <text x="820" y="22" fill="#2D1B69" fontSize="16" fontFamily="serif" opacity="0.7">e</text>
          <text x="835" y="16" fill="#7209B7" fontSize="9" fontFamily="serif" opacity="0.5">iπ</text>
          <text x="850" y="22" fill="#E91E63" fontSize="12" fontFamily="serif" opacity="0.6">+1=0</text>
          
          <text x="950" y="22" fill="#E91E63" fontSize="14" fontFamily="serif" opacity="0.7">sin</text>
          <text x="980" y="22" fill="#7209B7" fontSize="14" fontFamily="serif" opacity="0.6">cos</text>
          
          <text x="1080" y="22" fill="#7209B7" fontSize="16" fontFamily="serif" opacity="0.7">λ</text>
          
          {/* Simplified geometric accents */}
          <circle cx="140" cy="17" r="2" fill="#7209B7" opacity="0.3"/>
          <circle cx="240" cy="17" r="2" fill="#E91E63" opacity="0.3"/>
          <circle cx="340" cy="17" r="2" fill="#2D1B69" opacity="0.3"/>
          <circle cx="440" cy="17" r="2" fill="#7209B7" opacity="0.3"/>
          <circle cx="540" cy="17" r="2" fill="#E91E63" opacity="0.3"/>
          <circle cx="640" cy="17" r="2" fill="#2D1B69" opacity="0.3"/>
          <circle cx="780" cy="17" r="2" fill="#7209B7" opacity="0.3"/>
          <circle cx="910" cy="17" r="2" fill="#E91E63" opacity="0.3"/>
          <circle cx="1040" cy="17" r="2" fill="#2D1B69" opacity="0.3"/>
          
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7209B7"/>
              <stop offset="50%" stopColor="#E91E63"/>
              <stop offset="100%" stopColor="#2D1B69"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
