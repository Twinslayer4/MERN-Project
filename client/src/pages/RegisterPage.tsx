import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import type { Session } from '../utils/session'
import '../styles/auth.css'

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
              Get started
            </p>

            <h1 className="auth-title">
              Build your next step.
            </h1>

            <p className="auth-description">
              Create your account and keep your job search organized in one place.
            </p>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-name-row">

                <div className="auth-field">
                  <label htmlFor="firstName">
                    First name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="lastName">
                    Last name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                  />
                </div>

              </div>

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
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
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
                  placeholder="Create a password"
                  autoComplete="new-password"
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
                  'Creating account...'
                ) : (
                  <>
                    Create your account
                    <span>↗</span>
                  </>
                )}
              </button>

              <p className="auth-register-link">
                Already have an account?{' '}
                <Link to="/login">
                  Sign in
                </Link>
              </p>

            </form>

          </div>
        </section>

      </div>
    </main>
  )
}

export default RegisterPage