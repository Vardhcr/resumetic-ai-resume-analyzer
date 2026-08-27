from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import shutil
import uuid

from app.services.pdf_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills
from app.services.ats_scorer import calculate_ats_score
from app.services.section_analyzer import analyze_resume_sections
from app.services.recommendation_engine import generate_recommendations
from app.services.response_builder import response_builder
from app.services.jd_matcher import jd_matcher
from app.services.ollama_service import get_ollama_status, chat_with_ollama
from app.services.skill_gap_analyzer import analyze_job_gap

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None
    model: Optional[str] = None
    resume_context: Optional[Dict[str, Any]] = None


class JDMatchRequest(BaseModel):
    resume_text: str
    jd_text: str

class JobGapRequest(BaseModel):
    resume_text: str
    jd_text: str
    job_title: Optional[str] = None
    resume_skills: Optional[List[str]] = None

@router.get("/test")
def test_resume_route():
    return {"message": "Resume route is working"}


@router.get("/ollama-status")
def check_ollama():
    """Returns local Ollama health status and available models."""
    return get_ollama_status()


@router.post("/chat")
def chat_route(payload: ChatRequest):
    """Processes chat requests via local Ollama LLM."""
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    
    result = chat_with_ollama(
        message=payload.message.strip(),
        conversation_history=payload.conversation_history,
        model=payload.model,
        resume_context=payload.resume_context
    )
    return result


@router.post("/match-jd")
def match_job_description(payload: JDMatchRequest):
    """Compares resume text against a Job Description and returns match metrics."""
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required for JD matching.")
    if not payload.jd_text or not payload.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text is required for JD matching.")

    match_result = jd_matcher.calculate_match(
        resume_text=payload.resume_text,
        jd_text=payload.jd_text
    )
    return {
        "success": True,
        "data": match_result
    }

@router.post("/job-gap")
def job_gap_analysis(payload: JobGapRequest):
    """Analyzes the skill gap between a resume and a target job."""
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text is required for job gap analysis."
        )

    if not payload.jd_text or not payload.jd_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description text is required for job gap analysis."
        )

    result = analyze_job_gap(
        resume_text=payload.resume_text,
        jd_text=payload.jd_text,
        job_title=payload.job_title,
        resume_skills=payload.resume_skills
    )

    return {
        "success": True,
        "data": result
    }


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
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

        # Keep extracted text preview & full text available for chatbot context
        response["preview_text"] = extracted_text[:1200]
        response["full_text"] = extracted_text

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