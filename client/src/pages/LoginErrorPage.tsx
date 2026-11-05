import { Link } from 'react-router-dom'

function LoginErrorPage() {
  return (
    <main className="container py-5">
      <div className="mx-auto text-center" style={{ maxWidth: '500px' }}>
        <h1 className="mb-3">Login failed</h1>

        <p className="mb-4">
          The username or password you entered is incorrect.
        </p>

        <Link to="/" className="btn btn-primary">
          Back to login
        </Link>
      </div>
    </main>
  )
}

export default LoginErrorPage