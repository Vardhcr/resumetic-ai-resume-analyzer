# 🚀 RESUMETIC – AI Resume Analyzer & Career Assistant

An AI-powered Resume Analyzer and Career Assistant that evaluates resumes, calculates ATS scores, analyzes resume sections, identifies missing skills, compares resumes with job descriptions, and provides personalized career recommendations.

Built with **FastAPI**, **React (Vite)**, and modern web technologies.

---

## ✨ Features

### 📄 Resume Analysis
- Upload PDF resumes
- Automatic text extraction
- Resume section detection
- Resume grading
- Resume statistics
- ATS score calculation
- Resume quality analysis

### 🎯 ATS Scoring
- ATS compatibility score
- Resume completeness analysis
- Keyword optimization
- Formatting evaluation

### 🧠 Skill Analysis
- Technical skill extraction
- Soft skill detection
- Missing skill identification
- Skill categorization

### 💼 Job Description Matching
- Resume vs Job Description comparison
- Match percentage
- Missing keyword detection
- Skill gap analysis

### 🎓 Career Recommendations
- Personalized improvement suggestions
- Resume enhancement tips
- Career guidance
- Learning recommendations

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- JavaScript
- CSS
- Axios

## Backend
- FastAPI
- Python
- PyMuPDF
- Uvicorn

---

# 📂 Project Structure

```text
resumetic-ai-resume-analyzer/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── docs/
├── .gitignore
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/Vardhcr/resumetic-ai-resume-analyzer.git
```

```bash
cd resumetic-ai-resume-analyzer
```

---

# Backend Setup

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate

### Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run FastAPI

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://127.0.0.1:8000
```

---

# Frontend Setup

```bash
cd frontend
```

Install packages

```bash
npm install
```

Run

```bash
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# API Overview

## Upload Resume

```
POST /resume/upload
```

Uploads a resume PDF and returns:

- ATS Score
- Resume Grade
- Skills
- Statistics
- Section Analysis
- Recommendations

---

# Screenshots

> Screenshots of the application will be added after deployment.

---

# Current Modules

- Resume Upload
- Resume Parsing
- ATS Scoring
- Resume Statistics
- Resume Grade
- Section Analysis
- Skill Extraction
- Recommendation Engine
- Job Description Matcher

---

# Future Enhancements

- AI Chat Assistant
- Multi-language Resume Analysis
- Resume Builder
- Interview Question Generator
- LinkedIn Profile Analyzer
- Cover Letter Generator
- Authentication
- User Dashboard
- Cloud Deployment
- Analytics Dashboard

---

# Contributing

Contributions, suggestions, and feature requests are welcome.

Feel free to fork the repository and submit pull requests.

---

# Author

**Jyothi Vardhan Bonumuddula**

GitHub

https://github.com/Vardhcr

LinkedIn

www.linkedin.com/in/jyothivardhan-bonumuddula-b872b3326
---

# License

This project is licensed under the MIT License.

---

⭐ If you found this project useful, consider giving it a star.