import React, { useState } from 'react';
import './ExamEvaluator.css';

function ExamEvaluator({ onBackToHome }) {
  const apiBaseUrl = 'http://localhost:8080/api/worksheet';
  
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
  const [quesPdf, setQuesPdf] = useState(null);
  const [ansPdf, setAnsPdf] = useState(null);
  
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

  const handleQuesPdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setQuesPdf(file);
        setError(null);
      } else {
        setError('Please upload a PDF file for questions');
        e.target.value = '';
      }
    }
  };

  const handleAnsPdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setAnsPdf(file);
        setError(null);
      } else {
        setError('Please upload a PDF file for answers');
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
      const apiEndpoint = `${apiBaseUrl}/evaluate2`;
      
      console.log('Making API call to:', apiEndpoint);

      if (!quesPdf || !ansPdf) {
        throw new Error('Please upload both question and answer PDF files.');
      }

      console.log('Request payload with files:', {
        quesPdf: quesPdf.name,
        ansPdf: ansPdf.name
      });
      
      // Use FormData for multipart/form-data
      const formData = new FormData();
      formData.append('quesPdf', quesPdf);
      formData.append('ansPdf', ansPdf);
      
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
      <header className="exam-evaluator-header">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <h1>📊 Exam Evaluator</h1>
      </header>

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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentName">Student Name</label>
                  <input
                    type="text"
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g., STU001"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
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
                  <label htmlFor="worksheetTitle">Worksheet Title</label>
                  <input
                    type="text"
                    id="worksheetTitle"
                    value={worksheetTitle}
                    onChange={(e) => setWorksheetTitle(e.target.value)}
                    placeholder="e.g., Algebra Practice Sheet"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="additionalInstructions">Additional Instructions</label>
                <textarea
                  id="additionalInstructions"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g., Consider partial marks for methodology even if final answer is wrong"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="teacherNotes">Teacher Notes</label>
                <textarea
                  id="teacherNotes"
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="e.g., Focus on problem-solving approach"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="fileUpload">Upload Worksheet (PDF or Image)</label>
                <input
                  type="file"
                  id="fileUpload"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  required
                />
                {uploadedFile && (
                  <div className="file-info">
                    <p>Selected file: {uploadedFile.name}</p>
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

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="evaluate-button"
                  disabled={loading}
                >
                  {loading ? 'Evaluating...' : 'Evaluate'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ques And Ans Tab */}
        {activeTab === 'quesans' && (
          <div className="eval-form-container">
            <form onSubmit={handleQuesAnsSubmit}>
              <div className="form-group">
                <label htmlFor="quesPdfUpload">Upload Questions PDF</label>
                <input
                  type="file"
                  id="quesPdfUpload"
                  accept=".pdf"
                  onChange={handleQuesPdfChange}
                  required
                />
                {quesPdf && (
                  <div className="file-info">
                    <p>Selected file: {quesPdf.name}</p>
                    <button 
                      type="button" 
                      className="remove-file" 
                      onClick={() => setQuesPdf(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ansPdfUpload">Upload Answers PDF</label>
                <input
                  type="file"
                  id="ansPdfUpload"
                  accept=".pdf"
                  onChange={handleAnsPdfChange}
                  required
                />
                {ansPdf && (
                  <div className="file-info">
                    <p>Selected file: {ansPdf.name}</p>
                    <button 
                      type="button" 
                      className="remove-file" 
                      onClick={() => setAnsPdf(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
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
            <div className="evaluation-result">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ExamEvaluator;
