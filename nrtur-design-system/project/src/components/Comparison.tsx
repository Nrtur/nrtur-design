import { useScrollReveal } from '../hooks/useScrollReveal'
import { Check, X } from 'lucide-react'

const rows = [
  { feature: 'Starting price',        nrtur: '$29/user/mo',     hubspot: '$90/user/mo',   nrturWins: true },
  { feature: 'Free trial',            nrtur: '14 days',         hubspot: 'Limited free',  nrturWins: true },
  { feature: 'Setup time',            nrtur: '~5 minutes',      hubspot: '1–4 weeks',     nrturWins: true },
  { feature: 'Contact management',    nrtur: true,              hubspot: true,            nrturWins: false },
  { feature: 'Sales pipelines',       nrtur: true,              hubspot: true,            nrturWins: false },
  { feature: 'Email sync',            nrtur: true,              hubspot: true,            nrturWins: false },
  { feature: 'Automations',           nrtur: true,              hubspot: 'Paid add-on',   nrturWins: true },
  { feature: 'Team management',       nrtur: true,              hubspot: true,            nrturWins: false },
  { feature: 'No enterprise upsells', nrtur: true,              hubspot: false,           nrturWins: true },
  { feature: 'Onboarding support',    nrtur: 'Human, 1:1',      hubspot: 'Documentation', nrturWins: true },
  { feature: 'Contract lock-in',      nrtur: 'Month-to-month',  hubspot: 'Annual plans',  nrturWins: true },
  { feature: 'UI complexity',         nrtur: 'Simple, focused', hubspot: 'Enterprise-grade', nrturWins: true },
]

function CellValue({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${highlight ? 'bg-emerald-500/15' : 'bg-white/[0.06]'}`}>
          <Check size={13} className={highlight ? 'text-emerald-400' : 'text-white/40'} />
        </div>
      </div>
    )
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <X size={13} className="text-red-400/70" />
        </div>
      </div>
    )
  }
  return (
    <span className={`text-sm font-medium ${highlight ? 'text-emerald-400' : 'text-white/50'}`}>
      {value}
    </span>
  )
}

export default function Comparison() {
  const ref = useScrollReveal()

  return (
    <section id="comparison" className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070f] to-[#09091a]" />
      <div className="orb w-96 h-96 bg-brand-600/10 top-1/4 -right-48 absolute pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal section-label mb-4">
            <span>Why nrtur</span>
          </div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black tracking-tight gradient-text mb-5">
            The obvious upgrade<br />from HubSpot
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-lg text-white/40 leading-relaxed">
            HubSpot was built for enterprise. nrtur is built for you.
            Same core power, fraction of the price, none of the bloat.
          </p>
        </div>

        {/* Table */}
        <div className="reveal reveal-delay-3 glass-card overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_160px_160px] border-b border-white/[0.06]">
            <div className="px-6 py-5" />
            <div className="px-4 py-5 text-center border-l border-brand-500/20 bg-brand-500/[0.06]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                  <span className="text-white font-black text-[9px]">n</span>
                </div>
                <span className="font-bold text-white text-sm">nrtur</span>
              </div>
              <span className="text-[11px] text-brand-400 font-medium">from $29/mo</span>
            </div>
            <div className="px-4 py-5 text-center border-l border-white/[0.06]">
              <p className="font-semibold text-white/40 text-sm mb-1">HubSpot</p>
              <span className="text-[11px] text-white/25">from $90/mo</span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_160px_160px] border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors ${
                i === rows.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <div className="px-6 py-4 flex items-center">
                <span className="text-sm text-white/60">{row.feature}</span>
              </div>
              <div className="px-4 py-4 flex items-center justify-center border-l border-brand-500/10 bg-brand-500/[0.03]">
                <CellValue value={row.nrtur} highlight={row.nrturWins} />
              </div>
              <div className="px-4 py-4 flex items-center justify-center border-l border-white/[0.04]">
                <CellValue value={row.hubspot} />
              </div>
            </div>
          ))}

          {/* Footer CTA row */}
          <div className="grid grid-cols-[1fr_160px_160px] bg-brand-500/[0.04] border-t border-brand-500/15">
            <div className="px-6 py-5" />
            <div className="px-4 py-5 flex justify-center border-l border-brand-500/15">
              <a href="#" className="btn-primary text-sm py-2 px-5">
                Get started
              </a>
            </div>
            <div className="px-4 py-5 flex justify-center border-l border-white/[0.06]">
              <button className="text-sm text-white/25 hover:text-white/40 transition-colors">
                Stay with HubSpot
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
