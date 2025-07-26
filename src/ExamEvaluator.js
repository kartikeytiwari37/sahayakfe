import React, { useState } from 'react';
import './ExamEvaluator.css';

function ExamEvaluator({ onBackToHome }) {
  const apiBaseUrl = 'http://localhost:8080/api/worksheet';
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [worksheetTitle, setWorksheetTitle] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState('moderate');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
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

      let response;
      
      if (uploadedFile) {
        console.log('Request payload with file:', {
          metadata,
          file: uploadedFile.name
        });
        
        // If file is uploaded, use FormData for multipart/form-data
        const formData = new FormData();
        formData.append('metadata', JSON.stringify(metadata));
        formData.append('file', uploadedFile);
        
        response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        });
      } else {
        console.log('Request payload without file:', { metadata });
        
        // If no file, use JSON
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ metadata }),
        });
      }

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

  return (
    <div className="exam-evaluator">
      <header className="exam-evaluator-header">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <h1>📊 Exam Evaluator</h1>
      </header>

      <main className="exam-evaluator-main">
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
