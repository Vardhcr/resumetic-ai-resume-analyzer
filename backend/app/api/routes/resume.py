from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil

from app.services.pdf_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills
from app.services.ats_scorer import calculate_ats_score

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.get("/test")
def test_resume_route():
    return {
        "message": "Resume route is working"
    }


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        return {
            "error": "Only PDF files are allowed"
        }

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text_from_pdf(file_path)

    skills = extract_skills(extracted_text)

    ats_result = calculate_ats_score(
        extracted_text,
        skills
    )

    return {
        "filename": file.filename,
        "message": "Resume uploaded successfully",
        "extracted_text": extracted_text[:3000],
        "skills": skills,
        "ats_score": ats_result["ats_score"],
        "feedback": ats_result["feedback"]
    }