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

# 📱 Testing on Mobile (Same Wi-Fi)

To open the website from your phone while developing locally:

1. **Find your computer's LAN IP address**

   - **Windows (PowerShell):** `ipconfig` → look for `IPv4 Address` under your active Wi-Fi adapter (e.g. `192.168.1.5`)
   - **macOS/Linux:** `ipconfig getifaddr en0` / `hostname -I`

2. **Run the backend so it listens on your whole network** (not just localhost):

   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

3. **Run the frontend dev server** (Vite already binds to `0.0.0.0`):

   ```bash
   cd frontend
   npm run dev
   ```

4. **Open the app from your phone:** browse to

   ```
   http://<YOUR-LAN-IP>:5173
   ```

   e.g. `http://192.168.1.5:5173`

> 💡 The frontend automatically detects your LAN IP and calls the backend at
> `http://<YOUR-LAN-IP>:8000`. The backend CORS settings accept private IP origins
> (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`), so the upload will work from your phone.

### 🔥 Windows Firewall (if the phone can't connect)

Allow incoming connections on ports **5173** and **8000** for private networks:

```powershell
netsh advfirewall firewall add rule name="Resumetic Frontend" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Resumetic Backend" dir=in action=allow protocol=TCP localport=8000
```

### 🔧 Overriding the backend URL

If the automatic URL detection doesn't fit your setup, create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://192.168.1.5:8000
```

Then restart the frontend dev server.

> ⚠️ If the page is served over **HTTPS** but the backend URL uses `http://`,
> browsers block the request as "mixed content". Prefer serving both over the same
> protocol (both http on LAN, or both https in production).

---

# 🌐 Deployment (Netlify)

The frontend is deployed to **Netlify** (`https://resumetic.netlify.app`). The
`netlify.toml` config:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22.12.0"
```

> ⚠️ **Important:** Vite 8 requires **Node 20.19+ or 22.12+**. Netlify's older
> default Node versions can silently fail the build and leave a **stale deploy**
> live (this caused the mobile fixes to appear "missing" in production). The
> `NODE_VERSION` pin above ensures the build always uses a compatible Node.

### Mobile behavior in production

- The deployed app always calls the **production Railway backend**
  (`https://resumetic-ai-resume-analyzer-production.up.railway.app`).
- If the page is opened from a phone on your LAN via `http://<LAN-IP>:5173`
  during development, the app first tries the local backend and
  **automatically falls back to the production backend** if the local one is
  unreachable — so uploads keep working even without a local backend running.

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

https://www.linkedin.com/in/jyothivardhan-bonumuddula-b872b3326
---

# License

This project is licensed under the MIT License.

---

⭐ If you found this project useful, consider giving it a star.