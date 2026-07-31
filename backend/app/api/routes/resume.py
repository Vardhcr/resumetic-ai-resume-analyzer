from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

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
    try:
        # Mobile browsers (especially iOS) often send an empty or generic
        # content type for PDFs picked from the Files app, so also accept any
        # file whose name ends with ".pdf".
        filename = (file.filename or "").lower()
        if file.content_type != "application/pdf" and not filename.endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        unique_name = f"{uuid.uuid4()}.pdf"
        file_path = UPLOAD_DIR / unique_name

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text_from_pdf(file_path)

        skills = extract_skills(extracted_text)

        ats_result = calculate_ats_score(
            extracted_text,
            skills
        )

        section_result = analyze_resume_sections(
            extracted_text,
            ats_result["candidate_profile"]
        )

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

        # Keep the response lightweight
        response["preview_text"] = extracted_text[:1000]

        response["section_summary"] = section_result["summary"]

        try:
            file_path.unlink(missing_ok=True)
        except Exception:
            pass

        return response

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(e)}"
        )