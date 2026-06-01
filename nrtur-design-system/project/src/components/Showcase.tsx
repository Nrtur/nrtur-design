import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { Users, GitBranch, Mail, Zap, BarChart3 } from 'lucide-react'

const tabs = [
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'email', label: 'Email Sync', icon: Mail },
  { id: 'automations', label: 'Automations', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

const contacts = [
  { name: 'Sarah Chen', company: 'Meridian Agency', email: 'sarah@meridian.co', status: 'Active', value: '$24k', avatar: 'SC', color: 'bg-blue-500' },
  { name: 'James Whitfield', company: 'Summit Digital', email: 'james@summit.io', status: 'Follow-up', value: '$18k', avatar: 'JW', color: 'bg-violet-500' },
  { name: 'Priya Kapoor', company: 'Kapoor & Assoc', email: 'priya@kapoor.com', status: 'Active', value: '$31k', avatar: 'PK', color: 'bg-emerald-500' },
  { name: 'Marcus Rodriguez', company: 'Pivot Studio', email: 'marcus@pivot.studio', status: 'New', value: '$8k', avatar: 'MR', color: 'bg-amber-500' },
  { name: 'Lisa Nakamura', company: 'Nova Growth', email: 'lisa@novagrowth.co', status: 'Active', value: '$42k', avatar: 'LN', color: 'bg-pink-500' },
]

const workflows = [
  { trigger: 'New lead created', steps: ['Assign to rep', 'Send welcome email', 'Create follow-up task in 2 days'], active: true, runs: 284 },
  { trigger: 'Deal moved to Proposal', steps: ['Send proposal template', 'Notify team channel', 'Set reminder in 5 days'], active: true, runs: 91 },
  { trigger: 'Deal inactive 7 days', steps: ['Send re-engagement email', 'Flag deal for manager review'], active: false, runs: 47 },
]

const emailThreads = [
  { from: 'Sarah Chen', subject: 'Re: Proposal for Q3 engagement', preview: "Love what you've shared — can we jump on a call to finalize the scope?", time: '11:42 AM', unread: true, avatar: 'SC', color: 'bg-blue-500' },
  { from: 'James Whitfield', subject: 'Summit Digital contract renewal', preview: "We're ready to proceed. Need the updated agreement before end of week.", time: 'Yesterday', unread: false, avatar: 'JW', color: 'bg-violet-500' },
  { from: 'Priya Kapoor', subject: 'Onboarding check-in', preview: "Team is settled in, starting the data migration tomorrow.", time: 'Mon', unread: false, avatar: 'PK', color: 'bg-emerald-500' },
]

const statusColor: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400',
  'Follow-up': 'bg-amber-500/10 text-amber-400',
  New: 'bg-blue-500/10 text-blue-400',
}

function ContactsView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div>
          <p className="text-sm font-semibold text-white">All Contacts</p>
          <p className="text-[11px] text-white/30">284 contacts · Last updated now</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs px-3 py-1.5 rounded-lg">Filter</div>
          <div className="bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs px-3 py-1.5 rounded-lg">Import</div>
          <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs px-3 py-1.5 rounded-lg">+ New</div>
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] text-[10px] text-white/25 uppercase tracking-wider px-5 py-2.5 border-b border-white/[0.04] gap-4">
        <span />
        <span>Name / Company</span>
        <span>Email</span>
        <span>Status</span>
        <span className="text-right">Pipeline</span>
      </div>
      {contacts.map((c) => (
        <div key={c.name} className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] gap-4 cursor-pointer transition-colors">
          <div className={`w-7 h-7 rounded-full ${c.color} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>{c.avatar}</div>
          <div>
            <p className="text-[13px] font-medium text-white/80 leading-none mb-0.5">{c.name}</p>
            <p className="text-[11px] text-white/30">{c.company}</p>
          </div>
          <p className="text-[12px] text-white/35 truncate">{c.email}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>{c.status}</span>
          <p className="text-[12px] font-semibold text-white/50 text-right">{c.value}</p>
        </div>
      ))}
    </div>
  )
}

function EmailView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div>
          <p className="text-sm font-semibold text-white">Email Sync</p>
          <p className="text-[11px] text-white/30">Gmail connected · 2 accounts synced</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Live sync</span>
        </div>
      </div>
      {emailThreads.map((e) => (
        <div key={e.subject} className={`flex gap-3 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors ${e.unread ? 'bg-white/[0.015]' : ''}`}>
          <div className={`w-8 h-8 rounded-full ${e.color} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>{e.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className={`text-[13px] font-semibold truncate ${e.unread ? 'text-white' : 'text-white/60'}`}>{e.from}</p>
              <span className="text-[10px] text-white/25 flex-shrink-0">{e.time}</span>
            </div>
            <p className={`text-[12px] truncate mb-0.5 ${e.unread ? 'text-white/70' : 'text-white/40'}`}>{e.subject}</p>
            <p className="text-[11px] text-white/25 truncate">{e.preview}</p>
          </div>
          {e.unread && <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />}
        </div>
      ))}
      <div className="px-5 py-4 flex items-center justify-center">
        <p className="text-[11px] text-white/20">All emails are automatically linked to contacts</p>
      </div>
    </div>
  )
}

