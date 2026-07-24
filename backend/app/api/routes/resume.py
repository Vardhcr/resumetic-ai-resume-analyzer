from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil

from app.services.pdf_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills
from app.services.ats_scorer import calculate_ats_score
from app.services.section_analyzer import analyze_resume_sections
from app.services.recommendation_engine import generate_recommendations
from app.services.response_builder import response_builder

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.get("/test")
def test_resume_route():
    return {"message": "Resume route is working"}


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        return {
            "success": False,
            "message": "Only PDF files are allowed"
        }

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract resume text
    extracted_text = extract_text_from_pdf(file_path)

    # Extract skills
    skills = extract_skills(extracted_text)

    # ATS Score
    ats_result = calculate_ats_score(
        extracted_text,
        skills
    )

    # Resume Sections
    section_result = analyze_resume_sections(
        extracted_text,
        ats_result["candidate_profile"]
    )

    # Recommendations
    recommendations = generate_recommendations(
        section_result["found_sections"],
        section_result["missing_sections"],
        skills,
        ats_result["ats_score"],
        ats_result["candidate_profile"]
    )

    response = response_builder.build(
        extracted_text=extracted_text,
        ats_score=ats_result["ats_score"],
        skills=skills,
        sections=section_result["sections"],
        recommendations=recommendations
    )

    response["filename"] = file.filename
    response["feedback"] = ats_result["feedback"]
    response["candidate_profile"] = ats_result["candidate_profile"]
    response["analysis"]["candidate_profile"] = ats_result["candidate_profile"]
    response["analysis"]["score_breakdown"] = ats_result["score_breakdown"]
    response["analysis"]["raw_points"] = ats_result["raw_points"]
    response["analysis"]["maximum_points"] = ats_result["maximum_points"]
    response["preview_text"] = extracted_text[:3000]
    response["section_summary"] = section_result["summary"]

    return response
