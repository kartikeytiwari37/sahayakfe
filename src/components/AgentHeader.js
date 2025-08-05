import React from 'react';
import './AgentHeader.css';

const AgentHeader = ({ 
  agentName, 
  agentDescription, 
  agentIcon, 
  onBackToHome, 
  backButtonText = "← Back to Home",
  showBackButton = true 
}) => {
  return (
    <div className="agent-header">
      {showBackButton && (
        <button className="back-to-home-button" onClick={onBackToHome}>
          {backButtonText}
        </button>
      )}
      
      <div className="agent-header-content">
        <div className="agent-header-icon">
          <span className="agent-icon-large">{agentIcon}</span>
        </div>
        <div className="agent-header-info">
          <h1 className="agent-header-title">{agentName}</h1>
          <p className="agent-header-description">{agentDescription}</p>
        </div>
      </div>
      
      {/* <div className="agent-header-decoration">
        <div className="decoration-dot"></div>
        <div className="decoration-dot"></div>
        <div className="decoration-dot"></div>
      </div> */}
    </div>
  );
};

export default AgentHeader;