function AutomationsView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div>
          <p className="text-sm font-semibold text-white">Automations</p>
          <p className="text-[11px] text-white/30">3 active workflows · 422 runs this month</p>
        </div>
        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs px-3 py-1.5 rounded-lg">+ New Workflow</div>
      </div>
      <div className="flex flex-col gap-3 p-5">
        {workflows.map((w) => (
          <div key={w.trigger} className="glass-card p-4 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${w.active ? 'bg-emerald-400' : 'bg-white/20'} ${w.active ? 'animate-pulse' : ''}`} />
                <p className="text-[13px] font-semibold text-white">When: {w.trigger}</p>
              </div>
              <span className="text-[10px] text-white/30">{w.runs} runs</span>
            </div>
            <div className="flex items-start gap-2 ml-4">
              <div className="flex flex-col items-center mt-0.5">
                {w.steps.map((_, i) => (
                  <div key={i}>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500/50" />
                    {i < w.steps.length - 1 && <div className="w-px h-3 bg-white/10 ml-[2.5px]" />}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                {w.steps.map((step) => (
                  <p key={step} className="text-[11px] text-white/40">{step}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsView() {
  const bars = [
    { label: 'Jan', value: 65, deals: 14 },
    { label: 'Feb', value: 48, deals: 11 },
    { label: 'Mar', value: 78, deals: 18 },
    { label: 'Apr', value: 92, deals: 21 },
    { label: 'May', value: 86, deals: 19 },
    { label: 'Jun', value: 100, deals: 24 },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div>
          <p className="text-sm font-semibold text-white">Revenue Analytics</p>
          <p className="text-[11px] text-white/30">Q2 2025 · Updated live</p>
        </div>
        <div className="flex gap-2">
          {['1M', '3M', '6M', '1Y'].map((t, i) => (
            <button key={t} className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${i === 2 ? 'bg-brand-500/20 text-brand-400' : 'text-white/25 hover:text-white/50'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Revenue', value: '$134k', change: '+31%', up: true },
            { label: 'Deals Won', value: '107', change: '+18%', up: true },
            { label: 'Win Rate', value: '68%', change: '-2%', up: false },
          ].map((m) => (
            <div key={m.label} className="glass-card p-3">
              <p className="text-[10px] text-white/30 mb-1">{m.label}</p>
              <p className="text-lg font-black text-white leading-none mb-1">{m.value}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${m.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{m.change}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 flex-1">
          <p className="text-[11px] text-white/30 mb-4">Revenue by month</p>
          <div className="flex items-end gap-3 h-24">
            {bars.map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] text-white/25">{b.deals}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                  style={{ height: `${b.value}%` }}
                />
                <span className="text-[9px] text-white/25">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Showcase() {
  const [active, setActive] = useState('contacts')
  const ref = useScrollReveal()

  return (
    <section className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-[#07070f]" />
      <div className="orb w-96 h-96 bg-brand-600/8 bottom-0 left-1/2 -translate-x-1/2 absolute pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="reveal section-label mb-4"><span>Product</span></div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black tracking-tight gradient-text mb-5">
            See it in action
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-lg text-white/40 leading-relaxed">
            Every view is built with the same philosophy: clarity first.
            No training required, no onboarding headache.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="reveal reveal-delay-3 flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === id
                  ? 'bg-brand-500/15 border border-brand-500/30 text-brand-300 shadow-brand'
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Product window */}
        <div className="reveal reveal-delay-4">
          <div className="relative">
            <div className="absolute -inset-4 bg-brand-500/5 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_32px_100px_rgba(0,0,0,0.6)]">
              {/* Window chrome */}
              <div className="bg-[#0b0b18] px-4 py-3 flex items-center gap-3 border-b border-white/[0.05]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/[0.05] border border-white/[0.06] rounded-md px-3 py-1 text-[11px] text-white/25 w-44 text-center">
                    app.nrtur.com
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-[#09091a]" style={{ minHeight: 380 }}>
                {active === 'contacts' && <ContactsView />}
                {active === 'pipeline' && (
                  <div className="flex items-center justify-center h-64 text-white/20">
                    <p className="text-sm">Full pipeline view — drag & drop deals across stages</p>
                  </div>
                )}
                {active === 'email' && <EmailView />}
                {active === 'automations' && <AutomationsView />}
                {active === 'analytics' && <AnalyticsView />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
