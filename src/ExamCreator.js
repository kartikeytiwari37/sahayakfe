import React, { useState } from 'react';
import './ExamCreator.css';
import { generateExamPDF } from './PdfGenerator';
import { getExamTypeFromResponse, ExamResult } from './ResponseGenerator';

function ExamCreator({ onBackToHome }) {
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
  const [displayExplanation, setDisplayExplanation] = useState(false);

  // Add event listener for toggleExplanation event
  React.useEffect(() => {
    const handleToggleExplanation = () => {
      setDisplayExplanation(prev => !prev);
    };
    
    window.addEventListener('toggleExplanation', handleToggleExplanation);
    
    return () => {
      window.removeEventListener('toggleExplanation', handleToggleExplanation);
    };
  }, []);

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
    // Use the onBackToHome prop to navigate back to the home page
    if (onBackToHome) {
      onBackToHome();
    } else {
      // Fallback to reload if prop is not provided
      window.location.reload();
    }
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
          <ExamResult 
            result={result} 
            activeQuestion={activeQuestion} 
            handleQuestionChange={handleQuestionChange} 
            generateExamPDF={generateExamPDF}
            displayExplanation={displayExplanation}
          />
        )}
      </main>
    </div>
  );
}



export default ExamCreator;
