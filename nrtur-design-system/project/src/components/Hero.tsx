import { ArrowRight, Play, Star, CheckCircle2 } from 'lucide-react'
import DashboardMockup from './DashboardMockup'

const trustBadges = [
  '14-day free trial',
  'No credit card required',
  'Cancel anytime',
]

const stats = [
  { value: '2,400+', label: 'Teams using nrtur' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '$29', label: 'Per user / mo' },
  { value: '5 min', label: 'Setup time' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="orb w-[600px] h-[600px] bg-brand-600/20 -top-40 -left-40" />
        <div className="orb w-[500px] h-[500px] bg-violet-700/15 -top-20 right-0" />
        <div className="orb w-[400px] h-[400px] bg-indigo-800/10 top-1/2 left-1/3" />
        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-100" />
        {/* Radial fade to hide grid at edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.08),transparent)]" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#07070f] to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero content */}
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pt-24 pb-12 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-glow-pulse" />
            <span className="text-brand-300 text-sm font-medium">Now in early access · Spring 2025</span>
            <ArrowRight size={13} className="text-brand-400" />
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-[82px] font-black tracking-tight leading-[1.05] mb-6 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            <span className="gradient-text">The CRM small teams</span>
            <br />
            <span className="gradient-text-brand">actually want to use.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="max-w-2xl mx-auto text-lg sm:text-xl text-white/50 leading-relaxed mb-10 animate-fade-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            Everything you need to manage contacts, close deals, and automate follow-ups —
            without HubSpot's complexity or price tag. Built for teams of 1–5 who move fast.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <a href="#" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto justify-center">
              Start free trial
              <ArrowRight size={16} />
            </a>
            <a
              href="#"
              className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto justify-center"
            >
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                <Play size={9} className="text-white/60 ml-0.5" />
              </div>
              Watch demo
            </a>
          </div>

          {/* Trust indicators */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16 animate-fade-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
          >
            {trustBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-sm text-white/35">
                <CheckCircle2 size={13} className="text-emerald-400" />
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div
          className="max-w-6xl mx-auto w-full px-6 lg:px-8 animate-fade-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          <div className="relative">
            {/* Glow behind dashboard */}
            <div className="absolute -inset-8 bg-brand-500/10 rounded-3xl blur-3xl" />
            <div className="relative animate-float">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 mt-16 mb-0">
          <div className="border-t border-white/[0.06] pt-10 pb-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black gradient-text-brand mb-1">{stat.value}</p>
                <p className="text-sm text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof - rating */}
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm text-white/40">
              <span className="text-white/70 font-semibold">4.9/5</span> from 300+ early access reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
