// In-product dashboard mockup used as the hero image.
// Pipeline view · sidebar + topbar + kanban + activity rail.
const PIPELINE_STAGES = [
  { name: 'Prospecting', color: '#94a3b8', count: 8, value: '$42k', deals: [
    { company: 'Meridian Agency', value: '$8,400', owner: 'SC', tag: 'Follow up', tagBg: 'rgba(59,130,246,0.15)', tagFg: '#60a5fa' },
    { company: 'Bloom Creative', value: '$12,000', owner: 'JK', tag: 'New lead', tagBg: 'rgba(16,185,129,0.15)', tagFg: '#34d399' },
    { company: 'Vertex Labs', value: '$6,200', owner: 'RL', tag: 'Call booked', tagBg: 'rgba(139,92,246,0.15)', tagFg: '#a78bfa' },
  ]},
  { name: 'Qualified', color: '#818cf8', count: 5, value: '$81k', deals: [
    { company: 'Pivot Studio', value: '$22,500', owner: 'SC', tag: 'Proposal sent', tagBg: 'rgba(245,158,11,0.15)', tagFg: '#fbbf24' },
    { company: 'Atlas Consult', value: '$18,000', owner: 'MR', tag: 'Demo done', tagBg: 'rgba(99,102,241,0.15)', tagFg: '#818cf8' },
  ]},
  { name: 'Proposal', color: '#a78bfa', count: 4, value: '$67k', deals: [
    { company: 'Summit Digital', value: '$31,000', owner: 'JK', tag: 'Negotiating', tagBg: 'rgba(249,115,22,0.15)', tagFg: '#fb923c' },
    { company: 'Nova Growth', value: '$15,500', owner: 'RL', tag: 'Review', tagBg: 'rgba(236,72,153,0.15)', tagFg: '#f472b6' },
  ]},
  { name: 'Closed Won', color: '#34d399', count: 11, value: '$134k', deals: [
    { company: 'Forge & Co', value: '$44,000', owner: 'SC', tag: 'Won 🎉', tagBg: 'rgba(16,185,129,0.15)', tagFg: '#34d399' },
    { company: 'Kapoor & Assoc', value: '$28,000', owner: 'MR', tag: 'Won 🎉', tagBg: 'rgba(16,185,129,0.15)', tagFg: '#34d399' },
  ]},
];

const PIPELINE_METRICS = [
  { label: 'Pipeline Value', value: '$324k', change: '+12%', up: true },
  { label: 'Won This Month', value: '$134k', change: '+31%', up: true },
  { label: 'Avg Deal Size', value: '$11.5k', change: '+4%', up: true },
  { label: 'Win Rate', value: '68%', change: '-2%', up: false },
];

const PIPELINE_ACTIVITY = [
  { name: 'S. Chen', action: 'Moved deal to Proposal', time: '2m ago', color: '#3b82f6' },
  { name: 'J. Kim', action: 'Sent proposal to Forge', time: '14m ago', color: '#8b5cf6' },
  { name: 'R. Lee', action: 'Closed Kapoor & Assoc', time: '1h ago', color: '#10b981' },
  { name: 'M. Rios', action: 'Added 3 new contacts', time: '2h ago', color: '#f59e0b' },
  { name: 'S. Chen', action: 'Automated email sent', time: '3h ago', color: '#ec4899' },
];

