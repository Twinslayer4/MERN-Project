import { Link } from 'react-router-dom'


function Header() {
  return (
    <header className="site-header wrap">
      <a href="#" className="brand" aria-label="Nextstep home">
        nextstep<span>↗</span>
      </a>

      <nav aria-label="Main navigation">
        <a href="#preview">The tracker</a>
        <a href="#how-it-works">How it works</a>
      </nav>

      <div className="nav-actions">
        <button
          className="icon-button mode-toggle"
          aria-label="Toggle light and dark mode"
        >
          ☾
        </button>

        <Link to="/login" className="login">
          Log in
        </Link>

        <Link to="/register" className="button small primary">
          Get started <span>↗</span>
        </Link>
      </div>
    </header>
  )
}

export default Header