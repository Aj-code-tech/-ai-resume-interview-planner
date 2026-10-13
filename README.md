#  AI Resume Interview Planner

project URL =  https://gen-ai-resume-frontend-4wes.onrender.com/


##  Project Overview

**AI Resume Interview Planner** is a full-stack AI-powered application that helps candidates analyze their resumes against a job description and prepare for interviews.

The application uses **Google Generative AI** to analyze resume and job-description content, identify skill gaps, generate relevant interview questions, and provide a structured interview preparation report.

---

##  Features

*  **Resume Analysis** – Analyze uploaded resumes and extract relevant information.
*  **Job Description Analysis** – Compare the candidate's profile with the target job requirements.
*  **Skill Gap Detection** – Identify missing or relevant skills based on the job description.
*  **AI Interview Questions** – Generate personalized interview questions based on the resume and job requirements.
*  **Interview Report** – Generate a structured report containing interview preparation insights.
*  **Resume PDF Generation** – Generate a formatted resume PDF.
*  **Authentication** – User registration, login, and protected routes.
*  **User Management** – Manage authenticated user information.
*  **Full-Stack Architecture** – React frontend connected to a Node.js/Express backend.

---

##  Tech Stack

### Frontend

*  React.js
*  Vite
*  CSS / SCSS
*  React Router

### Backend

*  Node.js
*  Express.js
*  MongoDB
*  Mongoose
*  JWT Authentication

### AI & Backend Tools

*  Google Generative AI
*  Zod
*  Zod-to-JSON-Schema
*  Puppeteer
*  dotenv

### Deployment & Development

*  Git & GitHub
*  Render
*  REST APIs

---

##  Application Workflow

```text
Resume + Job Description
          ↓
      Backend API
          ↓
   Google Generative AI
          ↓
 Resume & Job Analysis
          ↓
    Skill Gap Detection
          ↓
 Interview Question Generation
          ↓
   Structured Interview Report
          ↓
     Candidate Preparation
```

---

##  Authentication

The application implements secure authentication using:

*  JWT-based authentication
*  Protected API routes
*  User-specific data
*  Environment variables for sensitive credentials

---

##  Project Structure

```text
AI-Resume-Interview-Planner/
│
├── Frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── GEN-Ai-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── ...
│
├── render.yaml
├── README.md
└── ...
```

---

## Getting Started

### 1️ Clone the Repository

```bash
git clone <repository-url>
cd AI-Resume-Interview-Planner
```

### 2️ Install Backend Dependencies

```bash
cd GEN-Ai-backend
npm install
```

### 3️ Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

### 4️ Configure Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

Add any other environment variables required by your deployment configuration.

### 5️ Run Backend

```bash
npm start
```

### 6️ Run Frontend

```bash
npm run dev
```

---

##  Project Objective

The goal of this project is to build an AI-powered platform that simplifies **resume evaluation and interview preparation** by combining full-stack development with generative AI.

The project demonstrates practical experience with:

**MERN Stack | REST APIs | Generative AI | MongoDB | JWT | React | Node.js | Express.js | Zod | PDF Generation | Deployment**

---

##  Author

**Ashish Sharma**

B.Tech – Civil Engineering
Maulana Azad National Institute of Technology (MANIT), Bhopal