function DashboardMockup({ height = 460, showSidebar = true, showActivity = true }) {
  const I = NrturIcons;
  const navItems = [
    { Icon: I.LayoutDash, active: false },
    { Icon: I.Users,      active: false },
    { Icon: I.GitBranch,  active: true },
    { Icon: I.Mail,       active: false },
    { Icon: I.Zap,        active: false },
  ];

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      boxShadow: 'var(--shadow-window)',
    }}>
      {/* Window chrome */}
      <div style={{
        background: '#0b0b18', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--border-4)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#ff5f57' }}/>
          <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#febc2e' }}/>
          <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#28c840' }}/>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-3)',
            borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'var(--fg-7)',
            width: 180, textAlign: 'center',
          }}>app.nrtur.com</div>
        </div>
      </div>

      <div style={{ display: 'flex', background: '#09091a', height }}>
        {showSidebar && (
          <div style={{
            width: 56, background: 'var(--surface-950)', borderRight: '1px solid var(--border-4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '20px 0', gap: 8, flexShrink: 0,
          }}>
            <div style={{ marginBottom: 12 }}>
              <NrturLogo size={32} radius={8} />
            </div>
            {navItems.map(({ Icon: IconC, active }, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'rgba(99,102,241,0.20)' : 'transparent',
                color: active ? '#818cf8' : 'var(--fg-7)',
                boxShadow: active ? '0 0 0 1px rgba(99,102,241,0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}>
                <IconC size={15} />
              </div>
            ))}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ color: 'var(--fg-7)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I.Settings size={15} />
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top bar */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <p style={{ margin: 0, color: 'var(--fg-1)', fontSize: 14, fontWeight: 600, lineHeight: 1 }}>Sales Pipeline</p>
              <p style={{ margin: '4px 0 0 0', color: 'var(--fg-6)', fontSize: 11 }}>Q2 2025 · 28 open deals · $324k total</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)',
                borderRadius: 8, padding: '6px 10px', color: 'var(--fg-7)',
              }}>
                <I.Search size={11} />
                <span style={{ fontSize: 11 }}>Search deals…</span>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)',
                color: 'var(--fg-6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><I.Bell size={12}/></div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)',
                borderRadius: 8, padding: '6px 10px', color: '#818cf8',
                fontSize: 11, fontWeight: 500, cursor: 'pointer',
              }}>+ New Deal</div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', gap: 24,
            flexShrink: 0, overflowX: 'auto',
          }}>
            {PIPELINE_METRICS.map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--fg-6)', lineHeight: 1, marginBottom: 4 }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1 }}>{m.value}</p>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                  fontSize: 10, padding: '2px 6px', borderRadius: 9999,
                  background: m.up ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                  color: m.up ? '#34d399' : '#f87171',
                }}>
                  <I.TrendUp size={8} stroke={2.5} />
                  {m.change}
                </span>
              </div>
            ))}
          </div>

          {/* Kanban */}
          <div style={{ display: 'flex', gap: 12, padding: 16, flex: 1, overflowX: 'auto' }}>
            {PIPELINE_STAGES.map(stage => (
              <div key={stage.name} style={{ minWidth: 180, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 9999, background: stage.color }}/>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-4)' }}>{stage.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--fg-7)' }}>{stage.value}</span>
                    <span style={{
                      fontSize: 10, background: 'rgba(255,255,255,0.06)',
                      width: 16, height: 16, borderRadius: 9999,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--fg-6)',
                    }}>{stage.count}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stage.deals.map(deal => <DealCard key={deal.company} deal={deal} />)}
                  <div style={{
                    border: '1px dashed var(--border-3)', borderRadius: 12,
                    padding: 8, display: 'flex', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--fg-8)', fontSize: 10,
                  }}>+ Add deal</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showActivity && (
          <div style={{
            width: 192, background: 'var(--surface-950)', borderLeft: '1px solid var(--border-4)',
            padding: 16, flexShrink: 0,
          }}>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: 10, fontWeight: 600, color: 'var(--fg-6)',
              textTransform: 'uppercase', letterSpacing: '0.14em',
            }}>Activity</p>
            {PIPELINE_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 9999, background: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 9, fontWeight: 700,
                  flexShrink: 0, marginTop: 2,
                }}>{a.name[0]}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--fg-3)', lineHeight: 1.35 }}>{a.action}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: 9, color: 'var(--fg-8)' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{
        background: 'var(--surface-950)', borderTop: '1px solid var(--border-4)',
        padding: '8px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="glow-pulse" style={{ width: 6, height: 6, borderRadius: 9999, background: '#34d399' }}/>
          <span style={{ fontSize: 10, color: 'var(--fg-7)' }}>All systems operational</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--fg-8)' }}>3 team members online</span>
          <div style={{ display: 'flex' }}>
            {['#3b82f6','#8b5cf6','#10b981'].map((c, i) => (
              <div key={i} style={{
                width: 16, height: 16, borderRadius: 9999, background: c,
                border: '2px solid var(--surface-950)',
                marginLeft: i === 0 ? 0 : -6,
              }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        border: '1px solid ' + (hover ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)'),
        borderRadius: 12, padding: 10, cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', lineHeight: 1.25 }}>{deal.company}</p>
        <span style={{ color: 'var(--fg-8)', opacity: hover ? 1 : 0, transition: 'opacity 150ms', fontSize: 12 }}>⋯</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--fg-4)', marginBottom: 8 }}>{deal.value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 9999,
          background: 'rgba(99,102,241,0.20)', border: '1px solid rgba(99,102,241,0.20)',
          color: '#818cf8', fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{deal.owner}</div>
        <span style={{
          fontSize: 9, fontWeight: 500, padding: '2px 8px',
          borderRadius: 9999, background: deal.tagBg, color: deal.tagFg,
        }}>{deal.tag}</span>
      </div>
    </div>
  );
}

window.DashboardMockup = DashboardMockup;
window.DealCard = DealCard;
window.PIPELINE_STAGES = PIPELINE_STAGES;
window.PIPELINE_METRICS = PIPELINE_METRICS;
window.PIPELINE_ACTIVITY = PIPELINE_ACTIVITY;
