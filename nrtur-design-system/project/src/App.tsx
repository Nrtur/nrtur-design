import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustedBy from './components/TrustedBy'
import Comparison from './components/Comparison'
import Features from './components/Features'
import Showcase from './components/Showcase'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import Team from './components/Team'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-[#07070f] text-white overflow-x-hidden">
      <div className="noise-overlay" />
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Comparison />
        <Features />
        <Showcase />
        <Pricing />
        <Testimonials />
        <Team />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
