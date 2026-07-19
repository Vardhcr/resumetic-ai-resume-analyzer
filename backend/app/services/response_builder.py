from typing import Dict, List, Any
from collections import defaultdict
import math


class ResponseBuilder:
    """
    Builds a clean, production-ready API response for resume analysis.
    """

    SKILL_CATEGORIES = {
        "Programming": {
            "python", "java", "c", "c++", "c#", "javascript",
            "typescript", "go", "rust", "php", "ruby", "kotlin", "swift"
        },
        "Web Development": {
            "html", "css", "react", "nextjs", "vue", "angular",
            "node", "express", "fastapi", "django", "flask", "bootstrap",
            "tailwind"
        },
        "Database": {
            "sql", "mysql", "postgresql", "mongodb",
            "oracle", "sqlite", "redis", "firebase"
        },
        "Cloud & DevOps": {
            "aws", "azure", "gcp", "docker", "kubernetes",
            "terraform", "jenkins", "git", "github",
            "gitlab", "ci/cd"
        },
        "Data Science & AI": {
            "numpy", "pandas", "matplotlib",
            "scikit-learn", "tensorflow",
            "pytorch", "machine learning",
            "deep learning", "nlp",
            "computer vision", "opencv",
            "data science", "power bi",
            "tableau"
        },
        "Computer Science": {
            "dsa", "data structures",
            "algorithms", "oop",
            "operating systems",
            "computer networks",
            "networking",
            "cyber security",
            "blockchain"
        }
    }

    def __init__(self):
        pass

    def build(
        self,
        extracted_text: str,
        ats_score: int,
        skills: List[str],
        sections: Dict[str, Any],
        recommendations: List[str],
    ) -> Dict[str, Any]:

        categorized_skills = self._categorize_skills(skills)

        statistics = self._statistics(
            extracted_text,
            skills,
            sections,
            ats_score
        )

        return {
            "success": True,
            "message": "Resume analyzed successfully.",
            "analysis": {
                "ats_score": ats_score,
                "resume_grade": self._grade(ats_score),
                "statistics": statistics,
                "skills": {
                    "total": len(skills),
                    "items": sorted(skills),
                    "categories": categorized_skills,
                },
                "sections": sections,
                "recommendations": recommendations,
            }
        }

    def _grade(self, score: int) -> str:

        if score >= 95:
            return "A+"

        if score >= 90:
            return "A"

        if score >= 85:
            return "B+"

        if score >= 75:
            return "B"

        if score >= 65:
            return "C"

        if score >= 50:
            return "D"

        return "F"

    def _statistics(
        self,
        text: str,
        skills: List[str],
        sections: Dict[str, Any],
        ats_score: int,
    ) -> Dict[str, Any]:

        words = text.split()

        completed = 0
        missing = 0

        for value in sections.values():

            if isinstance(value, bool):
                if value:
                    completed += 1
                else:
                    missing += 1

            elif value:
                completed += 1
            else:
                missing += 1

        page_estimate = max(
            1,
            math.ceil(len(words) / 500)
        )

        return {
            "word_count": len(words),
            "estimated_pages": page_estimate,
            "total_skills": len(skills),
            "completed_sections": completed,
            "missing_sections": missing,
            "ats_score": ats_score,
            "resume_grade": self._grade(ats_score),
        }

    def _categorize_skills(
        self,
        skills: List[str]
    ) -> Dict[str, List[str]]:

        result = defaultdict(list)

        normalized = {
            skill.lower(): skill
            for skill in skills
        }

        assigned = set()

        for category, known in self.SKILL_CATEGORIES.items():

            for key in known:

                if key in normalized:
                    result[category].append(
                        normalized[key]
                    )
                    assigned.add(key)

        remaining = []

        for skill in skills:

            if skill.lower() not in assigned:
                remaining.append(skill)

        if remaining:
            result["Other"] = sorted(remaining)

        final = {}

        for category in sorted(result.keys()):
            final[category] = sorted(result[category])

        return final


response_builder = ResponseBuilder()