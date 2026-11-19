import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import '../styles/applicationDetails.css'

interface ApiApplication {
  _id: string
  userID: string
  jobTitle: string
  company: string
  status: string
  dateApplied: string
  notes: string
}

function ApplicationDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [application, setApplication] = useState<ApiApplication | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')
  const [interviewType, setInterviewType] = useState('technical')
  const [interviewNotes, setInterviewNotes] = useState('')

  useEffect(() => {
    const loadApplication = async () => {
      if (!id) {
        return
      }

      const result = await apiFetch<ApiApplication>(
        `/api/applications/${id}`
      )

      if (!result.ok) {
        console.error(
          'Failed to load application:',
          result.error
        )
        return
      }

      setApplication(result.data)
    }

    loadApplication()
  }, [id])

  if (!application) {
    return (
      <div className="application-details-page">
        Loading application...
      </div>
    )
  }

  const formattedDate = new Date(
    application.dateApplied
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleResumeUpload = (
    event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0]

      if (!file) {
          return
      }

      setResumeFile(file)
    }

  const handleRemoveResume = () => {
    setResumeFile(null)
  }

  return (
    <div className="application-details-page">

      <button
        type="button"
        className="details-back-button"
        onClick={() => navigate('/applications')}
      >
        ← Applications
      </button>

      <header className="details-header">
        <div>
          <p className="details-eyebrow">
            Application
          </p>

          <h1>{application.company}</h1>

          <p className="details-role">
            {application.jobTitle}
          </p>
        </div>

        <span
          className={`details-status status-${application.status}`}
        >
          {formatStatus(application.status)}
        </span>
      </header>

      <nav className="details-tabs">
        <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
        >
            Overview
        </button>

        <button
            className={activeTab === 'job-description' ? 'active' : ''}
            onClick={() => setActiveTab('job-description')}
        >
            Job description
        </button>

        <button
            className={activeTab === 'resume' ? 'active' : ''}
            onClick={() => setActiveTab('resume')}
        >
            Resume
        </button>

        <button
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
        >
            Projects
        </button>

        <button
            className={activeTab === 'interviews' ? 'active' : ''}
            onClick={() => setActiveTab('interviews')}
        >
            Interviews
        </button>
        </nav>

      {activeTab === 'overview' && (
        <section className="details-grid">

        <div className="details-main">

          <section className="details-section">
            <p className="details-eyebrow">
              Application details
            </p>

            <h2>Overview</h2>

            <div className="details-info-grid">

              <div>
                <span>Status</span>
                <strong>
                  {formatStatus(application.status)}
                </strong>
              </div>

              <div>
                <span>Date applied</span>
                <strong>
                  {formattedDate}
                </strong>
              </div>

              <div>
                <span>Company</span>
                <strong>
                  {application.company}
                </strong>
              </div>

              <div>
                <span>Position</span>
                <strong>
                  {application.jobTitle}
                </strong>
              </div>

            </div>
          </section>

          <section className="details-section">
            <p className="details-eyebrow">
              Notes
            </p>

            <h2>Application notes</h2>

            <div className="details-placeholder">
              {application.notes
                ? application.notes
                : 'No notes have been added yet.'}
            </div>
          </section>

        </div>

        <aside className="details-sidebar">

          <section className="details-side-card">
            <p className="details-eyebrow">
              Next step
            </p>

            <h3>
              {application.status === 'interviewing'
                ? 'Prepare for your interview'
                : application.status === 'offer'
                ? 'Review your offer'
                : 'Check application progress'}
            </h3>

            <p>
              Nextstep recommendations will appear
              here as more application data is added.
            </p>
          </section>

          <section className="details-side-card">
            <p className="details-eyebrow">
              Resume
            </p>

            <h3>No resume attached</h3>

            <p>
              Attach the resume used for this
              application.
            </p>

            <button type="button">
              Upload resume
            </button>
          </section>

        </aside>

      </section>
      )}

      {activeTab === 'job-description' && (
        <section className="details-section details-tab-section">
            <div className="details-tab-heading">
            <div>
                <p className="details-eyebrow">
                Position details
                </p>

                <h2>Job description</h2>

                <p>
                Save the job posting so Nextstep can compare
                it against your resume and suggest ways to
                stand out.
                </p>
            </div>
            </div>

            <textarea
            className="job-description-input"
            placeholder="Paste the job description here..."
            rows={16}
            />

            <div className="details-tab-actions">
            <button type="button">
                Save job description
            </button>
            </div>
        </section>
      )}

      {activeTab === 'resume' && (
        <section className="details-section details-tab-section">
            <div className="details-tab-heading">
            <div>
                <p className="details-eyebrow">
                Documents
                </p>

                <h2>Resume</h2>

                <p>
                Attach the resume you used for this application.
                Later, Nextstep can compare it with the job
                description and provide tailored suggestions.
                </p>
            </div>
            </div>

            {!resumeFile ? (
            <div className="resume-upload-area">
                <div className="resume-upload-icon">
                ↑
                </div>

                <h3>No resume attached</h3>

                <p>
                Upload the resume used for this application.
                </p>

                <label className="resume-upload-button">
                Upload resume

                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    hidden
                />
                </label>

                <span className="resume-file-types">
                PDF, DOC, or DOCX
                </span>
            </div>
            ) : (
            <div className="resume-file-card">
                <div className="resume-file-icon">
                PDF
                </div>

                <div className="resume-file-info">
                <strong>{resumeFile.name}</strong>

                <span>
                    {(resumeFile.size / 1024).toFixed(0)} KB
                </span>
                </div>

                <div className="resume-file-actions">
                <label>
                    Replace

                    <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    hidden
                    />
                </label>

                <button
                    type="button"
                    onClick={handleRemoveResume}
                >
                    Remove
                </button>
                </div>
            </div>
            )}

            <div className="resume-analysis-panel">
            <div>
                <p className="details-eyebrow">
                Resume analysis
                </p>

                <h3>Tailored feedback</h3>

                <p>
                Once resume analysis is connected, this section
                can show match score, missing skills, and ways to
                improve your resume for this company.
                </p>
            </div>

            <span className="coming-soon-badge">
                Coming soon
            </span>
            </div>
        </section>
        )}

        {activeTab === 'projects' && (
            <section className="details-section details-tab-section">
                <div className="details-tab-heading">
                <div>
                    <p className="details-eyebrow">
                    Stand out
                    </p>

                    <h2>Project suggestions</h2>

                    <p>
                    Nextstep will use the job description and your
                    resume to suggest projects that demonstrate
                    skills the employer is looking for.
                    </p>
                </div>
                </div>

                <div className="projects-analysis-status">
                <div>
                    <span className="projects-status-label">
                    AI project analysis
                    </span>

                    <h3>Connect your application details</h3>

                    <p>
                    Project recommendations will become available
                    after a job description and resume are attached
                    to this application.
                    </p>
                </div>

                <span className="coming-soon-badge">
                    AI coming soon
                </span>
                </div>

                <div className="project-suggestion-preview">
                <div className="project-preview-heading">
                    <div>
                    <p className="details-eyebrow">
                        Example layout
                    </p>

                    <h3>Suggested projects will appear here</h3>
                    </div>
                </div>

                <div className="project-preview-card">
                    <div className="project-preview-number">
                    01
                    </div>

                    <div className="project-preview-content">
                    <span className="project-preview-tag">
                        Personalized recommendation
                    </span>

                    <h3>Project title</h3>

                    <p>
                        A short explanation of what to build and how
                        it connects to skills found in the job
                        description.
                    </p>

                    <div className="project-skill-list">
                        <span>Skill</span>
                        <span>Skill</span>
                        <span>Skill</span>
                    </div>

                    <div className="project-reason">
                        <strong>Why this helps</strong>

                        <p>
                        Nextstep will explain why this project could
                        strengthen your application for this role.
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </section>
        )}

        {activeTab === 'interviews' && (
            <section className="details-section details-tab-section">
                <div className="details-tab-heading">
                <div>
                    <p className="details-eyebrow">
                    Schedule
                    </p>

                    <h2>Interview</h2>

                    <p>
                    Keep interview details connected to this application.
                    Scheduled interviews will eventually appear in your
                    calendar and notifications.
                    </p>
                </div>
                </div>

                <div className="interview-form-grid">

                <div className="interview-field">
                    <label htmlFor="interview-date">
                    Date
                    </label>

                    <input
                    id="interview-date"
                    type="date"
                    value={interviewDate}
                    onChange={(event) =>
                        setInterviewDate(event.target.value)
                    }
                    />
                </div>

                <div className="interview-field">
                    <label htmlFor="interview-time">
                    Time
                    </label>

                    <input
                    id="interview-time"
                    type="time"
                    value={interviewTime}
                    onChange={(event) =>
                        setInterviewTime(event.target.value)
                    }
                    />
                </div>

                <div className="interview-field">
                    <label htmlFor="interview-type">
                    Interview type
                    </label>

                    <select
                    id="interview-type"
                    value={interviewType}
                    onChange={(event) =>
                        setInterviewType(event.target.value)
                    }
                    >
                    <option value="recruiter">
                        Recruiter screen
                    </option>

                    <option value="technical">
                        Technical interview
                    </option>

                    <option value="behavioral">
                        Behavioral interview
                    </option>

                    <option value="onsite">
                        On-site interview
                    </option>

                    <option value="final">
                        Final interview
                    </option>
                    </select>
                </div>

                </div>

                <div className="interview-notes-field">
                <label htmlFor="interview-notes">
                    Preparation notes
                </label>

                <textarea
                    id="interview-notes"
                    rows={7}
                    placeholder="Topics to review, interviewer names, links, questions to ask..."
                    value={interviewNotes}
                    onChange={(event) =>
                    setInterviewNotes(event.target.value)
                    }
                />
                </div>

                <div className="details-tab-actions">
                <button type="button">
                    Save interview
                </button>
                </div>

                <div className="interview-integration-panel">
                <div>
                    <p className="details-eyebrow">
                    Connected features
                    </p>

                    <h3>Calendar & reminders</h3>

                    <p>
                    Once interview scheduling is connected to the backend,
                    saved interviews can automatically appear in your
                    Calendar and generate upcoming-interview alerts.
                    </p>
                </div>

                <span className="coming-soon-badge">
                    Coming soon
                </span>
                </div>
            </section>
        )}
    </div>
  )
}

export default ApplicationDetailsPage