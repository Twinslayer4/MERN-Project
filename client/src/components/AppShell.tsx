import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../utils/session'
import '../styles/appShell.css'

function AppShell() {
  const navigate = useNavigate()
  const session = getSession()

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">n↗</div>

          <div>
            <div className="sidebar-brand-name">
              nextstep
            </div>

            <div className="sidebar-brand-subtitle">
              Career workspace
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'sidebar-link active'
                : 'sidebar-link'
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/applications"
            className={({ isActive }) =>
              isActive
                ? 'sidebar-link active'
                : 'sidebar-link'
            }
          >
            Applications
          </NavLink>

          <NavLink
            to="/resumes"
            className={({ isActive }) =>
              isActive
                ? 'sidebar-link active'
                : 'sidebar-link'
            }
          >
            Resumes
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              isActive
                ? 'sidebar-link active'
                : 'sidebar-link'
            }
          >
            Calendar
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              isActive
                ? 'sidebar-link active'
                : 'sidebar-link'
            }
          >
            Alerts
            <span className="sidebar-badge">Alerts</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {session?.user.firstName?.charAt(0)}
              {session?.user.lastName?.charAt(0)}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {session?.user.firstName}{' '}
                {session?.user.lastName}
              </strong>

              <span>{session?.user.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell