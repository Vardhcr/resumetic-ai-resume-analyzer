import re
from difflib import SequenceMatcher


class JDMatcher:
    """
    Production-ready Job Description Matcher

    Features:
    - Resume vs JD Match %
    - Missing Skills Detection
    - Matched Skills
    - Keyword Coverage
    - Strength Areas
    """

    COMMON_SKILLS = {
        "python",
        "java",
        "c",
        "c++",
        "c#",
        "javascript",
        "typescript",
        "react",
        "angular",
        "vue",
        "nextjs",
        "node",
        "express",
        "fastapi",
        "django",
        "flask",
        "spring",
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "oracle",
        "redis",
        "firebase",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "linux",
        "git",
        "github",
        "gitlab",
        "rest",
        "api",
        "graphql",
        "html",
        "css",
        "bootstrap",
        "tailwind",
        "pandas",
        "numpy",
        "matplotlib",
        "scikit-learn",
        "tensorflow",
        "pytorch",
        "machine learning",
        "deep learning",
        "data science",
        "data analysis",
        "power bi",
        "tableau",
        "excel",
        "nlp",
        "opencv",
        "computer vision",
        "blockchain",
        "cyber security",
        "networking",
        "oop",
        "dsa",
        "data structures",
        "algorithms",
        "agile",
        "scrum",
        "microservices",
        "ci/cd",
        "jenkins",
        "terraform",
        "cloudformation",
    }

    def __init__(self):
        pass

    @staticmethod
    def clean_text(text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^\w\s+#.-]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def extract_skills(self, text: str):
        text = self.clean_text(text)

        found = []

        for skill in self.COMMON_SKILLS:
            pattern = r"\b" + re.escape(skill) + r"\b"
            if re.search(pattern, text):
                found.append(skill)

        return sorted(set(found))

    @staticmethod
    def similarity(a: str, b: str):
        return SequenceMatcher(None, a, b).ratio()

    def keyword_score(self, resume_text: str, jd_text: str):
        resume_words = set(self.clean_text(resume_text).split())
        jd_words = set(self.clean_text(jd_text).split())

        if not jd_words:
            return 0

        overlap = len(resume_words.intersection(jd_words))
        return round((overlap / len(jd_words)) * 100)

    def calculate_match(
        self,
        resume_text: str,
        jd_text: str,
    ):
        resume_skills = self.extract_skills(resume_text)
        jd_skills = self.extract_skills(jd_text)

        matched = sorted(
            list(set(resume_skills).intersection(jd_skills))
        )

        missing = sorted(
            list(set(jd_skills) - set(resume_skills))
        )

        if jd_skills:
            skill_score = (len(matched) / len(jd_skills)) * 100
        else:
            skill_score = 0

        keyword_score = self.keyword_score(
            resume_text,
            jd_text,
        )

        semantic_score = (
            self.similarity(
                self.clean_text(resume_text),
                self.clean_text(jd_text),
            )
            * 100
        )

        final_score = round(
            (
                skill_score * 0.60
                + keyword_score * 0.20
                + semantic_score * 0.20
            )
        )

        final_score = max(0, min(100, final_score))

        if final_score >= 90:
            grade = "Excellent"
        elif final_score >= 80:
            grade = "Very Good"
        elif final_score >= 70:
            grade = "Good"
        elif final_score >= 60:
            grade = "Average"
        else:
            grade = "Needs Improvement"

        return {
            "match_percentage": final_score,
            "resume_grade": grade,
            "matched_skills": matched,
            "missing_skills": missing,
            "resume_skill_count": len(resume_skills),
            "job_skill_count": len(jd_skills),
            "matched_skill_count": len(matched),
            "keyword_score": keyword_score,
            "semantic_score": round(semantic_score),
            "strengths": matched[:10],
            "recommendations": [
                f"Learn '{skill}' to improve the match."
                for skill in missing[:10]
            ],
        }


jd_matcher = JDMatcher()