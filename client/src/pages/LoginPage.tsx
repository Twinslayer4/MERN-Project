import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { saveSession, type Session } from '../utils/session'
import '../styles/auth.css'

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
    <main className="auth-page">
      <div className="auth-card">

        <header className="auth-header">
          <Link to="/" className="auth-brand">
            <span className="auth-logo">n↗</span>
            <span className="auth-brand-name">nextstep</span>
          </Link>

          <p className="auth-tagline">
            A little clarity for your career
          </p>
        </header>

        <section className="auth-content">
          <div className="auth-form-container">

            <p className="auth-eyebrow">
              Welcome back
            </p>

            <h1 className="auth-title">
              Pick up where you left off.
            </h1>

            <p className="auth-description">
              Sign in to see your applications and keep moving forward.
            </p>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-field">
                <label htmlFor="login">
                  Username
                </label>

                <input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(event) =>
                    setLogin(event.target.value)
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  'Logging in...'
                ) : (
                  <>
                    Sign in to your workspace
                    <span>↗</span>
                  </>
                )}
              </button>

              <p className="auth-register-link">
                Don't have an account?{' '}
                <Link to="/register">
                  Create one
                </Link>
              </p>
            </form>

          </div>
        </section>

      </div>
    </main>
  )
}

export default LoginPage