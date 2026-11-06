import { Link } from 'react-router-dom'
import '../styles/auth.css'

function LoginErrorPage() {
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
              Sign in issue
            </p>

            <h1 className="auth-title">
              We couldn't log you in.
            </h1>

            <p className="auth-description">
              The username or password you entered is incorrect.
              Please check your information and try again.
            </p>

            <Link
              to="/login"
              className="auth-submit auth-error-button"
            >
              Back to login
              <span>↗</span>
            </Link>

          </div>
        </section>

      </div>
    </main>
  )
}

export default LoginErrorPage