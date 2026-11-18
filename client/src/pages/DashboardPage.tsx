import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../utils/session'
import { apiFetch } from '../utils/api'
import '../styles/dashboard.css'

interface Application {
  id: string
  company: string
  role: string
  status: string
}

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
  const navigate = useNavigate()
  const session = getSession()

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('applied')
  const [filter, setFilter] = useState('all')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCompany, setEditCompany] = useState('')
  const [editRole, setEditRole] = useState('')

  const [applications, setApplications] = useState<Application[]>([])

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

      const loadedApplications: Application[] =
        result.data.map((application) => ({
          id: application._id,
          company: application.company,
          role: application.jobTitle,
          status: application.status,
        }))

      setApplications(loadedApplications)
    }

    loadApplications()
  }, [])

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  const handleAddApplication = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!session) {
      return
    }

    const result = await apiFetch<ApiApplication>(
      `/api/users/${session.user._id}/applications`,
      {
        method: 'POST',
        body: {
          company,
          jobTitle: role,
          status,
        },
      }
    )

    if (!result.ok) {
      console.error(
        'Failed to create application:',
        result.error
      )
      return
    }

    const savedApplication: Application = {
      id: result.data._id,
      company: result.data.company,
      role: result.data.jobTitle,
      status: result.data.status,
    }

    setApplications((currentApplications) => [
      savedApplication,
      ...currentApplications,
    ])

    setCompany('')
    setRole('')
    setStatus('applied')
  }

  const handleStatusChange = async (
  applicationId: string,
  newStatus: string
  ) => {
    const result = await apiFetch<ApiApplication>(
      `/api/applications/${applicationId}`,
      {
        method: 'PATCH',
        body: {
          status: newStatus,
        },
      }
    )

    if (!result.ok) {
      console.error(
        'Failed to update application status:',
        result.error
      )
      return
    }

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status: result.data.status,
            }
          : application
      )
    )
  }

  const handleStartEdit = (application: Application) => {
    setEditingId(application.id)
    setEditCompany(application.company)
    setEditRole(application.role)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditCompany('')
    setEditRole('')
  }

  const handleSaveEdit = async (applicationId: string) => {
    if (!editCompany.trim() || !editRole.trim()) {
      return
    }

    const result = await apiFetch<ApiApplication>(
      `/api/applications/${applicationId}`,
      {
        method: 'PATCH',
        body: {
          company: editCompany,
          jobTitle: editRole,
        },
      }
    )
  

    if(!result.ok) {
      console.error('Failed to edit application', result.error)
      return
    }

    setApplications((currentApplications) => 
      currentApplications.map((application) => 
        application.id === applicationId 
          ? {
            ...application,
            company: result.data.company,
            role: result.data.jobTitle,
            }
          : application
        )
      )

    handleCancelEdit()
  }

  const handleDeleteApplication = async (applicationId: string) => {
    const result = await apiFetch(
      `/api/applications/${applicationId}`,
      {
        method: 'DELETE',
      }
    )

    if (!result.ok) {
      console.error(
        'Failed to delete application:',
        result.error
      )
      return
    }

    setApplications((currentApplications) =>
      currentApplications.filter(
        (application) => application.id !== applicationId
      )
    )
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
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map(
                    (application) => (
                      <tr key={application.id}>
                        <td className="company-cell">
                          {editingId === application.id ? (
                            <input
                            type="text"
                            value={editCompany}
                            onChange={(event) =>
                              setEditCompany(event.target.value)
                            }
                          />
                        ) : (
                          application.company
                        )}
                        </td>

                        <td>
                          {editingId === application.id ? (
                            <input
                              type="text"
                              value={editRole}
                              onChange={(event) =>
                                setEditRole(event.target.value)
                              }
                            />
                          ) : (
                            application.role
                          )}
                        </td>

                        <td>
                          <select
                            className={`status-badge status-${application.status}`}
                            value={application.status}
                            onChange={(event) =>
                              handleStatusChange(
                                application.id,
                                event.target.value
                              )
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
                        </td>
                        <td>
                          {editingId === application.id ? (
                            <>
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveEdit(application.id)
                              }
                            >
                                Save
                              </button>

                              <button
                              type="button"
                              onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(application)
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteApplication(application.id)
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
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