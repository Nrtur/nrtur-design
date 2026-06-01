import {
  LayoutDashboard, Users, GitBranch, Mail, Zap, Settings,
  Search, Bell, ChevronDown, MoreHorizontal, TrendingUp,
} from 'lucide-react'

const stages = [
  {
    name: 'Prospecting',
    color: 'bg-slate-400',
    count: 8,
    value: '$42k',
    deals: [
      { company: 'Meridian Agency', value: '$8,400', owner: 'SC', tag: 'Follow up', tagColor: 'bg-blue-500/15 text-blue-400' },
      { company: 'Bloom Creative', value: '$12,000', owner: 'JK', tag: 'New lead', tagColor: 'bg-emerald-500/15 text-emerald-400' },
      { company: 'Vertex Labs', value: '$6,200', owner: 'RL', tag: 'Call booked', tagColor: 'bg-violet-500/15 text-violet-400' },
    ],
  },
  {
    name: 'Qualified',
    color: 'bg-brand-400',
    count: 5,
    value: '$81k',
    deals: [
      { company: 'Pivot Studio', value: '$22,500', owner: 'SC', tag: 'Proposal sent', tagColor: 'bg-amber-500/15 text-amber-400' },
      { company: 'Atlas Consult', value: '$18,000', owner: 'MR', tag: 'Demo done', tagColor: 'bg-brand-500/15 text-brand-400' },
    ],
  },
  {
    name: 'Proposal',
    color: 'bg-violet-400',
    count: 4,
    value: '$67k',
    deals: [
      { company: 'Summit Digital', value: '$31,000', owner: 'JK', tag: 'Negotiating', tagColor: 'bg-orange-500/15 text-orange-400' },
      { company: 'Nova Growth', value: '$15,500', owner: 'RL', tag: 'Review', tagColor: 'bg-pink-500/15 text-pink-400' },
    ],
  },
  {
    name: 'Closed Won',
    color: 'bg-emerald-400',
    count: 11,
    value: '$134k',
    deals: [
      { company: 'Forge & Co', value: '$44,000', owner: 'SC', tag: 'Won 🎉', tagColor: 'bg-emerald-500/15 text-emerald-400' },
      { company: 'Kapoor & Assoc', value: '$28,000', owner: 'MR', tag: 'Won 🎉', tagColor: 'bg-emerald-500/15 text-emerald-400' },
    ],
  },
]

const navItems = [
  { icon: LayoutDashboard, active: false },
  { icon: Users, active: false },
  { icon: GitBranch, active: true },
  { icon: Mail, active: false },
  { icon: Zap, active: false },
]

export default function DashboardMockup() {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_32px_120px_rgba(0,0,0,0.7)]">
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

      <div className="flex bg-[#09091a]" style={{ height: 460 }}>
        {/* Sidebar */}
        <div className="w-14 bg-[#07070f] border-r border-white/[0.05] flex flex-col items-center py-5 gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mb-4 shadow-brand">
            <span className="text-white font-black text-xs">n</span>
          </div>
          {navItems.map(({ icon: Icon, active }, i) => (
            <div
              key={i}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                active
                  ? 'bg-brand-500/20 text-brand-400 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]'
                  : 'text-white/20 hover:text-white/40 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={15} />
            </div>
          ))}
          <div className="mt-auto">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20">
              <Settings size={15} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-white text-sm font-semibold leading-none mb-0.5">Sales Pipeline</p>
              <p className="text-white/30 text-[11px]">Q2 2025 · 28 open deals · $324k total</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
                <Search size={11} className="text-white/25" />
                <span className="text-[11px] text-white/25">Search deals...</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30">
                <Bell size={12} />
              </div>
              <div className="flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-brand-500/15 transition-colors">
                <span className="text-[11px] text-brand-400 font-medium">+ New Deal</span>
              </div>
            </div>
          </div>

          {/* Metrics bar */}
          <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-6 flex-shrink-0">
            {[
              { label: 'Pipeline Value', value: '$324k', change: '+12%', up: true },
              { label: 'Won This Month', value: '$134k', change: '+31%', up: true },
              { label: 'Avg Deal Size', value: '$11.5k', change: '+4%', up: true },
              { label: 'Win Rate', value: '68%', change: '-2%', up: false },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <div>
                  <p className="text-[10px] text-white/30 leading-none mb-0.5">{m.label}</p>
                  <p className="text-sm font-semibold text-white leading-none">{m.value}</p>
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${m.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <TrendingUp size={8} />
                  {m.change}
                </div>
              </div>
            ))}
          </div>

          {/* Kanban board */}
          <div className="flex gap-3 p-4 flex-1 overflow-x-auto">
            {stages.map((stage) => (
              <div key={stage.name} className="min-w-[180px] flex-shrink-0">
                {/* Stage header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${stage.color}`} />
                    <span className="text-[11px] font-semibold text-white/50">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/25">{stage.value}</span>
                    <span className="text-[10px] bg-white/[0.06] rounded-full w-4 h-4 flex items-center justify-center text-white/30">{stage.count}</span>
                  </div>
                </div>

                {/* Deal cards */}
                <div className="flex flex-col gap-2">
                  {stage.deals.map((deal) => (
                    <div
                      key={deal.company}
                      className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[12px] font-medium text-white/80 leading-tight">{deal.company}</p>
                        <MoreHorizontal size={11} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                      </div>
                      <p className="text-[11px] font-semibold text-white/50 mb-2">{deal.value}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/20 flex items-center justify-center text-[9px] font-bold text-brand-400 flex-shrink-0">
                          {deal.owner}
                        </div>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${deal.tagColor}`}>
                          {deal.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Add card ghost */}
                  <div className="border border-dashed border-white/[0.06] rounded-xl p-2 flex items-center justify-center cursor-pointer hover:border-white/[0.12] transition-colors">
                    <span className="text-[10px] text-white/15">+ Add deal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - Contact detail */}
        <div className="w-48 bg-[#07070f] border-l border-white/[0.05] p-4 flex-shrink-0 hidden lg:block">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Activity</p>
          {[
            { name: 'S. Chen', action: 'Moved deal to Proposal', time: '2m ago', color: 'bg-blue-500' },
            { name: 'J. Kim', action: 'Sent proposal to Forge', time: '14m ago', color: 'bg-violet-500' },
            { name: 'R. Lee', action: 'Closed Kapoor & Assoc', time: '1h ago', color: 'bg-emerald-500' },
            { name: 'M. Rios', action: 'Added 3 new contacts', time: '2h ago', color: 'bg-amber-500' },
            { name: 'S. Chen', action: 'Automated email sent', time: '3h ago', color: 'bg-pink-500' },
          ].map((a, i) => (
            <div key={i} className="flex gap-2 mb-3.5">
              <div className={`w-5 h-5 rounded-full ${a.color} flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white mt-0.5`}>
                {a.name[0]}
              </div>
              <div>
                <p className="text-[10px] text-white/60 leading-tight">{a.action}</p>
                <p className="text-[9px] text-white/20 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="bg-[#07070f] border-t border-white/[0.05] px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/25">All systems operational</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/20">3 team members online</span>
          <div className="flex -space-x-1">
            {['bg-blue-500', 'bg-violet-500', 'bg-emerald-500'].map((c, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${c} border border-[#07070f]`} />
            ))}
          </div>
          <ChevronDown size={10} className="text-white/20" />
        </div>
      </div>
    </div>
  )
}
