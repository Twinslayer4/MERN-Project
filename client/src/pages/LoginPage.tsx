import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { saveSession, type Session } from '../utils/session'

function LoginPage() {
  const navigate = useNavigate()

  const [login, setLogin] = useState('')
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
        '/api/auth/login',
        {
          method: 'POST',
          body: {
            login,
            password,
          },
        }
      )

      if (!result.ok) {
        navigate('/login-error')
        return
      }

      saveSession(result.data)

      console.log('Logged in:', result.data)

      navigate('/dashboard')
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
        <h1 className="mb-4">Log in</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="login"
              className="form-label"
            >
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
            <label
              htmlFor="password"
              className="form-label"
            >
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
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center mt-3">
            Don't have an account?{' '}
            <Link to="/register">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default LoginPage