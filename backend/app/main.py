from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.resume import router as resume_router

app = FastAPI(title="Resumetic API", version="2.0")

# Allow all local network, production, and mobile origins for seamless cross-device communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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