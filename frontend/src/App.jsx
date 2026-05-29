import { useState, useRef } from 'react'

import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import API from './services/api'

import './App.css'

function App() {

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [selectedFile, setSelectedFile] = useState("")
  const [resumeText, setResumeText] = useState("")

  const [skills, setSkills] = useState([])

  const [atsScore, setAtsScore] = useState(0)
  const [feedback, setFeedback] = useState([])

  const fileInputRef = useRef(null)

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (event) => {

    const file = event.target.files[0]

    if (!file) return

    setSelectedFile(file.name)

    const formData = new FormData()
    formData.append("file", file)

    try {

      setLoading(true)

      setMessage("Uploading and analyzing resume...")

      setResumeText("")
      setSkills([])
      setAtsScore(0)
      setFeedback([])

      const response = await API.post(
        "/resume/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      setMessage(response.data.message)

      setResumeText(response.data.extracted_text)

      setSkills(response.data.skills)

      setAtsScore(response.data.ats_score)

      setFeedback(response.data.feedback)

    } catch (error) {

      console.error(error)

      setMessage("Upload failed. Please try again.")

    } finally {

      setLoading(false)

    }
  }

  return (
    <>
      <section id="center">

        <div className="hero">

          <img
            src={heroImg}
            className="base"
            width="170"
            height="179"
            alt=""
          />

          <img
            src={reactLogo}
            className="framework"
            alt="React logo"
          />

          <img
            src={viteLogo}
            className="vite"
            alt="Vite logo"
          />

        </div>

        <div>

          <h1>AI Resume Analyzer</h1>

          <p>
            Analyze resumes, improve ATS score,
            and get AI-powered career insights.
          </p>

        </div>

        <button
          type="button"
          className="counter"
          onClick={handleButtonClick}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Upload Resume"}
        </button>

        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {
          selectedFile && (
            <p>
              Selected File: {selectedFile}
            </p>
          )
        }

        {
          message && (
            <p>
              {message}
            </p>
          )
        }

      </section>

      <div className="ticks"></div>

      <section id="next-steps">

        <div id="docs">

          <svg
            className="icon"
            role="presentation"
            aria-hidden="true"
          >
            <use href="/icons.svg#documentation-icon"></use>
          </svg>

          <h2>Documentation</h2>

          <p>Your questions, answered</p>

          <ul>

            <li>
              <a href="https://vite.dev/" target="_blank">
                <img
                  className="logo"
                  src={viteLogo}
                  alt=""
                />
                Explore Vite
              </a>
            </li>

            <li>
              <a href="https://react.dev/" target="_blank">
                <img
                  className="button-icon"
                  src={reactLogo}
                  alt=""
                />
                Learn more
              </a>
            </li>

          </ul>

        </div>

        <div id="social">

          <svg
            className="icon"
            role="presentation"
            aria-hidden="true"
          >
            <use href="/icons.svg#social-icon"></use>
          </svg>

          <h2>Connect with us</h2>

          <p>Join the Vite community</p>

          <ul>

            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>

            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>

            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>

            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>

          </ul>

        </div>

      </section>

      <div className="ticks"></div>

      {
        atsScore > 0 && (
          <section
            style={{
              maxWidth: "1000px",
              margin: "40px auto",
              padding: "20px",
              border: "1px solid #333",
              borderRadius: "12px"
            }}
          >
            <h2>ATS Score</h2>

            <h1
              style={{
                fontSize: "3rem",
                margin: "20px 0"
              }}
            >
              {atsScore}/100
            </h1>

            <ul
              style={{
                textAlign: "left"
              }}
            >
              {
                feedback.map((item, index) => (
                  <li key={index}>
                    ✓ {item}
                  </li>
                ))
              }
            </ul>

          </section>
        )
      }

      {
        skills.length > 0 && (
          <section
            style={{
              maxWidth: "1000px",
              margin: "40px auto",
              padding: "20px",
              border: "1px solid #333",
              borderRadius: "12px"
            }}
          >
            <h2>Detected Skills</h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "15px"
              }}
            >
              {
                skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: "8px 14px",
                      border: "1px solid #555",
                      borderRadius: "20px"
                    }}
                  >
                    {skill}
                  </span>
                ))
              }
            </div>

          </section>
        )
      }

      {
        resumeText && (
          <section
            style={{
              maxWidth: "1000px",
              margin: "40px auto",
              padding: "20px",
              border: "1px solid #333",
              borderRadius: "12px",
              textAlign: "left"
            }}
          >
            <h2>Extracted Resume Text</h2>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowX: "auto"
              }}
            >
              {resumeText}
            </pre>

          </section>
        )
      }

      <section id="spacer"></section>

    </>
  )
}

export default App