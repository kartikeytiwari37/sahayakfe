import React, { useState, useEffect } from 'react';
import './UdaanSession.css';

function UdaanSession({ generatedPrompt, onBackToHome }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [futurePlan, setFuturePlan] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    if (generatedPrompt && !isGenerating && !futurePlan && !error) {
      generateFuturePlan();
    }
  }, [generatedPrompt]);

  const generateFuturePlan = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);
    setCurrentStatus('Analyzing student profile...');

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 20, status: 'Creating personalized roadmap...' },
        { progress: 40, status: 'Gathering motivational content...' },
        { progress: 60, status: 'Finding local inspirations...' },
        { progress: 80, status: 'Finalizing future plan...' }
      ];

      // Update progress every 2 seconds
      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setProgress(progressSteps[i].progress);
        setCurrentStatus(progressSteps[i].status);
      }

      setProgress(90);
      setCurrentStatus('Generating beautiful HTML plan...');

      // Call the future planner API
      const response = await fetch('http://localhost:8080/api/sahayak/future-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: generatedPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate future plan: ${response.status}`);
      }

      const data = await response.json();
      
      setProgress(100);
      setCurrentStatus('Future plan ready!');
      
      setTimeout(() => {
        setFuturePlan(data);
        setIsGenerating(false);
      }, 500);

    } catch (err) {
      console.error('Error generating future plan:', err);
      setError(err.message || 'Failed to generate future plan. Please try again.');
      setIsGenerating(false);
      setProgress(0);
      setCurrentStatus('');
    }
  };

  const downloadPlan = () => {
    if (!futurePlan || !futurePlan.html_content) return;

    const blob = new Blob([futurePlan.html_content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${futurePlan.student_info?.name || 'student'}-future-plan.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    if (!futurePlan || !futurePlan.html_content) return;

    const newWindow = window.open();
    newWindow.document.write(futurePlan.html_content);
    newWindow.document.close();
  };

  const retryGeneration = () => {
    setError(null);
    setFuturePlan(null);
    generateFuturePlan();
  };

  return (
    <div className="udaan-session">
      <div className="session-header">
        <div className="session-info">
          <div className="session-avatar">🚀</div>
          <div className="session-details">
            <h2>Udaan Future Plan</h2>
            <p>Creating Inspiring Career Roadmap</p>
          </div>
        </div>
        <button className="back-to-home-btn" onClick={onBackToHome}>
          ← Back to Home
        </button>
      </div>

      <div className="session-content">
        {isGenerating && (
          <div className="generation-container">
            <div className="generation-header">
              <h3>🎯 Creating Your Future Plan</h3>
              <p>Crafting an inspiring roadmap with motivation and local inspirations...</p>
            </div>

            <div className="progress-container">
              <div className="progress-circle">
                <svg className="progress-ring" width="120" height="120">
                  <circle
                    className="progress-ring-circle-bg"
                    stroke="#e9ecef"
                    strokeWidth="8"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9C27B0" />
                      <stop offset="100%" stopColor="#E91E63" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="progress-text">
                  <span className="progress-percentage">{progress}%</span>
                </div>
              </div>
              
              <div className="progress-status">
                <h4>{currentStatus}</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="generation-features">
              <div className="feature-item">
                <span className="feature-icon">💪</span>
                <span>Motivational Content</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🗺️</span>
                <span>Step-by-step Roadmap</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌟</span>
                <span>Local Inspirations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Success Stories</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-header">
              <span className="error-icon">❌</span>
              <h3>Generation Failed</h3>
            </div>
            <div className="error-message">
              <p>{error}</p>
            </div>
            <div className="error-actions">
              <button className="retry-btn" onClick={retryGeneration}>
                🔄 Try Again
              </button>
              <button className="back-btn" onClick={onBackToHome}>
                ← Back to Home
              </button>
            </div>
          </div>
        )}

        {futurePlan && (
          <div className="plan-container">
            <div className="plan-header">
              <div className="plan-info">
                <h3>🎉 Future Plan Ready!</h3>
                <p>
                  Generated for: <strong>{futurePlan.student_info?.name}</strong> 
                  {futurePlan.student_info?.age && ` (Age: ${futurePlan.student_info.age})`}
                  {futurePlan.student_info?.location && ` from ${futurePlan.student_info.location}`}
                </p>
                <p>Career Goal: <strong>{futurePlan.student_info?.career_goal}</strong></p>
              </div>
              <div className="plan-actions">
                <button className="action-btn primary" onClick={openInNewTab}>
                  👁️ View Plan
                </button>
                <button className="action-btn secondary" onClick={downloadPlan}>
                  📥 Download HTML
                </button>
              </div>
            </div>

            <div className="plan-preview">
              <div className="preview-header">
                <h4>📋 Plan Preview</h4>
                <p>Click "View Plan" to see the full interactive version</p>
              </div>
              
              <div className="preview-content">
                <div 
                  className="html-preview"
                  dangerouslySetInnerHTML={{ __html: futurePlan.html_content }}
                />
              </div>
            </div>

            <div className="plan-stats">
              <div className="stat-item">
                <span className="stat-label">Processing Time</span>
                <span className="stat-value">{futurePlan.processing_time_seconds?.toFixed(1)}s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Plan Status</span>
                <span className="stat-value success">✅ {futurePlan.success ? 'Success' : 'Failed'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Student Grade</span>
                <span className="stat-value">{futurePlan.student_info?.current_standard || 'N/A'}</span>
              </div>
            </div>

            <div className="plan-footer">
              <button className="generate-new-btn" onClick={onBackToHome}>
                🚀 Create Another Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UdaanSession;
