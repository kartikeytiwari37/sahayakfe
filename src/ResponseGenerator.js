import React from 'react';

// Helper function to determine the exam type from the API response
export const getExamTypeFromResponse = (examData) => {
  if (!examData) return null;
  
  // Check if it's explicitly set in the examType field
  if (examData.examType === "SHORT_ANSWER") {
    return "SHORT_ANSWER";
  }
  
  // Check if it's a True-False exam
  if (examData.examType === "True-False" || 
      (examData.questions && examData.questions.length > 0 && 
       examData.questions[0].options === null && 
       (examData.questions[0].correctAnswer === "True" || 
        examData.questions[0].correctAnswer === "False"))) {
    return "TRUE_FALSE";
  }
  
  // Check if it's an Essay exam
  if (examData.examType === "ESSAY" || 
      (examData.questions && examData.questions.length > 0 && 
       Array.isArray(examData.questions[0].options) && 
       examData.questions[0].options.length === 0 && 
       examData.questions[0].correctAnswer === "null")) {
    return "ESSAY";
  }
  
  // Check if it's a Short Answer exam (options is null but answer is not True/False)
  if (examData.questions && examData.questions.length > 0 && 
      examData.questions[0].options === null && 
      examData.questions[0].correctAnswer !== "True" && 
      examData.questions[0].correctAnswer !== "False") {
    return "SHORT_ANSWER";
  }
  
  // Default to multiple choice
  return "MULTIPLE_CHOICE";
};

