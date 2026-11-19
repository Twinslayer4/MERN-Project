import { useState } from 'react'
import '../styles/calendar.css'

interface CalendarEvent {
  id: number
  company: string
  role: string
  type: string
  date: string
  time: string
}

function CalendarPage() {
  const [currentMonth] = useState('November 2026')
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  const [newInterview, setNewInterview] = useState({
    company: '',
    role: '',
    type: 'Technical interview',
    date: '',
    time: '',
  })

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      company: 'Microsoft',
      role: 'Software Engineering Intern',
      type: 'Technical interview',
      date: '2026-11-18',
      time: '2:00 PM',
    },
    {
      id: 2,
      company: 'NVIDIA',
      role: 'Software Engineer Intern',
      type: 'Recruiter screen',
      date: '2026-11-20',
      time: '11:30 AM',
    },
  ])

  const days = Array.from(
    { length: 30 },
    (_, index) => index + 1
  )

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDay = new Date(
        `${event.date}T12:00:00`
      ).getDate()

      return eventDay === day
    })
  }
  
  const handleScheduleInterview = () => {
    if (
      !newInterview.company.trim() ||
      !newInterview.role.trim() ||
      !newInterview.date ||
      !newInterview.time
    ) {
      return
    }

    const [hours, minutes] = newInterview.time
      .split(':')
      .map(Number)

    const time = new Date()
    time.setHours(hours, minutes)

    const formattedTime = time.toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    )

    const interview: CalendarEvent = {
      id: Date.now(),
      company: newInterview.company.trim(),
      role: newInterview.role.trim(),
      type: newInterview.type,
      date: newInterview.date,
      time: formattedTime,
    }

    setEvents((current) => [
      ...current,
      interview,
    ])

    setNewInterview({
      company: '',
      role: '',
      type: 'Technical interview',
      date: '',
      time: '',
    })

    setShowScheduleForm(false)
  }

  return (
    <div className="calendar-page">

      <header className="calendar-header">
        <div>
          <p className="calendar-eyebrow">
            Schedule
          </p>

          <h1>Calendar</h1>

          <p className="calendar-subtitle">
            Keep track of interviews and important dates.
          </p>
        </div>

        <button
          type="button"
          className="calendar-add-button"
          onClick={() =>
            setShowScheduleForm((current) => !current)
          }
        >
          {showScheduleForm
            ? 'Cancel'
            : '+ Schedule interview'}
        </button>
      </header>

      {showScheduleForm && (
        <section className="calendar-schedule-panel">

          <div className="calendar-schedule-heading">
            <div>
              <p className="calendar-eyebrow">
                New interview
              </p>

              <h2>Schedule interview</h2>
            </div>
          </div>

          <div className="calendar-schedule-grid">

            <div>
              <label htmlFor="calendar-company">
                Company
              </label>

              <input
                id="calendar-company"
                type="text"
                placeholder="Microsoft"
                value={newInterview.company}
                onChange={(event) =>
                  setNewInterview({
                    ...newInterview,
                    company: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="calendar-role">
                Role
              </label>

              <input
                id="calendar-role"
                type="text"
                placeholder="Software Engineering Intern"
                value={newInterview.role}
                onChange={(event) =>
                  setNewInterview({
                    ...newInterview,
                    role: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="calendar-type">
                Interview type
              </label>

              <select
                id="calendar-type"
                value={newInterview.type}
                onChange={(event) =>
                  setNewInterview({
                    ...newInterview,
                    type: event.target.value,
                  })
                }
              >
                <option>Recruiter screen</option>
                <option>Technical interview</option>
                <option>Behavioral interview</option>
                <option>On-site interview</option>
                <option>Final interview</option>
              </select>
            </div>

            <div>
              <label htmlFor="calendar-date">
                Date
              </label>

              <input
                id="calendar-date"
                type="date"
                value={newInterview.date}
                onChange={(event) =>
                  setNewInterview({
                    ...newInterview,
                    date: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="calendar-time">
                Time
              </label>

              <input
                id="calendar-time"
                type="time"
                value={newInterview.time}
                onChange={(event) =>
                  setNewInterview({
                    ...newInterview,
                    time: event.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="calendar-schedule-actions">
            <button
              type="button"
              onClick={handleScheduleInterview}
            >
              Add to calendar
            </button>
          </div>

        </section>
      )}

      <div className="calendar-layout">

        <section className="calendar-main">

          <div className="calendar-toolbar">
            <div>
              <button type="button">
                ←
              </button>

              <button type="button">
                →
              </button>
            </div>

            <h2>{currentMonth}</h2>

            <button type="button">
              Today
            </button>
          </div>

          <div className="calendar-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="calendar-grid">

            {days.map((day) => {
              const dayEvents = getEventsForDay(day)

              return (
                <div
                  className="calendar-day"
                  key={day}
                >
                  <span className="calendar-day-number">
                    {day}
                  </span>

                  <div className="calendar-day-events">
                    {dayEvents.map((event) => (
                      <button
                        type="button"
                        className="calendar-event"
                        key={event.id}
                      >
                        <strong>
                          {event.company}
                        </strong>

                        <span>
                          {event.time}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

          </div>

        </section>

        <aside className="calendar-sidebar">

          <div className="calendar-side-heading">
            <p className="calendar-eyebrow">
              Coming up
            </p>

            <h2>Upcoming interviews</h2>
          </div>

          <div className="upcoming-interview-list">

            {events.map((event) => (
              <article
                className="upcoming-interview-card"
                key={event.id}
              >
                <div className="upcoming-date">
                  <strong>
                    {new Date(
                      `${event.date}T12:00:00`
                    ).getDate()}
                  </strong>

                  <span>
                    Nov
                  </span>
                </div>

                <div className="upcoming-content">
                  <span className="upcoming-type">
                    {event.type}
                  </span>

                  <h3>
                    {event.company}
                  </h3>

                  <p>
                    {event.role}
                  </p>

                  <span className="upcoming-time">
                    {event.time}
                  </span>
                </div>
              </article>
            ))}

          </div>

          <div className="calendar-integration-note">
            <p className="calendar-eyebrow">
              Connected feature
            </p>

            <h3>Interview reminders</h3>

            <p>
              Saved interviews will eventually generate
              reminders and automatically appear here.
            </p>
          </div>

        </aside>

      </div>

    </div>
  )
}

export default CalendarPage