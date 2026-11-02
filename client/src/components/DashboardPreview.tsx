type Application = {
  company: string
  role: string
  status: 'Applied' | 'Interviewing' | 'Offer'
  letter: string
  className: string
  time: string
}

const sampleApplications: Application[] = [
  {
    company: 'Linear',
    role: 'Product Design Intern',
    status: 'Interviewing',
    letter: 'L',
    className: 'linear',
    time: 'Oct 28',
  },
  {
    company: 'Notion',
    role: 'Frontend Developer',
    status: 'Applied',
    letter: 'N',
    className: 'notion',
    time: 'Oct 27',
  },
  {
    company: 'Figma',
    role: 'Software Engineer',
    status: 'Offer',
    letter: 'F',
    className: 'figma',
    time: 'Oct 25',
  },
]

function DashboardPreview() {
  return (
    <div className="dashboard" id="preview">
      <div className="browser-top">
        <div className="window-dots">
          <i></i>
          <i></i>
          <i></i>
        </div>

        <span>nextstep / your workspace</span>
        <span>↗</span>
      </div>

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="mini-brand">n↗</div>

          <span className="selected">▦</span>
          <span>▣</span>
          <span>◎</span>

          <div className="sidebar-avatar">JD</div>
        </aside>

        <div className="dash-main">
          <div className="dash-greeting">
            <div>
              <p>YOUR WORKSPACE</p>
              <h3>Keep moving forward.</h3>
            </div>

            <span className="avatar">JD</span>
          </div>

          <div className="stats">
            <div>
              <span>Total applications</span>
              <strong>
                12 <small>↗</small>
              </strong>
            </div>

            <div>
              <span>Interviewing</span>
              <strong>
                04 <small>↗</small>
              </strong>
            </div>

            <div>
              <span>Offers</span>
              <strong>
                01 <small>✧</small>
              </strong>
            </div>
          </div>

          <div className="table-title">
            <b>Recent applications</b>
            <button type="button">View all ↗</button>
          </div>

          <div className="table-head">
            <span>COMPANY / ROLE</span>
            <span>STATUS</span>
            <span>ADDED</span>
          </div>

          {sampleApplications.map((application) => (
            <div className="table-row" key={application.company}>
              <span
                className={`company-logo ${application.className}`}
              >
                {application.letter}
              </span>

              <div className="job-name">
                <b>{application.company}</b>
                <span>{application.role}</span>
              </div>

              <span
                className={`status ${application.status.toLowerCase()}`}
              >
                <i></i>
                {application.status}
              </span>

              <span className="row-date">
                {application.time}
              </span>

              <span className="row-more">···</span>
            </div>
          ))}

          <div className="dash-bottom">
            <span>
              <i className="online-dot"></i>
              A little progress, every day.
            </span>

            <span>3 of 12 applications</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPreview