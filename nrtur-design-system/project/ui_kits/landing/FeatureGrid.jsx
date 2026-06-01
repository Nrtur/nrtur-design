// Feature grid · 6 cards, one wide.
const FEATURES = [
  { iconKey: 'Users',      title: 'Contact Management', tag: 'Core', iconColor: '#60a5fa', iconBg: 'linear-gradient(135deg, rgba(59,130,246,0.20), rgba(99,102,241,0.20))',
    desc: "A single source of truth for every contact. Enrich profiles, track interactions, and keep your team in sync — all in one clean view.",
    chips: ['Smart deduplication', 'Custom fields', 'Activity timeline'], wide: true },
  { iconKey: 'GitBranch',  title: 'Sales Pipelines',    tag: 'Core', iconColor: '#818cf8', iconBg: 'linear-gradient(135deg, rgba(99,102,241,0.20), rgba(139,92,246,0.20))',
    desc: "Drag-and-drop kanban boards that match how you actually sell. Forecast revenue, spot bottlenecks, and never let a deal go cold.",
    chips: ['Multiple pipelines', 'Deal scoring', 'Win/loss tracking'] },
  { iconKey: 'Mail',       title: 'Email Sync',         tag: 'Core', iconColor: '#a78bfa', iconBg: 'linear-gradient(135deg, rgba(139,92,246,0.20), rgba(236,72,153,0.20))',
    desc: "Two-way email sync with Gmail and Outlook. Every thread lands in the right contact record automatically — no copy-pasting ever.",
    chips: ['Gmail & Outlook', 'Thread tracking', 'Email templates'] },
  { iconKey: 'Zap',        title: 'Automations',        tag: 'Core', iconColor: '#fbbf24', iconBg: 'linear-gradient(135deg, rgba(245,158,11,0.20), rgba(249,115,22,0.20))',
    desc: "Set it and forget it. Build automated workflows that follow up, assign tasks, and move deals — so nothing slips through the cracks.",
    chips: ['Workflow builder', 'Trigger-based rules', '50+ actions'] },
  { iconKey: 'Shield',     title: 'Team Management',    tag: 'Core', iconColor: '#34d399', iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.20), rgba(20,184,166,0.20))',
    desc: "Role-based permissions, shared pipelines, and activity logs. Everyone sees what they should — nothing more, nothing less.",
    chips: ['Role-based access', 'Team views', 'Audit logs'] },
  { iconKey: 'BarChart',   title: 'Reporting & Analytics', tag: 'Included', iconColor: '#f472b6', iconBg: 'linear-gradient(135deg, rgba(236,72,153,0.20), rgba(244,63,94,0.20))',
    desc: "Real-time dashboards that tell you what's working and what isn't. Export-ready reports for clients and stakeholders.",
    chips: ['Revenue forecasting', 'Conversion funnels', 'Custom reports'] },
];

const FEATURE_EXTRAS = [
  { iconKey: 'Globe',  label: 'Works in any timezone' },
  { iconKey: 'Clock',  label: '5-minute onboarding' },
  { iconKey: 'Layers', label: 'Integrates with 100+ tools' },
];

function FeatureCard({ f }) {
  const Icon = NrturIcons[f.iconKey];
  const ArrowRight = NrturIcons.ArrowRight;
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="glass-card"
      style={{
        padding: 28,
        gridColumn: f.wide ? 'span 2' : undefined,
        cursor: 'pointer',
        transition: 'all 300ms ease',
        borderColor: hover ? 'rgba(255,255,255,0.10)' : undefined,
        boxShadow: hover ? 'var(--shadow-card-hi)' : 'none',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        transform: hover ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 300ms ease',
      }}>
        <Icon size={22} style={{ color: f.iconColor }} stroke={2} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fg-1)' }}>{f.title}</h3>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#818cf8',
          background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)',
          padding: '2px 8px', borderRadius: 9999, flexShrink: 0,
        }}>{f.tag}</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-5)', lineHeight: 1.6, marginBottom: 20 }}>{f.desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {f.chips.map(c => (
          <span key={c} style={{
            fontSize: 11, color: 'var(--fg-5)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)',
            padding: '4px 10px', borderRadius: 9999,
          }}>{c}</span>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        color: '#818cf8', fontSize: 13, fontWeight: 500,
        marginTop: 20,
        opacity: hover ? 1 : 0, transition: 'opacity 200ms ease',
      }}>
        Learn more <ArrowRight size={14} stroke={2.4} />
      </div>
    </div>
  );
}

function FeatureGrid() {
  return (
    <section id="features" style={{ padding: '112px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-925)' }}/>
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(109,40,217,0.10)', top: '50%', left: -240 }}/>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="eyebrow">Features</span>
          <h2 className="gradient-text" style={{ margin: '16px 0 20px 0', fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Everything you need.<br/>Nothing you don't.
          </h2>
          <p style={{ maxWidth: 540, margin: '0 auto', fontSize: 18, color: 'var(--fg-5)', lineHeight: 1.6 }}>
            Five core modules. Every one designed to feel obvious, fast, and reliable — the moment you open it for the first time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map(f => <FeatureCard key={f.title} f={f} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>
          {FEATURE_EXTRAS.map(x => {
            const Icon = NrturIcons[x.iconKey];
            return (
              <div key={x.label} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#818cf8' }}>
                  <Icon size={15} stroke={2} />
                </div>
                <span style={{ fontSize: 14, color: 'var(--fg-4)', fontWeight: 500 }}>{x.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
window.FeatureGrid = FeatureGrid;
window.FeatureCard = FeatureCard;
