import { Routes, Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import LoginErrorPage from './pages/LoginErrorPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ApplicationDetailsPage from './pages/ApplicationDetailsPage'
import ResumesPage from './pages/ResumesPage'
import CalendarPage from './pages/CalendarPage'
import AlertsPage from './pages/AlertsPage'

import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/login-error"
        element={<LoginErrorPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/applications"
          element={<ApplicationsPage />}
        />

        <Route
          path="/applications/:id"
          element={<ApplicationDetailsPage />}
        />

        <Route
          path="/resumes"
          element={<ResumesPage />}
        />

        <Route
          path="/calendar"
          element={<CalendarPage />}
        />

        <Route
          path="/alerts"
          element={<AlertsPage />}
        />
      </Route>
    </Routes>
  )
}

export default App