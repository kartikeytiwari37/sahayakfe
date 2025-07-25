import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './ExamCreator.css';

function ExamCreator() {
  // This function would be better implemented with proper routing
  // For now, we'll use a simple approach to navigate back
  const apiBaseUrl = 'http://localhost:8080/api/exam';
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [examType, setExamType] = useState('multiple-choice');
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  
  // Helper function to determine the exam type from the API response
  const getExamTypeFromResponse = (examData) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveQuestion(0);

    // For demo purposes, we'll use mock data since the actual API might not be available
    // In a real application, this would be replaced with the actual API call
    try {
      // Make the actual API call to create an exam
      const apiUrl = `${apiBaseUrl}/create`;
      
      console.log('Making API call to:', apiUrl);
      // Convert examType to uppercase enum format
      const examTypeEnum = (() => {
        switch(examType) {
          case 'multiple-choice': return 'MULTIPLE_CHOICE';
          case 'true-false': return 'TRUE_FALSE';
          case 'essay': return 'ESSAY';
          case 'mixed': return 'MIXED';
          case 'short-answer': return 'SHORT_ANSWER';
          default: return 'MULTIPLE_CHOICE';
        }
      })();
      
      console.log('Request payload:', {
        subject,
        gradeLevel: grade,
        examType: examTypeEnum,
        numberOfQuestions: numQuestions,
        customPrompt: prompt
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          gradeLevel: grade,
          examType: examTypeEnum,
          numberOfQuestions: numQuestions,
          customPrompt: prompt
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      return;
      
      // Fallback mock data in case the API is not available
      /* 
      const mockData = {
        "status": "success",
        "message": "Exam created successfully",
        "examData": {
          "subject": subject,
          "gradeLevel": grade,
          "examType": examType,
          "questions": [
            {
              "questionText": "Solve for x: 2x + 5 = 15",
              "options": ["x = 5", "x = 10", "x = 7.5", "x = 4"],
              "correctAnswer": "x = 5",
              "explanation": "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5"
            },
            {
              "questionText": "Find the area of a circle with radius 7 cm. Use π = 3.14.",
              "options": ["153.86 cm²", "43.96 cm²", "21.98 cm²", "153.86 cm"],
              "correctAnswer": "153.86 cm²",
              "explanation": "Area of a circle = πr²\nArea = 3.14 × 7² = 3.14 × 49 = 153.86 cm²"
            },
            {
              "questionText": "Simplify the expression: 3(x + 2) - 2(x - 1)",
              "options": ["x + 8", "x + 4", "5x + 1", "5x - 1"],
              "correctAnswer": "x + 8",
              "explanation": "3(x + 2) - 2(x - 1) = 3x + 6 - 2x + 2 = 3x - 2x + 6 + 2 = x + 8"
            },
            {
              "questionText": "If a triangle has sides of lengths 3, 4, and 5, what is its area?",
              "options": ["6 square units", "12 square units", "7.5 square units", "6.5 square units"],
              "correctAnswer": "6 square units",
              "explanation": "Using the Pythagorean theorem, we can confirm this is a right triangle. Area = (1/2) × base × height = (1/2) × 3 × 4 = 6 square units"
            },
            {
              "questionText": "Solve the quadratic equation: x² - 5x + 6 = 0",
              "options": ["x = 2 and x = 3", "x = -2 and x = -3", "x = 2 and x = -3", "x = -2 and x = 3"],
              "correctAnswer": "x = 2 and x = 3",
              "explanation": "x² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx = 2 or x = 3"
            }
          ]
        },
        "rawResponse": "This is a mock response. In a real implementation, this would be the raw response from the Gemini API."
      };
      
      // If we reach here, it means the API call failed but didn't throw an error
      // We'll use the mock data as a fallback
      console.warn('API call completed but returned unexpected data. Using mock data as fallback.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult(mockData);
      */
    } catch (err) {
      console.error('Error creating exam:', err);
      setError(err.message || 'Failed to create exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index) => {
    console.log(`Changing to question ${index + 1}`);
    console.log(`Current question: ${activeQuestion + 1}`);
    
    // Force a re-render by setting the state
    setActiveQuestion(index);
    
    // Log after state update (this will show the previous state due to closure)
    console.log(`Active question set to: ${index + 1}`);
    
    // Scroll to the top of the question card
    const questionCard = document.querySelector('.question-card');
    if (questionCard) {
      questionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    // Navigate back to the main page
    // In a real app with proper routing, we would use history.push('/') or similar
    window.location.reload(); // This will reload the app and show the main page
  };

  return (
    <div className="exam-creator">
      <header className="exam-creator-header">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <h1>🎓 Exam Creator</h1>
      </header>

      <main className="exam-creator-main">
        <div className="exam-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Science, History"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="grade">Grade/Level</label>
              <input
                type="text"
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., 5th Grade, High School, College"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="examType">Exam Type</label>
              <select
                id="examType"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                required
              >
                <option value="multiple-choice">Multiple Choices</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer Questions</option>
                <option value="essay">Essay Questions</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="numQuestions">Number of Questions</label>
              <input
                type="number"
                id="numQuestions"
                value={numQuestions}
                onChange={(e) => {
                  // Ensure the value is a valid number and within range
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 50)) {
                    setNumQuestions(value === '' ? '' : parseInt(value));
                  }
                }}
                onBlur={() => {
                  // Ensure we have a valid number when the field loses focus
                  if (numQuestions === '' || isNaN(numQuestions)) {
                    setNumQuestions(5); // Default to 5 if empty or invalid
                  }
                }}
                min="1"
                max="50"
                required
              />
            </div>

            <div className="form-group prompt-group">
              <label htmlFor="prompt">Prompt (Additional Instructions)</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Provide specific instructions for generating the exam. For example: 'Create an algebra exam focusing on quadratic equations with varying difficulty levels.'"
                rows="5"
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="create-button"
                disabled={loading}
              >
                {loading ? 'Creating Exam...' : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="result-container error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
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
                </div>
              )}
            </div>
            
            <div className="result-actions">
              <button 
                className="download-button"
                onClick={() => {
                  // Create a new PDF document - Student version (no answers)
                  generateExamPDF(result, subject, false);
                }}
              >
                Generate Exam Sheet
              </button>
              
              <button 
                className="download-button with-answers"
                onClick={() => {
                  // Create a new PDF document - Teacher version (with answers)
                  generateExamPDF(result, subject, true);
                }}
              >
                Generate Exam Sheet with Answers
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// PDF generation functions
const generateExamPDF = (result, subject, includeAnswers) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set initial position
  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const textWidth = pageWidth - (margin * 2);
  
  // Set consistent font family throughout the document
  const fontFamily = 'helvetica';
  
  // Add title
  doc.setFontSize(16);
  doc.setFont(fontFamily, 'bold');
  const title = `${result.examData.subject} Exam - ${result.examData.gradeLevel}${includeAnswers ? ' (WITH ANSWERS)' : ''}`;
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Add exam info
  doc.setFontSize(12);
  doc.setFont(fontFamily, 'normal');
  doc.text(`Subject: ${result.examData.subject}`, margin, y);
  y += 8;
  doc.text(`Grade Level: ${result.examData.gradeLevel}`, margin, y);
  y += 8;
  
  // Display proper exam type name
  const examTypeDisplay = (() => {
    switch(result.examData.examType) {
      case 'MULTIPLE_CHOICE': return 'Multiple Choices';
      case 'TRUE_FALSE': return 'True/False';
      case 'SHORT_ANSWER': return 'Short Answer Questions';
      case 'ESSAY': return 'Essay Questions';
      case 'MIXED': return 'Mixed';
      default: return result.examData.examType;
    }
  })();
  doc.text(`Exam Type: ${examTypeDisplay}`, margin, y);
  y += 8;
  doc.text(`Number of Questions: ${result.examData.questions.length}`, margin, y);
  y += 15;
  
  // Add questions heading
  doc.setFontSize(14);
  doc.setFont(fontFamily, 'bold');
  doc.text('Questions:', margin, y);
  y += 10;
  
  // Define a green color for the checkmark
  const greenColor = [0, 0.5, 0, 1]; // RGBA: Green color
  
  // Process each question
  result.examData.questions.forEach((question, index) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    // Add subsection header for MIXED exam type
    if (result.examData.examType === "MIXED") {
      y = addSubsectionHeader(doc, question, index, result.examData.questions, margin, y, textWidth, fontFamily);
    }
    
    // Question number and text with text wrapping
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'bold');
    const questionText = `Question ${index + 1}: ${question.questionText}`;
    const wrappedQuestionText = doc.splitTextToSize(questionText, textWidth);
    doc.text(wrappedQuestionText, margin, y);
    y += wrappedQuestionText.length * 7; // Adjust y position based on number of lines
    
    // Determine question type and render appropriate UI
    const questionType = result.examData.examType === "MIXED" 
      ? question.questionType 
      : result.examData.examType;
    
    // Render question based on type
    switch(questionType) {
      case 'MULTIPLE_CHOICE':
        y = renderMultipleChoiceQuestion(doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily, greenColor);
        break;
      case 'TRUE_FALSE':
        y = renderTrueFalseQuestion(doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily, greenColor);
        break;
      case 'SHORT_ANSWER':
        y = renderShortAnswerQuestion(doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily);
        break;
      case 'ESSAY':
        y = renderEssayQuestion(doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily);
        break;
      default:
        // Default to multiple choice if type is unknown
        y = renderMultipleChoiceQuestion(doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily, greenColor);
    }
    
    // Add a dotted line divider between questions (except for the last question)
    if (index < result.examData.questions.length - 1) {
      y = addDivider(doc, margin, y, pageWidth);
    }
  });
  
  // Save the PDF
  const filename = includeAnswers 
    ? `exam-sheet-with-answers-${subject}-${new Date().toISOString().slice(0, 10)}.pdf`
    : `exam-sheet-${subject}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

// Helper function to add subsection header for MIXED exam type
const addSubsectionHeader = (doc, question, index, questions, margin, y, textWidth, fontFamily) => {
  // Check if this is the first question or if the question type has changed from the previous question
  if (index === 0 || question.questionType !== questions[index - 1].questionType) {
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'bold');
    
    // Get the subsection header text based on question type
    let subsectionText = "";
    switch(question.questionType) {
      case 'MULTIPLE_CHOICE': subsectionText = "Multiple Choices"; break;
      case 'TRUE_FALSE': subsectionText = "True/False"; break;
      case 'SHORT_ANSWER': subsectionText = "Short Answer"; break;
      case 'ESSAY': subsectionText = "Essay"; break;
      default: subsectionText = question.questionType;
    }
    
    // Add a background for the subsection header
    doc.setFillColor(255, 248, 225); // Light yellow background
    doc.rect(margin, y - 5, textWidth, 10, 'F');
    
    // Add a left border
    doc.setDrawColor(255, 160, 0); // Orange border
    doc.setLineWidth(1);
    doc.line(margin, y - 5, margin, y + 5);
    
    // Add the subsection text
    doc.setTextColor(255, 143, 0); // Orange text
    doc.text(subsectionText.toUpperCase(), margin + 5, y);
    doc.setTextColor(0, 0, 0); // Reset to black
    
    y += 15; // Add space after subsection header
  }
  
  return y;
};

// Helper function to add divider between questions
const addDivider = (doc, margin, y, pageWidth) => {
  y += 10; // Space before divider
  doc.setDrawColor(180, 180, 180); // Lighter gray
  doc.setLineWidth(0.5); // Thinner line
  doc.setLineDashPattern([2, 2], 0); // Smaller dotted line
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDashPattern([10, 0], 0); // Reset to solid line
  y += 10; // Space after divider
  
  return y;
};

// Helper function to render multiple choice question
const renderMultipleChoiceQuestion = (doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily, greenColor) => {
  // Options - consistent font for all options
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(11);
  
  if (question.options) {
    question.options.forEach((option, optIndex) => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const optionLetter = String.fromCharCode(65 + optIndex);
      const isCorrect = option === question.correctAnswer;
      
      // For correct answers in teacher version, add a visible green checkmark
      if (includeAnswers && isCorrect) {
        // Draw a green circle with checkmark
        doc.setFillColor(...greenColor);
        doc.circle(margin + 2, y - 2, 2, 'F');
        doc.setTextColor(1, 1, 1); // White
        doc.setFont(fontFamily, 'bold');
        doc.text('✓', margin + 1, y - 1, { align: 'center' });
        doc.setFont(fontFamily, 'normal');
        doc.setTextColor(0, 0, 0); // Reset to black
      }
      
      // All options in the same font style with text wrapping
      // Check if the option already starts with the letter (for MIXED exam type)
      const optionText = option.startsWith(`${optionLetter}.`) || option.startsWith(`Option ${optionLetter}:`) 
        ? option 
        : `${optionLetter}. ${option}`;
      const wrappedOptionText = doc.splitTextToSize(optionText, textWidth - 10);
      doc.text(wrappedOptionText, margin + 10, y);
      y += wrappedOptionText.length * 7; // Adjust y position based on number of lines
    });
    
    // Add explanation for teacher version
    if (includeAnswers) {
      // Explanation
      doc.setFontSize(11);
      doc.setFont(fontFamily, 'bold');
      doc.text('Explanation:', margin, y);
      y += 7;
      
      // Explanation with text wrapping
      doc.setFont(fontFamily, 'normal');
      const explanationLines = question.explanation.split('\n');
      explanationLines.forEach(line => {
        // Check if we need a new page
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const wrappedLine = doc.splitTextToSize(line, textWidth - 10);
        doc.text(wrappedLine, margin + 10, y);
        y += wrappedLine.length * 7; // Adjust y position based on number of lines
      });
    }
  }
  
  return y;
};

// Helper function to render true/false question
const renderTrueFalseQuestion = (doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily, greenColor) => {
  // Options - consistent font for all options
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(11);
  
  // True option
  const isTrueCorrect = question.correctAnswer === "True";
  
  // For correct answers in teacher version, add a visible green checkmark
  if (includeAnswers && isTrueCorrect) {
    // Draw a green circle with checkmark
    doc.setFillColor(...greenColor);
    doc.circle(margin + 2, y - 2, 2, 'F');
    doc.setTextColor(1, 1, 1); // White
    doc.setFont(fontFamily, 'bold');
    doc.text('✓', margin + 1, y - 1, { align: 'center' });
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(0, 0, 0); // Reset to black
  }
  
  // True option
  doc.text('A. True', margin + 10, y);
  y += 7;
  
  // False option
  const isFalseCorrect = question.correctAnswer === "False";
  
  // For correct answers in teacher version, add a visible green checkmark
  if (includeAnswers && isFalseCorrect) {
    // Draw a green circle with checkmark
    doc.setFillColor(...greenColor);
    doc.circle(margin + 2, y - 2, 2, 'F');
    doc.setTextColor(1, 1, 1); // White
    doc.setFont(fontFamily, 'bold');
    doc.text('✓', margin + 1, y - 1, { align: 'center' });
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(0, 0, 0); // Reset to black
  }
  
  // False option
  doc.text('B. False', margin + 10, y);
  y += 7;
  
  // Add explanation for teacher version
  if (includeAnswers) {
    // Explanation
    doc.setFontSize(11);
    doc.setFont(fontFamily, 'bold');
    doc.text('Explanation:', margin, y);
    y += 7;
    
    // Explanation with text wrapping
    doc.setFont(fontFamily, 'normal');
    const explanationLines = question.explanation.split('\n');
    explanationLines.forEach(line => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const wrappedLine = doc.splitTextToSize(line, textWidth - 10);
      doc.text(wrappedLine, margin + 10, y);
      y += wrappedLine.length * 7; // Adjust y position based on number of lines
    });
  }
  
  return y;
};

// Helper function to render short answer question
const renderShortAnswerQuestion = (doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily) => {
  // Options - consistent font for all options
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(11);
  
  if (includeAnswers) {
    // Short answer question with answer - teacher version
    doc.setFont(fontFamily, 'normal');
    
    // Show the correct answer - aligned with question
    doc.setFont(fontFamily, 'bold');
    doc.text('Answer:', margin, y);
    y += 7;
    
    // Display the answer with wrapping - aligned with question
    doc.setFont(fontFamily, 'normal');
    const answerText = question.correctAnswer;
    const wrappedAnswerText = doc.splitTextToSize(answerText, textWidth - 10);
    doc.text(wrappedAnswerText, margin + 10, y);
    y += wrappedAnswerText.length * 7;
    
    // Marks Evaluation - aligned with question
    doc.setFontSize(11);
    doc.setFont(fontFamily, 'bold');
    doc.text('Marks Evaluation:', margin, y);
    y += 7;
    
    // Explanation with text wrapping
    doc.setFont(fontFamily, 'normal');
    const evaluationLines = question.explanation.split('\n');
    evaluationLines.forEach(line => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const wrappedLine = doc.splitTextToSize(line, textWidth - 10);
      doc.text(wrappedLine, margin + 10, y);
      y += wrappedLine.length * 7; // Adjust y position based on number of lines
    });
  } else {
    // Short answer question - student version
    doc.setFont(fontFamily, 'normal');
    const shortAnswerText = 'Answer:';
    doc.text(shortAnswerText, margin + 10, y);
    y += 10;
    
    // Add 3 lines for writing
    for (let i = 0; i < 3; i++) {
      doc.setDrawColor(200, 200, 200); // Light gray
      doc.line(margin + 10, y, pageWidth - margin, y);
      y += 10;
    }
  }
  
  return y;
};

// Helper function to render essay question
const renderEssayQuestion = (doc, question, includeAnswers, margin, y, textWidth, pageWidth, fontFamily) => {
  // Options - consistent font for all options
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(11);
  
  if (includeAnswers) {
    // Essay question - teacher version
    doc.setFont(fontFamily, 'normal');
    const essayText = 'This is an essay question. Students should write a detailed response.';
    const wrappedEssayText = doc.splitTextToSize(essayText, textWidth - 10);
    doc.text(wrappedEssayText, margin + 10, y);
    y += wrappedEssayText.length * 7;
    
    // Model answer if available
    if (question.correctAnswer && question.correctAnswer !== "null") {
      doc.setFont(fontFamily, 'bold');
      doc.text('Model Answer:', margin, y);
      y += 7;
      
      doc.setFont(fontFamily, 'normal');
      const answerText = question.correctAnswer;
      const wrappedAnswerText = doc.splitTextToSize(answerText, textWidth - 10);
      doc.text(wrappedAnswerText, margin + 10, y);
      y += wrappedAnswerText.length * 7;
    }
    
    // Explanation
    doc.setFontSize(11);
    doc.setFont(fontFamily, 'bold');
    doc.text('Marks Evaluation:', margin, y);
    y += 7;
    
    // Explanation with text wrapping
    doc.setFont(fontFamily, 'normal');
    const explanationLines = question.explanation.split('\n');
    explanationLines.forEach(line => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const wrappedLine = doc.splitTextToSize(line, textWidth - 10);
      doc.text(wrappedLine, margin + 10, y);
      y += wrappedLine.length * 7; // Adjust y position based on number of lines
    });
  } else {
    // Essay question - student version
    doc.setFont(fontFamily, 'normal');
    const essayText = 'This is an essay question. Write a detailed response below:';
    const wrappedEssayText = doc.splitTextToSize(essayText, textWidth - 10);
    doc.text(wrappedEssayText, margin + 10, y);
    y += wrappedEssayText.length * 7;
    
    // Add lines for writing
    for (let i = 0; i < 5; i++) {
      doc.setDrawColor(200, 200, 200); // Light gray
      doc.line(margin + 10, y + 5, pageWidth - margin, y + 5);
      y += 10;
    }
  }
  
  return y;
};

export default ExamCreator;
