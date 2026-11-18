import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../utils/session'
import { apiFetch } from '../utils/api'
import '../styles/applications.css'

interface Application {
  id: string
  company: string
  role: string
  status: string
  dateApplied: string
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

function ApplicationsPage() {
  const navigate = useNavigate()
  const session = getSession()

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('applied')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

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
          dateApplied: application.dateApplied,
        }))

      setApplications(loadedApplications)
    }

    loadApplications()
  }, [])

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
      dateApplied: result.data.dateApplied,
    }

    setApplications((currentApplications) => [
      savedApplication,
      ...currentApplications,
    ])

    setCompany('')
    setRole('')
    setStatus('applied')
    setShowAddForm(false)
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

  const filteredApplications = applications.filter(
    (application) => {
      const matchesStatus =
        filter === 'all' ||
        application.status === filter

      const searchTerm = search.toLowerCase()

      const matchesSearch =
        application.company
          .toLowerCase()
          .includes(searchTerm) ||
        application.role
          .toLowerCase()
          .includes(searchTerm)

      return matchesStatus && matchesSearch
    }
  )

  const interviewingApplications = applications.filter(
    (application) => application.status === 'interviewing'
  ).length

  const offerApplications = applications.filter(
    (application) => application.status === 'offer'
  ).length

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="applications-page">

      <header className="applications-header">
        <div>
          <p className="applications-eyebrow">
            Job search
          </p>

          <h1>Applications</h1>

          <p className="applications-subtitle">
            Track every opportunity in one place.
          </p>
        </div>

        <button
          type="button"
          className="applications-add-button"
          onClick={() =>
            setShowAddForm((current) => !current)
          }
        >
          {showAddForm ? 'Close' : '+ Add application'}
        </button>
      </header>

      {showAddForm && (
        <section className="add-application-panel">
          <div className="add-panel-heading">
            <div>
              <p className="applications-eyebrow">
                New opportunity
              </p>

              <h2>Add an application</h2>
            </div>
          </div>

          <form
            className="applications-form"
            onSubmit={handleAddApplication}
          >
            <div className="applications-field">
              <label htmlFor="company">
                Company
              </label>

              <input
                id="company"
                type="text"
                placeholder="e.g. Microsoft"
                value={company}
                onChange={(event) =>
                  setCompany(event.target.value)
                }
                required
              />
            </div>

            <div className="applications-field">
              <label htmlFor="role">
                Job title
              </label>

              <input
                id="role"
                type="text"
                placeholder="e.g. Software Engineer Intern"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                required
              />
            </div>

            <div className="applications-field">
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
              className="applications-save-button"
            >
              Save application
            </button>
          </form>
        </section>
      )}

      <section className="applications-status-tabs">
        <button
          type="button"
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
          <span>{applications.length}</span>
        </button>

        <button
          type="button"
          className={filter === 'applied' ? 'active' : ''}
          onClick={() => setFilter('applied')}
        >
          Applied
          <span>
            {
              applications.filter(
                (application) =>
                  application.status === 'applied'
              ).length
            }
          </span>
        </button>

        <button
          type="button"
          className={
            filter === 'interviewing' ? 'active' : ''
          }
          onClick={() => setFilter('interviewing')}
        >
          Interviewing
          <span>{interviewingApplications}</span>
        </button>

        <button
          type="button"
          className={filter === 'offer' ? 'active' : ''}
          onClick={() => setFilter('offer')}
        >
          Offers
          <span>{offerApplications}</span>
        </button>
      </section>

      <div className="applications-toolbar">
        <div className="applications-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search company or role..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <span className="applications-result-count">
          {filteredApplications.length}{' '}
          {filteredApplications.length === 1
            ? 'application'
            : 'applications'}
        </span>
      </div>

      <section className="applications-list">

        <div className="applications-list-header">
          <span>Company</span>
          <span>Role</span>
          <span>Status</span>
          <span>Applied</span>
          <span>Actions</span>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="applications-empty">
            <h3>No applications found.</h3>

            <p>
              Try another filter or add a new opportunity.
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div
              className="application-row"
              key={application.id}
            >
              <div className="application-company">
                <div className="company-avatar">
                  {application.company
                    .charAt(0)
                    .toUpperCase()}
                </div>

                {editingId === application.id ? (
                  <input
                    value={editCompany}
                    onChange={(event) =>
                      setEditCompany(event.target.value)
                    }
                  />
                ) : (
                  <button
                    type="button"
                    className="application-company-link"
                    onClick={() =>
                      navigate(`/applications/${application.id}`)
                    }
                  >
                    {application.company}
                  </button>
                )}
              </div>

              <div className="application-role">
                {editingId === application.id ? (
                  <input
                    value={editRole}
                    onChange={(event) =>
                      setEditRole(event.target.value)
                    }
                  />
                ) : (
                  application.role
                )}
              </div>

              <div>
                <select
                  className={`application-status status-${application.status}`}
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
              </div>

              <div className="application-date">
                {formatDate(application.dateApplied)}
              </div>

              <div className="application-actions">
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
                      className="delete-button"
                      onClick={() =>
                        handleDeleteApplication(
                          application.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}

      </section>

    </div>
  )
}

export default ApplicationsPage