import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../utils/session'
import '../styles/dashboard.css'

interface Application {
  id: number
  company: string
  role: string
  status: string
}

function DashboardPage() {
  const navigate = useNavigate()
  const session = getSession()

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('applied')
  const [filter, setFilter] = useState('all')

  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      company: 'Linear',
      role: 'Product Design Intern',
      status: 'interviewing',
    },
    {
      id: 2,
      company: 'Notion',
      role: 'Frontend Developer',
      status: 'applied',
    },
  ])

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  const handleAddApplication = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const newApplication: Application = {
      id: Date.now(),
      company,
      role,
      status,
    }

    setApplications([...applications, newApplication])

    setCompany('')
    setRole('')
    setStatus('applied')
  }

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter(
          (application) => application.status === filter
        )
  
  const totalApplications = applications.length

  const interviewingApplications = applications.filter(
    (application) => application.status === 'interviewing'
  ).length

  const offerApplications = applications.filter(
    (application) => application.status === 'offer'
  ).length

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">

        <header className="dashboard-header">
          <div className="dashboard-brand">
            <span className="dashboard-logo">n↗</span>
            <span className="dashboard-brand-name">
              nextstep
            </span>
          </div>

          <div className="dashboard-header-right">
            <span className="dashboard-user">
              {session?.user.firstName}
            </span>

            <button
              type="button"
              className="dashboard-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <div className="dashboard-content">

          <section className="dashboard-intro">
            <div>
              <p className="dashboard-eyebrow">
                Your workspace
              </p>

              <h1 className="dashboard-title">
                Welcome back, {session?.user.firstName}.
              </h1>

              <p className="dashboard-subtitle">
                Keep track of every opportunity and see where
                your job search is heading.
              </p>
            </div>
          </section>

          <section className="dashboard-stats">

            <div className="stat-card">
              <span className="stat-label">
                Total applications
              </span>

              <strong className="stat-number">
                {totalApplications}
              </strong>

              <span className="stat-note">
                Opportunities tracked
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Interviewing
              </span>

              <strong className="stat-number">
                {interviewingApplications}
              </strong>

              <span className="stat-note">
                Active conversations
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Offers
              </span>

              <strong className="stat-number">
                {offerApplications}
              </strong>

              <span className="stat-note">
                Offers received
              </span>
            </div>

          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">
                  New opportunity
                </p>

                <h2>Add an application</h2>
              </div>
            </div>

            <form
              className="application-form"
              onSubmit={handleAddApplication}
            >
              <div className="dashboard-field">
                <label htmlFor="company">
                  Company
                </label>

                <input
                  id="company"
                  type="text"
                  placeholder="e.g. Spotify"
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  required
                />
              </div>

              <div className="dashboard-field">
                <label htmlFor="role">
                  Job title
                </label>

                <input
                  id="role"
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                  required
                />
              </div>

              <div className="dashboard-field">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                >
                  <option value="applied">
                    Applied
                  </option>

                  <option value="interviewing">
                    Interviewing
                  </option>

                  <option value="offer">
                    Offer
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="application-add-button"
              >
                Add application
                <span>＋</span>
              </button>
            </form>
          </section>

          <section className="dashboard-section applications-section">

            <div className="section-heading applications-heading">
              <div>
                <p className="section-eyebrow">
                  Your search
                </p>

                <h2>Applications</h2>
              </div>

              <div className="filter-control">
                <label htmlFor="filter">
                  Filter
                </label>

                <select
                  id="filter"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                >
                  <option value="all">
                    All statuses
                  </option>

                  <option value="applied">
                    Applied
                  </option>

                  <option value="interviewing">
                    Interviewing
                  </option>

                  <option value="offer">
                    Offer
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>
            </div>

            <div className="applications-table-wrapper">
              <table className="applications-table">

                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map(
                    (application) => (
                      <tr key={application.id}>
                        <td className="company-cell">
                          {application.company}
                        </td>

                        <td>
                          {application.role}
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${application.status}`}
                          >
                            {application.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>

          </section>

        </div>
      </div>
    </main>
  )
}

export default DashboardPage