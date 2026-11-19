import { useState } from 'react'
import '../styles/resumes.css'

interface ResumeFile {
  id: number
  file: File
}

function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeFile[]>([])

  const handleResumeUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files

    if (!files) {
      return
    }

    const uploadedResumes = Array.from(files).map(
      (file) => ({
        id: Date.now() + Math.random(),
        file,
      })
    )

    setResumes((current) => [
      ...current,
      ...uploadedResumes,
    ])

    event.target.value = ''
  }

  const handleRemoveResume = (resumeId: number) => {
    setResumes((current) =>
      current.filter(
        (resume) => resume.id !== resumeId
      )
    )
  }

  return (
    <div className="resumes-page">

      <header className="resumes-header">
        <div>
          <p className="resumes-eyebrow">
            Documents
          </p>

          <h1>Resumes</h1>

          <p className="resumes-subtitle">
            Manage the resumes you use across your job
            search.
          </p>
        </div>
      </header>

      <section className="resumes-summary">

        <div>
          <span>Total resumes</span>
          <strong>{resumes.length}</strong>
        </div>

        <div>
          <span>Used in applications</span>
          <strong>—</strong>
        </div>

        <div>
          <span>Best performing</span>
          <strong>—</strong>
        </div>

      </section>

      <section className="resumes-section">

        <div className="resumes-section-heading">
          <div>
            <p className="resumes-eyebrow">
              Your documents
            </p>

            <h2>Resume library</h2>
          </div>

          <span>
            {resumes.length}{' '}
            {resumes.length === 1
              ? 'document'
              : 'documents'}
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="resumes-empty">

            <div className="resumes-empty-icon">
              ↑
            </div>

            <h3>No resumes uploaded yet</h3>

            <p>
              Upload a resume to start building your
              document library.
            </p>

            <label className="resumes-empty-upload">
              Upload your first resume

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                hidden
                onChange={handleResumeUpload}
              />
            </label>

            <span>
              PDF, DOC, or DOCX
            </span>

          </div>
        ) : (
          <div className="resume-library">

            {resumes.map((resume) => (
              <article
                className="resume-library-card"
                key={resume.id}
              >

                <div className="resume-card-icon">
                  DOC
                </div>

                <div className="resume-card-content">

                  <div className="resume-card-heading">
                    <div>
                      <h3>
                        {resume.file.name}
                      </h3>

                      <p>
                        {(
                          resume.file.size / 1024
                        ).toFixed(0)}{' '}
                        KB
                      </p>
                    </div>

                    <span className="resume-ready-badge">
                      Ready
                    </span>
                  </div>

                  <div className="resume-card-metadata">
                    <div>
                      <span>Applications</span>
                      <strong>—</strong>
                    </div>

                    <div>
                      <span>Interview rate</span>
                      <strong>—</strong>
                    </div>

                    <div>
                      <span>Last used</span>
                      <strong>—</strong>
                    </div>
                  </div>

                  <div className="resume-card-actions">

                    <button type="button">
                      View
                    </button>

                    <label>
                      Replace

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        hidden
                      />
                    </label>

                    <button
                      type="button"
                      className="resume-remove-button"
                      onClick={() =>
                        handleRemoveResume(resume.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      <section className="resume-insights-panel">

        <div>
          <p className="resumes-eyebrow">
            Coming later
          </p>

          <h2>Resume performance</h2>

          <p>
            Once resumes are connected to applications,
            Nextstep can show which resume versions
            generate the strongest interview results.
          </p>
        </div>

        <div className="resume-insight-preview">

          <div>
            <span>Applications</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Interviews</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Interview rate</span>
            <strong>—</strong>
          </div>

        </div>

      </section>

    </div>
  )
}

export default ResumesPage