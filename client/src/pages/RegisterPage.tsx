import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import type { Session } from '../utils/session'

function RegisterPage() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const result = await apiFetch<Session>(
        '/api/users',
        {
          method: 'POST',
          body: {
            firstName,
            lastName,
            login,
            email,
            password,
          },
        }
      )

      if (!result.ok) {
        setError(result.error ?? 'Registration failed')
        return
      }

      console.log('Registered:', result.data)

      navigate('/login')
    } catch (error) {
      console.error(error)
      setError('Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '420px' }}>
        <h1 className="mb-4">Create account</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">
              First name
            </label>

            <input
              id="firstName"
              type="text"
              className="form-control"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">
              Last name
            </label>

            <input
              id="lastName"
              type="text"
              className="form-control"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="login" className="form-label">
              Username
            </label>

            <input
              id="login"
              type="text"
              className="form-control"
              value={login}
              onChange={(event) =>
                setLogin(event.target.value)
              }
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default RegisterPage