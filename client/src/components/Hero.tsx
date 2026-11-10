import DashboardPreview from './DashboardPreview'

function Hero() {
  return (
    <section className="hero botanical-hero wrap">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="tiny-spark">✳</span>
          {' '}A LITTLE CLARITY FOR YOUR CAREER
        </p>

        <h1>
          Your next chapter.
          <br />
          <em>A little more</em>
          <br />
          <em>organized.</em>
        </h1>

        <p className="hero-description">
          Big plans, meet a simple system. Keep every application,
          interview, and possibility in one calm place.
        </p>

        <div className="hero-ctas">
          <button className="button primary">
            Find your next step ↗
          </button>

          <a href="#preview" className="text-link">
            Take a look <span>↓</span>
          </a>
        </div>

        <p className="quiet-note">
          ✓ Jobs & internships. All in one place.
        </p>
      </div>

    <div className="botanical-visual">
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>

        <div className="visual-note">
            Room for what comes next <span>⤵</span>
        </div>

        <DashboardPreview />

        <div className="floating-note">
            <span className="note-icon">✓</span>

            <div>
            <b>One step closer.</b>
            <span>Your story is still unfolding.</span>
            </div>

            <span>✧</span>
        </div>

        <div className="plant-mark" aria-hidden="true">
            ✳
        </div>
    </div>
    </section>
  )
}

export default Hero