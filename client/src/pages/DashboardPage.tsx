import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../utils/session'
import { apiFetch } from '../utils/api'
import '../styles/overview.css'

interface ApiApplication {
  _id: string
  userID: string
  jobTitle: string
  company: string
  status: string
  dateApplied: string
  notes: string
}

function DashboardPage() {
  const session = getSession()

  const navigate = useNavigate()

  const [applications, setApplications] =
    useState<ApiApplication[]>([])

  useEffect(() => {
    const loadApplications = async () => {
      if (!session) {
        return
      }

      const result = await apiFetch<ApiApplication[]>(
        `/api/users/${session.user._id}/applications`
      )

      if (!result.ok) {
        console.error(
          'Failed to load applications:',
          result.error
        )
        return
      }

      setApplications(result.data)
    }

    loadApplications()
  }, [])

  const totalApplications = applications.length

  const interviewingApplications = applications.filter(
    (application) =>
      application.status === 'interviewing'
  ).length

  const offers = applications.filter(
    (application) =>
      application.status === 'offer'
  ).length

  const activeApplications = applications.filter(
    (application) =>
      application.status !== 'rejected'
  )

  const getNextStep = (
    application: ApiApplication
  ) => {
    switch (application.status) {
      case 'interviewing':
        return 'Prepare for your next interview'

      case 'offer':
        return 'Review your offer and next steps'

      case 'applied':
        return 'Check application progress'

      case 'rejected':
        return 'Review notes and move forward'

      default:
        return 'Review application'
    }
  }

  return (
    <div className="overview-page">

      <header className="overview-header">
        <div>
          <p className="overview-eyebrow">
            Overview
          </p>

          <h1>
            Good to see you,{' '}
            {session?.user.firstName}.
          </h1>

          <p className="overview-subtitle">
            Here’s what’s happening with your job search.
          </p>
        </div>

        <button
          className="overview-primary-button"
          onClick={() => navigate('/applications')}
        >
          + Add application
        </button>
      </header>

      <section className="overview-summary">
        <div className="summary-item">
          <span>Applications</span>
          <strong>{totalApplications}</strong>
        </div>

        <div className="summary-item">
          <span>Interviewing</span>
          <strong>{interviewingApplications}</strong>
        </div>

        <div className="summary-item">
          <span>Offers</span>
          <strong>{offers}</strong>
        </div>
      </section>

      <section className="overview-section">
        <div className="overview-section-heading">
          <div>
            <p className="overview-eyebrow">
              Focus
            </p>

            <h2>Your next steps</h2>
          </div>

          <span className="section-count">
            {activeApplications.length} active
          </span>
        </div>

        <div className="next-step-list">
          {activeApplications.length === 0 ? (
            <div className="overview-empty">
              <h3>No active applications yet.</h3>

              <p>
                Add an application to start building
                your job search workspace.
              </p>
            </div>
          ) : (
            activeApplications
              .slice(0, 4)
              .map((application) => (
                <article
                  className="next-step-item"
                  key={application._id}
                >
                  <div className="next-step-company">
                    {application.company
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="next-step-content">
                    <div className="next-step-title-row">
                      <div>
                        <h3>{application.company}</h3>

                        <p>
                          {application.jobTitle}
                        </p>
                      </div>

                      <span
                        className={`next-step-status status-${application.status}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <div className="next-step-action">
                      <span>
                        {getNextStep(application)}
                      </span>

                      <span>→</span>
                    </div>
                  </div>
                </article>
              ))
          )}
        </div>
      </section>

      <section className="overview-grid">

        <div className="overview-panel">
          <div className="overview-section-heading">
            <div>
              <p className="overview-eyebrow">
                Pipeline
              </p>

              <h2>Application progress</h2>
            </div>
          </div>

          <div className="pipeline-row">
            <div>
              <strong>{totalApplications}</strong>
              <span>Applied</span>
            </div>

            <span className="pipeline-arrow">→</span>

            <div>
              <strong>
                {interviewingApplications}
              </strong>
              <span>Interviewing</span>
            </div>

            <span className="pipeline-arrow">→</span>

            <div>
              <strong>{offers}</strong>
              <span>Offers</span>
            </div>
          </div>
        </div>

        <div className="overview-panel">
          <div className="overview-section-heading">
            <div>
              <p className="overview-eyebrow">
                Coming soon
              </p>

              <h2>Upcoming interviews</h2>
            </div>
          </div>

          <div className="overview-placeholder">
            <span>Calendar</span>

            <p>
              Scheduled interviews will appear here
              once calendar support is connected.
            </p>
          </div>
        </div>

      </section>

    </div>
  )
}

export default DashboardPage