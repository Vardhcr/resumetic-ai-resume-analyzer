import unittest

from app.services.skill_gap_analyzer import analyze_job_gap


class SkillGapAnalyzerTests(unittest.TestCase):
    def test_missing_skills_are_jd_skills_not_in_resume(self):
        resume_text = "Skills\nPython, SQL, Git\nExperience\nBuilt internal tools."
        jd_text = "We need a candidate skilled in Python, Docker, Kubernetes, and AWS."

        result = analyze_job_gap(resume_text, jd_text, job_title="Backend Engineer")

        self.assertIn("Python", result["skill_gap"]["matched_skills"])
        self.assertIn("Docker", result["skill_gap"]["missing_skills"])
        self.assertIn("AWS", result["skill_gap"]["missing_skills"])
        self.assertNotIn("Python", result["skill_gap"]["missing_skills"])

    def test_every_missing_skill_gets_a_recommendation(self):
        resume_text = "Skills\nPython"
        jd_text = "Looking for React and Docker experience."

        result = analyze_job_gap(resume_text, jd_text)

        rec_skills = {r["skill"] for r in result["recommendations"]}
        self.assertEqual(rec_skills, set(result["skill_gap"]["missing_skills"]))
        for rec in result["recommendations"]:
            self.assertIn("free_courses", rec)
            self.assertIn("free_practice", rec)

    def test_perfect_coverage_when_all_jd_skills_present(self):
        resume_text = "Skills\nPython, SQL"
        jd_text = "Must know Python and SQL."

        result = analyze_job_gap(resume_text, jd_text)

        self.assertEqual(result["skill_gap"]["missing_skill_count"], 0)
        self.assertEqual(result["skill_gap"]["coverage_percentage"], 100)

    def test_precomputed_resume_skills_are_reused_without_reextraction(self):
        # resume_text intentionally has no extractable skills; only the
        # passed-in resume_skills list should be used for matching.
        result = analyze_job_gap(
            resume_text="Just a plain paragraph with no keywords.",
            jd_text="Needs Python and Java.",
            resume_skills=["Python"],
        )

        self.assertIn("Python", result["skill_gap"]["matched_skills"])
        self.assertIn("Java", result["skill_gap"]["missing_skills"])


if __name__ == "__main__":
    unittest.main()
