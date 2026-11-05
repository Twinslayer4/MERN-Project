import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../utils/session'

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

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Dashboard</h1>
          <p className="mb-0">
            Welcome, {session?.user.firstName}!
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>

      <section className="mb-5">
        <h2 className="h4 mb-3">Add application</h2>

        <form onSubmit={handleAddApplication}>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Company"
                value={company}
                onChange={(event) =>
                  setCompany(event.target.value)
                }
                required
              />
            </div>

            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Job title"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                required
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="applied">Applied</option>
                <option value="interviewing">
                  Interviewing
                </option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Applications</h2>

          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="all">All statuses</option>
            <option value="applied">Applied</option>
            <option value="interviewing">
              Interviewing
            </option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredApplications.map((application) => (
              <tr key={application.id}>
                <td>{application.company}</td>
                <td>{application.role}</td>
                <td>{application.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}

export default DashboardPage