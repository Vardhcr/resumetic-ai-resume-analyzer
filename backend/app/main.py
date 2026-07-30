from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.resume import router as resume_router

app = FastAPI(title="Resumetic API", version="2.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "https://resumetic.netlify.app",

    "https://resumetic-ai-resume-analyzer-production.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Resumetic AI Resume Analyzer Backend is running successfully"
    }

app.include_router(
    resume_router,
    prefix="/resume",
    tags=["Resume"]
)