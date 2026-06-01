import { useScrollReveal } from '../hooks/useScrollReveal'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const guarantees = [
  '14-day free trial',
  'No credit card required',
  'Cancel anytime',
  'Free data migration help',
]

export default function FinalCTA() {
  const ref = useScrollReveal()

  return (
    <section className="py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[#09091a]" />

      {/* Glow orbs */}
      <div className="orb w-[700px] h-[700px] bg-brand-600/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute pointer-events-none" />
      <div className="orb w-96 h-96 bg-violet-600/10 top-1/2 left-1/4 -translate-y-1/2 absolute pointer-events-none" />
      <div className="orb w-96 h-96 bg-indigo-600/10 top-1/2 right-1/4 -translate-y-1/2 absolute pointer-events-none" />

      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent,#09091a_80%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="reveal inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-glow-pulse" />
          <span className="text-brand-300 text-sm font-medium">Early access · Limited spots remaining</span>
        </div>

        {/* Headline */}
        <h2 className="reveal reveal-delay-1 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight gradient-text mb-6">
          Your team deserves<br />a better CRM.
        </h2>

        <p className="reveal reveal-delay-2 max-w-2xl mx-auto text-xl text-white/45 leading-relaxed mb-10">
          Stop paying for features you'll never use. Stop fighting your CRM instead of closing deals.
          Start your free trial today and feel the difference in the first hour.
        </p>

        {/* Email capture */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-xl px-5 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.07] transition-all"
          />
          <a
            href="#"
            className="btn-primary text-sm px-7 py-3.5 whitespace-nowrap justify-center"
          >
            Start for free
            <ArrowRight size={15} />
          </a>
        </div>

        {/* Guarantees */}
        <div className="reveal reveal-delay-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16">
          {guarantees.map((g) => (
            <div key={g} className="flex items-center gap-1.5 text-sm text-white/30">
              <CheckCircle2 size={13} className="text-emerald-400" />
              {g}
            </div>
          ))}
        </div>

        {/* Divider with logos/social proof */}
        <div className="reveal border-t border-white/[0.05] pt-12">
          <p className="text-sm text-white/25 mb-6">Join 2,400+ teams already using nrtur</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/15 font-semibold text-sm">
            {['Meridian Agency', 'Bloom Creative', 'Vertex Labs', 'Summit Digital', 'Forge & Co'].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
