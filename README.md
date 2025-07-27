# Sahayak Frontend

## Overview

Sahayak Frontend is a React-based educational application that provides various AI-powered teaching and learning tools. The application offers multiple interactive components for different educational purposes, including personalized teaching sessions, career planning, exam creation, and worksheet evaluation.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Components](#components)
- [Backend Integration](#backend-integration)
- [Deployment](#deployment)
- [Development](#development)
- [API Endpoints](#api-endpoints)

## Features

### 1. Kalam Sir - AI Teaching Assistant
- Personalized teaching assistant creation
- Real-time voice conversations
- Screen sharing capabilities
- Educational video generation

### 2. Udaan - Future Career Planner
- Personalized career roadmaps
- Inspirational content generation
- Step-by-step guidance for students
- Downloadable HTML plans

### 3. Exam Creator
- Multiple exam types (Multiple Choice, True/False, Short Answer, Essay)
- PDF generation with and without answers
- Customizable exam parameters
- Optional PDF upload for context

### 4. Exam Evaluator
- Worksheet evaluation
- Question and answer evaluation
- Multiple evaluation criteria
- Detailed feedback generation

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      Sahayak Frontend                           │
├─────────────┬─────────────┬─────────────────┬──────────────────┤
│  Kalam Sir  │    Udaan    │  Exam Creator   │  Exam Evaluator  │
└──────┬──────┴──────┬──────┴────────┬────────┴─────────┬────────┘
       │             │               │                  │
       │             │               │                  │
       ▼             ▼               ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WebSocket Connection                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Sahayak Backend                            │
├─────────────┬─────────────┬─────────────────┬──────────────────┤
│ AI Teacher  │Future Planner│ Exam Generator │ Worksheet Evaluator│
└─────────────┴─────────────┴─────────────────┴──────────────────┘
```

### Technology Stack

- **Frontend**: React.js
- **PDF Generation**: jsPDF
- **Real-time Communication**: SockJS
- **Containerization**: Docker
- **Deployment**: Google Cloud Run
- **CI/CD**: Google Cloud Build

## Components

### HomePage

The main landing page that displays all available learning companions:
- Kalam Sir (AI Teacher)
- Udaan (Career Planner)
- Exam Creator
- Exam Evaluator
- Science Explorer (Coming Soon)
- Creative Artist (Coming Soon)

### KalamSir

Component for creating a personalized AI teaching assistant:
- Allows users to describe their teaching requirements
- Generates a custom prompt for the teaching session
- Connects to the backend via WebSocket

### TeachingSession

Interactive session with the AI teacher:
- Real-time text chat
- Voice conversation capabilities
- Screen sharing for demonstrations
- Educational video generation

### Udaan

Component for creating personalized career roadmaps:
- Collects student information (name, age, location, career goals)
- Generates a custom prompt for the future plan
- Connects to the backend via WebSocket

### UdaanSession

Generates and displays the future career plan:
- Interactive progress display
- Renders HTML content for the career roadmap
- Provides download and view options

### ExamCreator

Tool for creating customized exams:
- Multiple exam types
- Customizable number of questions
- Optional PDF upload for context
- PDF generation with or without answers

### ExamEvaluator

Tool for evaluating student worksheets:
- Uploads student worksheets
- Configurable evaluation criteria
- Detailed feedback generation

### PdfGenerator

Utility for generating PDF documents:
- Creates exam sheets with different question types
- Supports answer key generation
- Handles various formatting options

### ResponseGenerator

Utility for processing and displaying exam results:
- Renders different question types
- Handles answer display toggling
- Manages explanation visibility

## Backend Integration

### WebSocket Communication

The application uses SockJS to establish WebSocket connections with the backend server for real-time communication:

```javascript
const socket = new SockJS('http://localhost:8080/sahayak-teacher');
```

In production, the WebSocket endpoint is:

```javascript
const socket = new SockJS('https://sahayak-backend-199913799544.us-central1.run.app/sahayak-teacher');
```

### REST API Endpoints

The application communicates with various backend REST API endpoints:

#### Exam Creator
- `http://localhost:8080/api/exam/create` - Create exam without PDF
- `http://localhost:8080/api/exam/createWithPdf` - Create exam with PDF context

#### Exam Evaluator
- `http://localhost:8080/api/worksheet/evaluate` - Evaluate worksheet
- `http://localhost:8080/api/worksheet/evaluate2` - Evaluate with question and answer PDFs

#### Video Generation
- `http://localhost:8080/api/sahayak/video/generate-prompt` - Generate video prompt
- `http://localhost:8080/api/sahayak/video/generate` - Generate educational video
- `http://localhost:8080/api/sahayak/video/status` - Check video generation status
- `http://localhost:8080/api/sahayak/video/download` - Download generated video

#### Future Plan
- `http://localhost:8080/api/sahayak/future-plan/generate` - Generate future career plan

### Data Flow

1. **User Input**: User interacts with the frontend components
2. **API Request**: Frontend sends requests to the backend
3. **Backend Processing**: Backend processes the request using AI models
4. **Response**: Backend sends the response back to the frontend
5. **Rendering**: Frontend renders the response for the user

## Deployment

### Docker Containerization

The application is containerized using Docker with a multi-stage build process:

1. **Build Stage**: Uses Node.js 18 to build the React application
2. **Production Stage**: Uses Nginx to serve the built application

### Nginx Configuration

The Nginx server is configured to:
- Listen on port 8080
- Handle React Router by redirecting all requests to index.html
- Cache static assets
- Add security headers
- Enable Gzip compression

### Google Cloud Run Deployment

The application is deployed to Google Cloud Run with the following configuration:
- Memory: 512Mi
- CPU: 1
- Max Instances: 10
- Environment: NODE_ENV=production
- Port: 8080
- Publicly accessible (--allow-unauthenticated)

### CI/CD Pipeline

The CI/CD pipeline is implemented using Google Cloud Build:
1. Build the Docker image
2. Push the image to Google Container Registry
3. Deploy the image to Google Cloud Run

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/kartikeytiwari37/sahayakfe.git

# Navigate to the project directory
cd sahayakfe

# Install dependencies
npm install

# Start the development server
npm start
```

### Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App

### Proxy Configuration

The development server is configured to proxy API requests to the backend server:

```json
{
  "proxy": "http://localhost:8080"
}
```

## API Endpoints

### Exam Creator API

#### Create Exam
- **Endpoint**: `/api/exam/create`
- **Method**: POST
- **Body**:
  ```json
  {
    "subject": "Mathematics",
    "gradeLevel": "5th Grade",
    "examType": "MULTIPLE_CHOICE",
    "numberOfQuestions": 10,
    "customPrompt": "Create an algebra exam focusing on quadratic equations"
  }
  ```

#### Create Exam with PDF
- **Endpoint**: `/api/exam/createWithPdf`
- **Method**: POST
- **Body**: FormData with:
  - `subject`: String
  - `gradeLevel`: String
  - `examType`: String
  - `numberOfQuestions`: Number
  - `customPrompt`: String
  - `pdfFile`: File

### Exam Evaluator API

#### Evaluate Worksheet
- **Endpoint**: `/api/worksheet/evaluate`
- **Method**: POST
- **Body**: FormData with:
  - `worksheetFile`: File
  - `metadata`: JSON string with:
    ```json
    {
      "studentName": "John Doe",
      "studentId": "STU001",
      "subject": "Mathematics",
      "worksheetTitle": "Algebra Practice",
      "evaluationCriteria": "moderate",
      "additionalInstructions": "Consider partial marks",
      "teacherNotes": "Focus on problem-solving approach"
    }
    ```

#### Evaluate with Question and Answer PDFs
- **Endpoint**: `/api/worksheet/evaluate2`
- **Method**: POST
- **Body**: FormData with:
  - `quesPdf`: File
  - `ansPdf`: File

### Video Generation API

#### Generate Video Prompt
- **Endpoint**: `/api/sahayak/video/generate-prompt`
- **Method**: POST
- **Body**:
  ```json
  {
    "context": {
      "teachingPrompt": "Custom teaching prompt",
      "chatHistory": [
        {
          "role": "user",
          "content": "User message",
          "timestamp": "2025-07-27T01:42:13.000Z"
        },
        {
          "role": "assistant",
          "content": "Assistant response",
          "timestamp": "2025-07-27T01:42:20.000Z"
        }
      ],
      "timestamp": "2025-07-27T01:45:00.000Z"
    }
  }
  ```

#### Generate Video
- **Endpoint**: `/api/sahayak/video/generate`
- **Method**: POST
- **Body**:
  ```json
  {
    "prompt": "Generated video prompt"
  }
  ```

#### Check Video Status
- **Endpoint**: `/api/sahayak/video/status`
- **Method**: GET
- **Query Parameters**:
  - `operationName`: String

#### Download Video
- **Endpoint**: `/api/sahayak/video/download`
- **Method**: POST
- **Body**:
  ```json
  {
    "videoUri": "Video URI from status response"
  }
  ```

### Future Plan API

#### Generate Future Plan
- **Endpoint**: `/api/sahayak/future-plan/generate`
- **Method**: POST
- **Body**:
  ```json
  {
    "text": "Generated prompt with student information"
  }
  ```

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For any inquiries, please contact the development team.
