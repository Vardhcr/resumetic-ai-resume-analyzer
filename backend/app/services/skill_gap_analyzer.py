"""
Skill Gap Analyzer ("Job Pole").

Computes the difference between a candidate's resume skills and the skills
required by a target job description, then pairs every missing skill with a
free course and/or free internship-style resource.

Design notes (kept deliberately low-cost / low-credential):
- Skill extraction reuses `skill_extractor.py`'s master skill vocabulary for
  BOTH the resume and the JD, so the "missing skills" list uses the exact
  same skill names the user already sees in their resume analysis.
- The overall match/keyword/semantic score reuses the existing, already
  tested `jd_matcher.calculate_match` untouched — no new scoring logic, no
  behavior change to /match-jd.
- Resource suggestions come from a static local dictionary
  (`career_resources.py`) — no external API or LLM call, so this endpoint
  costs nothing to serve beyond CPU.
"""

from typing import Dict, Any, List, Optional

from app.services.skill_extractor import extract_skills
from app.services.jd_matcher import jd_matcher
from app.services.career_resources import get_resources_for_skill


def analyze_job_gap(
    resume_text: str,
    jd_text: str,
    job_title: Optional[str] = None,
    resume_skills: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Compare a resume against a target job description.

    Args:
        resume_text: full resume text (e.g. the `full_text` already returned
            by /upload, so the frontend doesn't need to re-upload the PDF).
        jd_text: the job description the user pastes/describes.
        job_title: optional label the user gives the role, for display only.
        resume_skills: optional list of skills already extracted during
            /upload (`analysis.skills.items`). If provided, skips
            re-extraction; otherwise skills are derived from resume_text.
    """

    resume_skill_set = (
        set(resume_skills) if resume_skills else set(extract_skills(resume_text))
    )
    jd_skill_set = set(extract_skills(jd_text))

    matched_skills = sorted(resume_skill_set.intersection(jd_skill_set))
    missing_skills = sorted(jd_skill_set - resume_skill_set)

    coverage_percentage = (
        round((len(matched_skills) / len(jd_skill_set)) * 100) if jd_skill_set else 0
    )

    # Untouched, already-tested resume-vs-JD scoring (keyword + semantic
    # overlap) — reused as-is for the overall percentage/grade.
    overall_match = jd_matcher.calculate_match(resume_text, jd_text)

    skill_recommendations = [
        {"skill": skill, **get_resources_for_skill(skill)}
        for skill in missing_skills
    ]

    return {
        "success": True,
        "job_title": job_title or "Target Role",
        "overall_match": {
            "match_percentage": overall_match["match_percentage"],
            "resume_grade": overall_match["resume_grade"],
            "keyword_score": overall_match["keyword_score"],
            "semantic_score": overall_match["semantic_score"],
        },
        "skill_gap": {
            "required_skill_count": len(jd_skill_set),
            "matched_skill_count": len(matched_skills),
            "missing_skill_count": len(missing_skills),
            "coverage_percentage": coverage_percentage,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
        },
        "recommendations": skill_recommendations,
    }
