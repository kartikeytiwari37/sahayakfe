import { jsPDF } from 'jspdf';

// Main PDF generation function
export const generateExamPDF = (result, subject, includeAnswers) => {
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
