from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.resume import router as resume_router

app = FastAPI(title="Resumetic API", version="2.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "https://resumetic.netlify.app",

    "https://resumetic-ai-resume-analyzer-production.up.railway.app",

    # GitHub Pages (primary deployment since Jul 2026)
    "https://vardhcr.github.io",
]

# Allow any LAN/private IP origin (e.g. http://192.168.1.5:5173 or http://10.0.0.3:5173)
# so the app can be opened from a phone on the same Wi-Fi during development.
# Also allow any GitHub Pages project site (https://<user-or-org>.github.io)
# so the app keeps working if Pages is enabled from another account/org.
allow_origin_regex = (
    r"^(http://(\d{1,3}\.){3}\d{1,3}(:\d+)?|"
    r"https://[a-zA-Z0-9-]+\.github\.io)$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
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