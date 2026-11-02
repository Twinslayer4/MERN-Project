import Header from '../components/Header'
import Hero from '../components/Hero'
import StatusStrip from '../components/StatusStrip'
import HowItWorks from '../components/HowItWorks'
import ClosingCTA from '../components/ClosingCTA'
import Footer from '../components/Footer'

function LandingPage() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <StatusStrip />
        <HowItWorks />
        <ClosingCTA />
      </main>

      <Footer />
    </>
  )
}

export default LandingPage