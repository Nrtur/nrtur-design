import { useScrollReveal } from '../hooks/useScrollReveal'
import { Linkedin, Twitter } from 'lucide-react'

const team = [
  {
    name: 'Alex Morgan',
    title: 'CEO & Co-founder',
    bio: 'Previously led growth at two SaaS companies (0 → $12M ARR). Obsessed with building tools that make small teams feel like large ones.',
    avatar: 'AM',
    color: 'from-brand-600 to-violet-600',
    background: 'Ex-Pipedrive, YC W20',
    tags: ['Product', 'Growth', 'Strategy'],
  },
  {
    name: 'Jordan Kim',
    title: 'CTO & Co-founder',
    bio: '10 years building scalable SaaS infrastructure. Cares deeply about reliability, speed, and developer experience. Ships fast, breaks nothing.',
    avatar: 'JK',
    color: 'from-violet-600 to-blue-600',
    background: 'Ex-Stripe, Stanford CS',
    tags: ['Engineering', 'Infrastructure', 'Security'],
  },
  {
    name: 'Riley Chen',
    title: 'Head of Product',
    bio: 'Former UX lead at a Fortune 500 and two B2B startups. Believes great design is invisible — it just feels right the first time you use it.',
    avatar: 'RC',
    color: 'from-emerald-600 to-teal-600',
    background: 'Ex-Notion, RISD Design',
    tags: ['Design', 'UX Research', 'Product'],
  },
]

const credibility = [
  { label: 'Years of combined experience', value: '28+' },
  { label: 'SaaS companies built before nrtur', value: '4' },
  { label: 'Total ARR scaled', value: '$40M+' },
  { label: 'Countries where nrtur runs', value: '32' },
]

export default function Team() {
  const ref = useScrollReveal()

  return (
    <section className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-[#09091a]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal section-label mb-4"><span>Team</span></div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black tracking-tight gradient-text mb-5">
            Built by people who've<br />lived the problem
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-lg text-white/40 leading-relaxed">
            We've all managed customers with spreadsheets. We built nrtur because
            we were frustrated by the same alternatives you are.
          </p>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {team.map((member, i) => (
            <div
              key={member.name}
              className={`reveal reveal-delay-${i + 1} group glass-card p-7 flex flex-col hover:border-white/10 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300`}
            >
              {/* Avatar */}
              <div className="relative mb-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-xl font-black text-white shadow-brand group-hover:scale-105 transition-transform duration-300`}>
                  {member.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#0a0a14] border border-white/[0.08] rounded-md px-1.5 py-0.5">
                  <p className="text-[9px] text-white/40">{member.background}</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-0.5">{member.name}</h3>
                <p className="text-sm text-brand-400 font-medium mb-4">{member.title}</p>
                <p className="text-sm text-white/45 leading-relaxed mb-5">{member.bio}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {member.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-white/35 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="flex items-center gap-2 mt-5 pt-5 border-t border-white/[0.05]">
                <button className="flex items-center gap-1.5 text-white/25 hover:text-white/60 transition-colors text-xs">
                  <Linkedin size={13} /> LinkedIn
                </button>
                <button className="flex items-center gap-1.5 text-white/25 hover:text-white/60 transition-colors text-xs ml-2">
                  <Twitter size={13} /> Twitter
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Credibility stats */}
        <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-5">
          {credibility.map((c) => (
            <div key={c.label} className="glass-card p-5 text-center">
              <p className="text-3xl font-black gradient-text-brand mb-1">{c.value}</p>
              <p className="text-xs text-white/35 leading-tight">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Investor note */}
        <div className="reveal mt-10 glass-card p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">n</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white/70 mb-0.5">Backed by operators, not just VCs</p>
            <p className="text-sm text-white/35">
              Our early investors include founders from Pipedrive, Close.com, and Apollo — people who know CRM inside and out.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
