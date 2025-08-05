import React, { useState } from 'react';
import AgentHeader from './components/AgentHeader';
import './ExamEvaluator.css';

function ExamEvaluator({ onBackToHome }) {
  const apiBaseUrl = 'https://sahayak-backend-199913799544.us-central1.run.app/api/worksheet';
  
  // Tab state
  const [activeTab, setActiveTab] = useState('worksheet');
  
  // Worksheet tab states
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [worksheetTitle, setWorksheetTitle] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState('moderate');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Ques And Ans tab states
  const [tab2StudentName, setTab2StudentName] = useState('');
  const [tab2StudentId, setTab2StudentId] = useState('');
  const [tab2Subject, setTab2Subject] = useState('');
  const [tab2ExamTitle, setTab2ExamTitle] = useState('');
  const [tab2EvaluationCriteria, setTab2EvaluationCriteria] = useState('moderate');
  const [tab2AdditionalInstructions, setTab2AdditionalInstructions] = useState('');
  const [tab2TeacherNotes, setTab2TeacherNotes] = useState('');
  const [questionPaper, setQuestionPaper] = useState(null);
  const [answerSheet, setAnswerSheet] = useState(null);
  
  // Common states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiEndpoint = `${apiBaseUrl}/evaluate`;
      
      console.log('Making API call to:', apiEndpoint);
      
      // Prepare the metadata object
      const metadata = {
        studentName,
        studentId,
        subject,
        worksheetTitle,
        evaluationCriteria,
        additionalInstructions,
        teacherNotes
      };

      // Since file upload is now required, we always use FormData
      if (!uploadedFile) {
        throw new Error('Please upload a worksheet file to evaluate.');
      }

      console.log('Request payload with file:', {
        metadata,
        file: uploadedFile.name
      });
      
      // Use FormData for multipart/form-data to match backend API contract
      const formData = new FormData();
      formData.append('worksheetFile', uploadedFile); // Backend expects 'worksheetFile'
      formData.append('metadata', JSON.stringify(metadata)); // Backend expects 'metadata' as string
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('Error evaluating worksheet:', err);
      setError(err.message || 'Failed to evaluate worksheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.reload();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is PDF or image
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        setError('Please upload a PDF or image file (JPEG, PNG, GIF)');
        e.target.value = '';
      }
    }
  };

  const handleQuestionPaperChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setQuestionPaper(file);
        setError(null);
      } else {
        setError('Please upload a PDF file for question paper');
        e.target.value = '';
      }
    }
  };

  const handleAnswerSheetChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setAnswerSheet(file);
        setError(null);
      } else {
        setError('Please upload a PDF file for answer sheet');
        e.target.value = '';
      }
    }
  };

  const handleQuesAnsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiEndpoint = `${apiBaseUrl}/evaluate-with-question-paper`;
      
      console.log('Making API call to:', apiEndpoint);

      if (!questionPaper || !answerSheet) {
        throw new Error('Please upload both question paper and answer sheet PDF files.');
      }

      // Prepare the metadata object for Tab 2
      const metadata = {
        studentName: tab2StudentName,
        studentId: tab2StudentId,
        subject: tab2Subject,
        examTitle: tab2ExamTitle,
        evaluationCriteria: tab2EvaluationCriteria,
        additionalInstructions: tab2AdditionalInstructions,
        teacherNotes: tab2TeacherNotes
      };

      console.log('Request payload with files:', {
        metadata,
        questionPaper: questionPaper.name,
        answerSheet: answerSheet.name
      });
      
      // Use FormData for multipart/form-data
      const formData = new FormData();
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('questionPaper', questionPaper);
      formData.append('answerSheet', answerSheet);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('Error evaluating answer sheet:', err);
      setError(err.message || 'Failed to evaluate answer sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-evaluator">
      <AgentHeader
        agentName="Exam Evaluator"
        agentDescription="Evaluate Worksheets and Answer Sheets with AI"
        agentIcon="📊"
        onBackToHome={onBackToHome}
        backButtonText="← Back to Home"
      />

      <main className="exam-evaluator-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'worksheet' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('worksheet');
              setResult(null);
              setError(null);
            }}
          >
            📄 Worksheet
          </button>
          <button 
            className={`tab-button ${activeTab === 'quesans' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('quesans');
              setResult(null);
              setError(null);
            }}
          >
            📝 Ques And Ans
          </button>
        </div>

        {/* Worksheet Tab */}
        {activeTab === 'worksheet' && (
          <div className="eval-form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="section-title">
                  👤 Student Information
                </div>
                <div className="form-row">
                  <div className="form-group compact">
                    <label htmlFor="studentName">Student Name</label>
                    <input
                      type="text"
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <label htmlFor="studentId">Student ID</label>
                    <input
                      type="text"
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="STU001"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group compact">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Mathematics, Science, History"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <label htmlFor="worksheetTitle">Worksheet Title</label>
                    <input
                      type="text"
                      id="worksheetTitle"
                      value={worksheetTitle}
                      onChange={(e) => setWorksheetTitle(e.target.value)}
                      placeholder="Algebra Practice Sheet"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  ⚙️ Evaluation Settings
                </div>
                <div className="form-row single">
                  <div className="form-group compact">
                    <label htmlFor="evaluationCriteria">Evaluation Criteria</label>
                    <select
                      id="evaluationCriteria"
                      value={evaluationCriteria}
                      onChange={(e) => setEvaluationCriteria(e.target.value)}
                      required
                    >
                      <option value="strict">Strict</option>
                      <option value="moderate">Moderate</option>
                      <option value="lenient">Lenient</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="additionalInstructions">Additional Instructions</label>
                    <textarea
                      id="additionalInstructions"
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      placeholder="Consider partial marks for methodology..."
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="teacherNotes">Teacher Notes</label>
                    <textarea
                      id="teacherNotes"
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      placeholder="Focus on problem-solving approach..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  📄 File Upload
                </div>
                <div className="form-row single">
                  <div className="form-group">
                    <label htmlFor="fileUpload">Upload Worksheet</label>
                    <div className={`file-upload-area ${uploadedFile ? 'has-file' : ''}`}>
                      <input
                        type="file"
                        id="fileUpload"
                        className="file-upload-input"
                        accept=".pdf,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileChange}
                        required
                      />
                      <div className="file-upload-content">
                        <div className="file-upload-icon">📎</div>
                        <div className="file-upload-text">
                          {uploadedFile ? 'File Selected' : 'Click to upload or drag and drop'}
                        </div>
                        <div className="file-upload-hint">PDF, JPG, PNG, GIF (Max 10MB)</div>
                      </div>
                    </div>
                    {uploadedFile && (
                      <div className="file-info">
                        <div className="file-info-content">
                          <div className="file-info-icon">✅</div>
                          <p>{uploadedFile.name}</p>
                        </div>
                        <button 
                          type="button" 
                          className="remove-file" 
                          onClick={() => setUploadedFile(null)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="evaluate-button"
                  disabled={loading}
                >
                  {loading ? 'Evaluating...' : 'Evaluate Worksheet'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ques And Ans Tab */}
        {activeTab === 'quesans' && (
          <div className="eval-form-container">
            <form onSubmit={handleQuesAnsSubmit}>
              <div className="form-section">
                <div className="section-title">
                  👤 Student Information
                </div>
                <div className="form-row">
                  <div className="form-group compact">
                    <label htmlFor="tab2StudentName">Student Name</label>
                    <input
                      type="text"
                      id="tab2StudentName"
                      value={tab2StudentName}
                      onChange={(e) => setTab2StudentName(e.target.value)}
                      placeholder="Jane Smith"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <label htmlFor="tab2StudentId">Student ID</label>
                    <input
                      type="text"
                      id="tab2StudentId"
                      value={tab2StudentId}
                      onChange={(e) => setTab2StudentId(e.target.value)}
                      placeholder="STU12345"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group compact">
                    <label htmlFor="tab2Subject">Subject</label>
                    <input
                      type="text"
                      id="tab2Subject"
                      value={tab2Subject}
                      onChange={(e) => setTab2Subject(e.target.value)}
                      placeholder="Science, Mathematics, History"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <label htmlFor="tab2ExamTitle">Exam Title</label>
                    <input
                      type="text"
                      id="tab2ExamTitle"
                      value={tab2ExamTitle}
                      onChange={(e) => setTab2ExamTitle(e.target.value)}
                      placeholder="Science Mid-term Exam"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  ⚙️ Evaluation Settings
                </div>
                <div className="form-row single">
                  <div className="form-group compact">
                    <label htmlFor="tab2EvaluationCriteria">Evaluation Criteria</label>
                    <select
                      id="tab2EvaluationCriteria"
                      value={tab2EvaluationCriteria}
                      onChange={(e) => setTab2EvaluationCriteria(e.target.value)}
                      required
                    >
                      <option value="strict">Strict</option>
                      <option value="moderate">Moderate</option>
                      <option value="lenient">Lenient</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tab2AdditionalInstructions">Additional Instructions</label>
                    <textarea
                      id="tab2AdditionalInstructions"
                      value={tab2AdditionalInstructions}
                      onChange={(e) => setTab2AdditionalInstructions(e.target.value)}
                      placeholder="Focus on conceptual understanding..."
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tab2TeacherNotes">Teacher Notes</label>
                    <textarea
                      id="tab2TeacherNotes"
                      value={tab2TeacherNotes}
                      onChange={(e) => setTab2TeacherNotes(e.target.value)}
                      placeholder="Student strengths and areas to focus on..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  📄 File Uploads
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="questionPaperUpload">Question Paper</label>
                    <div className={`file-upload-area ${questionPaper ? 'has-file' : ''}`}>
                      <input
                        type="file"
                        id="questionPaperUpload"
                        className="file-upload-input"
                        accept=".pdf"
                        onChange={handleQuestionPaperChange}
                        required
                      />
                      <div className="file-upload-content">
                        <div className="file-upload-icon">📋</div>
                        <div className="file-upload-text">
                          {questionPaper ? 'Question Paper Selected' : 'Upload Question Paper'}
                        </div>
                        <div className="file-upload-hint">PDF only (Max 10MB)</div>
                      </div>
                    </div>
                    {questionPaper && (
                      <div className="file-info">
                        <div className="file-info-content">
                          <div className="file-info-icon">✅</div>
                          <p>{questionPaper.name}</p>
                        </div>
                        <button 
                          type="button" 
                          className="remove-file" 
                          onClick={() => setQuestionPaper(null)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="answerSheetUpload">Answer Sheet</label>
                    <div className={`file-upload-area ${answerSheet ? 'has-file' : ''}`}>
                      <input
                        type="file"
                        id="answerSheetUpload"
                        className="file-upload-input"
                        accept=".pdf"
                        onChange={handleAnswerSheetChange}
                        required
                      />
                      <div className="file-upload-content">
                        <div className="file-upload-icon">📝</div>
                        <div className="file-upload-text">
                          {answerSheet ? 'Answer Sheet Selected' : 'Upload Answer Sheet'}
                        </div>
                        <div className="file-upload-hint">PDF only (Max 10MB)</div>
                      </div>
                    </div>
                    {answerSheet && (
                      <div className="file-info">
                        <div className="file-info-content">
                          <div className="file-info-icon">✅</div>
                          <p>{answerSheet.name}</p>
                        </div>
                        <button 
                          type="button" 
                          className="remove-file" 
                          onClick={() => setAnswerSheet(null)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="evaluate-button"
                  disabled={loading}
                >
                  {loading ? 'Evaluating...' : 'Evaluate Answer Sheet'}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="result-container error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-container">
            <h3>Evaluation Results</h3>
            
            {/* Formatted Results Display for Tab 1 */}
            {activeTab === 'worksheet' && (
              <div className="evaluation-summary">
                <div className="summary-header">
                  <div className="student-info">
                    <h4>📋 Student Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Name:</span>
                        <span className="value">{studentName}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">ID:</span>
                        <span className="value">{studentId}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Subject:</span>
                        <span className="value">{subject}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Worksheet:</span>
                        <span className="value">{worksheetTitle}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="score-summary">
                    <div className={`score-circle ${
                      result.evaluation?.percentage >= 70 ? 'score-green' : 
                      result.evaluation?.percentage >= 30 ? 'score-amber' : 
                      'score-red'
                    }`}>
                      <div className="score-value">
                        {result.evaluation?.totalScore && result.evaluation?.maxPossibleScore 
                          ? `${result.evaluation.totalScore}/${result.evaluation.maxPossibleScore}`
                          : result.evaluation?.totalScore || result.evaluation?.score || 'N/A'
                        }
                      </div>
                      <div className="score-label">Total Score</div>
                    </div>
                  </div>
                </div>

                <div className="evaluation-details">
                  <div className="detail-section">
                    <h5>📊 Evaluation Summary</h5>
                    <div className="summary-stats">
                      <div className="stat-item">
                        <span className="stat-label">Criteria:</span>
                        <span className="stat-value">{evaluationCriteria}</span>
                      </div>
                      {result.evaluation?.totalQuestions && (
                        <div className="stat-item">
                          <span className="stat-label">Questions:</span>
                          <span className="stat-value">{result.evaluation.totalQuestions}</span>
                        </div>
                      )}
                      {result.evaluation?.correctAnswers && (
                        <div className="stat-item">
                          <span className="stat-label">Correct:</span>
                          <span className="stat-value">{result.evaluation.correctAnswers}</span>
                        </div>
                      )}
                      {result.evaluation?.percentage && (
                        <div className="stat-item">
                          <span className="stat-label">Percentage:</span>
                          <span className="stat-value">{result.evaluation.percentage}%</span>
                        </div>
                      )}
                    </div>
                    {result.evaluation?.overallFeedback && (
                      <div className="feedback-content" style={{ marginTop: '1rem' }}>
                        {result.evaluation.overallFeedback}
                      </div>
                    )}
                  </div>

                  {result.evaluation?.areasForImprovement && (
                    <div className="detail-section">
                      <h5>📈 Areas for Improvement</h5>
                      <div className="improvements-content">
                        {Array.isArray(result.evaluation.areasForImprovement) ? (
                          <ul>
                            {result.evaluation.areasForImprovement.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{result.evaluation.areasForImprovement}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {result.evaluation?.strengths && (
                    <div className="detail-section">
                      <h5>✅ Strengths</h5>
                      <div className="strengths-content">
                        {Array.isArray(result.evaluation.strengths) ? (
                          <ul>
                            {result.evaluation.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{result.evaluation.strengths}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {additionalInstructions && (
                    <div className="detail-section">
                      <h5>📝 Additional Instructions</h5>
                      <div className="instructions-content">
                        {additionalInstructions}
                      </div>
                    </div>
                  )}

                  {teacherNotes && (
                    <div className="detail-section">
                      <h5>👨‍🏫 Teacher Notes</h5>
                      <div className="notes-content">
                        {teacherNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formatted Results Display for Tab 2 */}
            {activeTab === 'quesans' && (
              <div className="evaluation-summary">
                <div className="summary-header">
                  <div className="student-info">
                    <h4>📋 Student Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Name:</span>
                        <span className="value">{tab2StudentName}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">ID:</span>
                        <span className="value">{tab2StudentId}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Subject:</span>
                        <span className="value">{tab2Subject}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Exam:</span>
                        <span className="value">{tab2ExamTitle}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="score-summary">
                    <div className={`score-circle ${
                      result.evaluation?.percentage >= 70 ? 'score-green' : 
                      result.evaluation?.percentage >= 30 ? 'score-amber' : 
                      'score-red'
                    }`}>
                      <div className="score-value">
                        {result.evaluation?.totalScore && result.evaluation?.maxPossibleScore 
                          ? `${result.evaluation.totalScore}/${result.evaluation.maxPossibleScore}`
                          : result.evaluation?.totalScore || result.evaluation?.score || 'N/A'
                        }
                      </div>
                      <div className="score-label">Total Score</div>
                    </div>
                  </div>
                </div>

                <div className="evaluation-details">
                  <div className="detail-section">
                    <h5>📊 Evaluation Summary</h5>
                    <div className="summary-stats">
                      <div className="stat-item">
                        <span className="stat-label">Criteria:</span>
                        <span className="stat-value">{tab2EvaluationCriteria}</span>
                      </div>
                      {result.evaluation?.totalQuestions && (
                        <div className="stat-item">
                          <span className="stat-label">Questions:</span>
                          <span className="stat-value">{result.evaluation.totalQuestions}</span>
                        </div>
                      )}
                      {result.evaluation?.correctAnswers && (
                        <div className="stat-item">
                          <span className="stat-label">Correct:</span>
                          <span className="stat-value">{result.evaluation.correctAnswers}</span>
                        </div>
                      )}
                      {result.evaluation?.percentage && (
                        <div className="stat-item">
                          <span className="stat-label">Percentage:</span>
                          <span className="stat-value">{result.evaluation.percentage}%</span>
                        </div>
                      )}
                    </div>
                    {result.evaluation?.overallFeedback && (
                      <div className="feedback-content" style={{ marginTop: '1rem' }}>
                        {result.evaluation.overallFeedback}
                      </div>
                    )}
                  </div>

                  {result.evaluation?.areasForImprovement && (
                    <div className="detail-section">
                      <h5>📈 Areas for Improvement</h5>
                      <div className="improvements-content">
                        {Array.isArray(result.evaluation.areasForImprovement) ? (
                          <ul>
                            {result.evaluation.areasForImprovement.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{result.evaluation.areasForImprovement}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {result.evaluation?.strengths && (
                    <div className="detail-section">
                      <h5>✅ Strengths</h5>
                      <div className="strengths-content">
                        {Array.isArray(result.evaluation.strengths) ? (
                          <ul>
                            {result.evaluation.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{result.evaluation.strengths}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {tab2AdditionalInstructions && (
                    <div className="detail-section">
                      <h5>📝 Additional Instructions</h5>
                      <div className="instructions-content">
                        {tab2AdditionalInstructions}
                      </div>
                    </div>
                  )}

                  {tab2TeacherNotes && (
                    <div className="detail-section">
                      <h5>👨‍🏫 Teacher Notes</h5>
                      <div className="notes-content">
                        {tab2TeacherNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Raw JSON Display */}
            <div className="raw-results-toggle">
              <details>
                <summary>View Details</summary>
                <div className="evaluation-result">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </details>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ExamEvaluator;