// Component to render the exam result
export const ExamResult = ({ result, activeQuestion, handleQuestionChange, generateExamPDF, displayExplanation }) => {
  if (!result) return null;
  
  return (
    <div className="result-container">
      <h3>Generated Exam: {result.examData.subject} - {result.examData.gradeLevel}</h3>
      
      <div className="exam-info">
        <div className="exam-info-item">
          <span className="info-label">Subject:</span> 
          <span className="info-value">{result.examData.subject}</span>
        </div>
        <div className="exam-info-item">
          <span className="info-label">Grade Level:</span> 
          <span className="info-value">{result.examData.gradeLevel}</span>
        </div>
        <div className="exam-info-item">
          <span className="info-label">Exam Type:</span> 
          <span className="info-value">
            {(() => {
              switch(result.examData.examType) {
                case 'MULTIPLE_CHOICE': return 'Multiple Choices';
                case 'TRUE_FALSE': return 'True/False';
                case 'SHORT_ANSWER': return 'Short Answer Questions';
                case 'ESSAY': return 'Essay Questions';
                case 'MIXED': return 'Mixed';
                default: return result.examData.examType;
              }
            })()}
          </span>
        </div>
        <div className="exam-info-item">
          <span className="info-label">Questions:</span> 
          <span className="info-value">{result.examData.questions.length}</span>
        </div>
      </div>
      
      <div className="question-navigation">
        {result.examData.questions.map((_, index) => (
          <button 
            key={index}
            className={`question-nav-button ${activeQuestion === index ? 'active' : ''}`}
            onClick={() => handleQuestionChange(index)}
            aria-label={`Question ${index + 1}`}
            aria-current={activeQuestion === index ? 'true' : 'false'}
          >
            {index + 1}
          </button>
        ))}
      </div>
      
      <div className="exam-result">
        {result.examData.questions.length > 0 && (
          <div 
            className="question-card" 
            key={`question-${activeQuestion}`}
            data-question-index={activeQuestion}
          >
            <div className="question-number">Question {activeQuestion + 1} of {result.examData.questions.length}</div>
            
            {/* Display subsection header for MIXED exam type */}
            {result.examData.examType === "MIXED" && (
              <div className="subsection-header">
                {(() => {
                  const questionType = result.examData.questions[activeQuestion].questionType;
                  switch(questionType) {
                    case 'MULTIPLE_CHOICE': return 'Multiple Choices';
                    case 'TRUE_FALSE': return 'True/False';
                    case 'SHORT_ANSWER': return 'Short Answer';
                    case 'ESSAY': return 'Essay';
                    default: return questionType;
                  }
                })()}
              </div>
            )}
            
            <div className="question-text">{result.examData.questions[activeQuestion].questionText}</div>
            
            {/* Determine the question type and render appropriate UI */}
            {(() => {
              // For MIXED exam type, use the question's type
              const questionType = result.examData.examType === "MIXED" 
                ? result.examData.questions[activeQuestion].questionType 
                : getExamTypeFromResponse(result.examData);
              
              if (questionType === "TRUE_FALSE") {
                // True-False question UI
                return (
                  <div className="true-false-options">
                    <div 
                      className={`option-item ${result.examData.questions[activeQuestion].correctAnswer === "True" ? 'correct' : ''}`}
                    >
                      <span className="option-marker">A.</span>
                      <span className="option-text">True</span>
                      {result.examData.questions[activeQuestion].correctAnswer === "True" && (
                        <span className="correct-marker">✓</span>
                      )}
                    </div>
                    <div 
                      className={`option-item ${result.examData.questions[activeQuestion].correctAnswer === "False" ? 'correct' : ''}`}
                    >
                      <span className="option-marker">B.</span>
                      <span className="option-text">False</span>
                      {result.examData.questions[activeQuestion].correctAnswer === "False" && (
                        <span className="correct-marker">✓</span>
                      )}
                    </div>
                  </div>
                );
              } else if (questionType === "ESSAY") {
                // Essay question UI
                return (
                  <div className="essay-question">
                    <div className="essay-prompt">
                      <p>This is an essay question. Students should write a detailed response addressing the prompt above.</p>
                    </div>
                    <div className="essay-answer correct">
                      <div className="answer-label">Model Answer:</div>
                      <div className="answer-text">{result.examData.questions[activeQuestion].correctAnswer}</div>
                    </div>
                  </div>
                );
              } else if (questionType === "SHORT_ANSWER") {
                // Short Answer question UI
                return (
                  <div className="short-answer-question">
                    <div className="short-answer-prompt">
                      <p>This is a short answer question. Students should write a brief, specific response.</p>
                    </div>
                    <div className="short-answer correct">
                      <div className="answer-label">Correct Answer:</div>
                      <div className="answer-text">{result.examData.questions[activeQuestion].correctAnswer}</div>
                    </div>
                    <div className="answer-space">
                      <div className="answer-line"></div>
                    </div>
                  </div>
                );
              } else {
                // Multiple Choice question UI (default)
                return (
                  <div className="options-list">
                    {result.examData.questions[activeQuestion].options.map((option, index) => (
                      <div 
                        key={index} 
                        className={`option-item ${option === result.examData.questions[activeQuestion].correctAnswer ? 'correct' : ''}`}
                      >
                        <span className="option-marker">{String.fromCharCode(65 + index)}.</span>
                        <span className="option-text">{option}</span>
                        {option === result.examData.questions[activeQuestion].correctAnswer && (
                          <span className="correct-marker">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }
            })()}
            
            {displayExplanation && (
              <div className="explanation-box">
                <div className="explanation-title">
                  {(() => {
                    // For MIXED exam type, use the question's type
                    const questionType = result.examData.examType === "MIXED" 
                      ? result.examData.questions[activeQuestion].questionType 
                      : getExamTypeFromResponse(result.examData);
                    
                    return (questionType === "SHORT_ANSWER" || questionType === "ESSAY") 
                      ? "Marks Evaluation:" 
                      : "Explanation:";
                  })()}
                </div>
                <div className="explanation-content">
                  {result.examData.questions[activeQuestion].explanation.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="result-actions">
        <div className="explanation-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={displayExplanation}
              onChange={() => window.dispatchEvent(new CustomEvent('toggleExplanation'))}
            />
            Show Explanations
          </label>
        </div>
        <button 
          className="download-button"
          onClick={() => {
            // Create a new PDF document - Student version (no answers)
            generateExamPDF(result, result.examData.subject, false, displayExplanation);
          }}
        >
          Generate Exam Sheet
        </button>
        
        <button 
          className="download-button with-answers"
          onClick={() => {
            // Create a new PDF document - Teacher version (with answers)
            generateExamPDF(result, result.examData.subject, true, displayExplanation);
          }}
        >
          Generate Exam Sheet with Answers
        </button>
      </div>
    </div>
  );
};
