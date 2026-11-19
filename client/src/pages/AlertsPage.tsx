import { useState } from 'react'
import '../styles/alerts.css'

interface AlertItem {
  id: number
  type: 'interview' | 'job' | 'follow-up'
  title: string
  description: string
  time: string
  unread: boolean
}

interface SavedJobAlert {
  id: number
  role: string
  location: string
  frequency: string
}

function AlertsPage() {
  const [role, setRole] = useState('Software Engineering Intern')
  const [location, setLocation] = useState('Remote / Orlando')
  const [frequency, setFrequency] = useState('instant')
  const [savedJobAlerts, setSavedJobAlerts] = useState<SavedJobAlert[]>([])

  const alerts: AlertItem[] = [
    {
      id: 1,
      type: 'interview',
      title: 'Microsoft interview tomorrow',
      description: 'Technical interview · 2:00 PM',
      time: 'Today',
      unread: true,
    },
    {
      id: 2,
      type: 'job',
      title: 'New internship match',
      description: 'NVIDIA · Software Engineering Intern',
      time: 'Today',
      unread: true,
    },
    {
      id: 3,
      type: 'follow-up',
      title: 'UCF application may need a follow-up',
      description: 'No activity for 10 days',
      time: 'Yesterday',
      unread: false,
    },
  ]

  const todayAlerts = alerts.filter(
    (alert) => alert.time === 'Today'
  )

  const earlierAlerts = alerts.filter(
    (alert) => alert.time !== 'Today'
  )

  const handleSaveJobAlert = () => {
    if (!role.trim() || !location.trim()) {
      return
    }

    const newAlert: SavedJobAlert = {
      id: Date.now(),
      role: role.trim(),
      location: location.trim(),
      frequency,
    }

    setSavedJobAlerts((current) => [
      ...current,
      newAlert,
    ])
  }

  return (
    <div className="alerts-page">

      <header className="alerts-header">
        <div>
          <p className="alerts-eyebrow">
            Stay updated
          </p>

          <h1>Alerts</h1>

          <p className="alerts-subtitle">
            Keep up with interviews, application activity,
            and new opportunities.
          </p>
        </div>
      </header>

      <div className="alerts-layout">

        <section className="alerts-feed">

          <div className="alerts-section-heading">
            <div>
              <p className="alerts-eyebrow">
                Today
              </p>

              <h2>Needs your attention</h2>
            </div>

            <span className="alerts-count">
              {todayAlerts.length} new
            </span>
          </div>

          <div className="alerts-list">
            {todayAlerts.map((alert) => (
              <article
                className={`alert-item ${
                  alert.unread ? 'unread' : ''
                }`}
                key={alert.id}
              >
                <div
                  className={`alert-icon alert-${alert.type}`}
                >
                  {alert.type === 'interview'
                    ? '◷'
                    : alert.type === 'job'
                    ? '↗'
                    : '•'}
                </div>

                <div className="alert-content">
                  <div className="alert-title-row">
                    <h3>{alert.title}</h3>

                    {alert.unread && (
                      <span className="alert-unread-dot" />
                    )}
                  </div>

                  <p>{alert.description}</p>
                </div>

                <button
                  type="button"
                  className="alert-action"
                >
                  View
                </button>
              </article>
            ))}
          </div>

          <div className="alerts-section-heading alerts-earlier-heading">
            <div>
              <p className="alerts-eyebrow">
                Earlier
              </p>

              <h2>Recent activity</h2>
            </div>
          </div>

          <div className="alerts-list">
            {earlierAlerts.map((alert) => (
              <article
                className="alert-item"
                key={alert.id}
              >
                <div
                  className={`alert-icon alert-${alert.type}`}
                >
                  •
                </div>

                <div className="alert-content">
                  <h3>{alert.title}</h3>
                  <p>{alert.description}</p>
                </div>

                <button
                  type="button"
                  className="alert-action"
                >
                  View
                </button>
              </article>
            ))}
          </div>

        </section>

        <aside className="job-alert-panel">

          <div className="job-alert-heading">
            <p className="alerts-eyebrow">
              Opportunity alerts
            </p>

            <h2>Create job alert</h2>

            <p>
              Get notified when new internships match
              what you are looking for.
            </p>
          </div>

          <div className="job-alert-form">

            <div className="job-alert-field">
              <label htmlFor="alert-role">
                Role
              </label>

              <input
                id="alert-role"
                type="text"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              />
            </div>

            <div className="job-alert-field">
              <label htmlFor="alert-location">
                Location
              </label>

              <input
                id="alert-location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
              />
            </div>

            <div className="job-alert-field">
              <label htmlFor="alert-frequency">
                Frequency
              </label>

              <select
                id="alert-frequency"
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value)
                }
              >
                <option value="instant">
                  Instant
                </option>

                <option value="daily">
                  Daily digest
                </option>

                <option value="weekly">
                  Weekly digest
                </option>
              </select>
            </div>

            <button
              type="button"
              className="job-alert-save-button"
              onClick={handleSaveJobAlert}
            >
              Save alert
            </button>
          </div>
          {savedJobAlerts.length > 0 && (
            <div className="saved-job-alerts">

              <p className="alerts-eyebrow">
                Active alerts
              </p>

              {savedJobAlerts.map((alert) => (
                <div
                  className="saved-job-alert"
                  key={alert.id}
                >
                  <strong>{alert.role}</strong>

                  <span>{alert.location}</span>

                  <span>
                    {alert.frequency === 'instant'
                      ? 'Instant notifications'
                      : alert.frequency === 'daily'
                      ? 'Daily digest'
                      : 'Weekly digest'}
                  </span>
                </div>
              ))}

            </div>
          )}
          <div className="alerts-integration-note">
            <p className="alerts-eyebrow">
              Backend integration
            </p>

            <h3>Notification delivery</h3>

            <p>
              This UI is ready for interview reminders
              and internship-monitoring services to connect
              later.
            </p>
          </div>

        </aside>

      </div>

    </div>
  )
}

export default AlertsPage