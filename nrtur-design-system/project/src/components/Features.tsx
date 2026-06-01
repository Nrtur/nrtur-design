import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  Users, GitBranch, Mail, Zap, Shield, BarChart3,
  ArrowRight, Globe, Clock, Layers,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Contact Management',
    description:
      'A single source of truth for every contact. Enrich profiles, track interactions, and keep your team in sync — all in one clean view.',
    tag: 'Core',
    color: 'from-blue-500/20 to-brand-500/20',
    iconColor: 'text-blue-400',
    highlights: ['Smart deduplication', 'Custom fields', 'Activity timeline'],
    wide: true,
  },
  {
    icon: GitBranch,
    title: 'Sales Pipelines',
    description:
      'Drag-and-drop kanban boards that match how you actually sell. Forecast revenue, spot bottlenecks, and never let a deal go cold.',
    tag: 'Core',
    color: 'from-brand-500/20 to-violet-500/20',
    iconColor: 'text-brand-400',
    highlights: ['Multiple pipelines', 'Deal scoring', 'Win/loss tracking'],
    wide: false,
  },
  {
    icon: Mail,
    title: 'Email Sync',
    description:
      'Two-way email sync with Gmail and Outlook. Every thread lands in the right contact record automatically — no copy-pasting ever.',
    tag: 'Core',
    color: 'from-violet-500/20 to-pink-500/20',
    iconColor: 'text-violet-400',
    highlights: ['Gmail & Outlook', 'Thread tracking', 'Email templates'],
    wide: false,
  },
  {
    icon: Zap,
    title: 'Automations',
    description:
      'Set it and forget it. Build automated workflows that follow up, assign tasks, and move deals — so nothing slips through the cracks.',
    tag: 'Core',
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    highlights: ['Visual workflow builder', 'Trigger-based rules', '50+ actions'],
    wide: false,
  },
  {
    icon: Shield,
    title: 'Team Management',
    description:
      'Role-based permissions, shared pipelines, and activity logs. Everyone sees what they should — nothing more, nothing less.',
    tag: 'Core',
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    highlights: ['Role-based access', 'Team views', 'Audit logs'],
    wide: false,
  },
  {
    icon: BarChart3,
    title: 'Reporting & Analytics',
    description:
      'Real-time dashboards that tell you what\'s working and what isn\'t. Export-ready reports for clients and stakeholders.',
    tag: 'Included',
    color: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-400',
    highlights: ['Revenue forecasting', 'Conversion funnels', 'Custom reports'],
    wide: false,
  },
]

const extras = [
  { icon: Globe, label: 'Works in any timezone' },
  { icon: Clock, label: '5-minute onboarding' },
  { icon: Layers, label: 'Integrates with 100+ tools' },
]

export default function Features() {
  const ref = useScrollReveal()

  return (
    <section id="features" className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-[#09091a]" />
      <div className="orb w-[500px] h-[500px] bg-violet-700/10 top-1/2 -left-60 absolute pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal section-label mb-4">
            <span>Features</span>
          </div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black tracking-tight gradient-text mb-5">
            Everything you need.<br />Nothing you don't.
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-lg text-white/40 leading-relaxed">
            Five core modules. Every one designed to feel obvious, fast, and reliable —
            the moment you open it for the first time.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`reveal reveal-delay-${Math.min(i + 1, 5)} group glass-card p-7 hover:shadow-card-hover hover:border-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                  f.wide ? 'lg:col-span-2' : ''
                }`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className={f.iconColor} />
                </div>

                {/* Content */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  <span className="flex-shrink-0 text-[11px] font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <p className="text-sm text-white/45 leading-relaxed mb-5">{f.description}</p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {f.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[11px] text-white/40 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Hover arrow */}
                <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Learn more <ArrowRight size={14} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Extras row */}
        <div className="reveal mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {extras.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 glass-card px-5 py-4">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-brand-400" />
              </div>
              <span className="text-sm text-white/50 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
