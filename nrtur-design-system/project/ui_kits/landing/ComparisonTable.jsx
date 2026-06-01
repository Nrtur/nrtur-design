// Comparison table · nrtur vs HubSpot.
const COMPARISON_ROWS = [
  { feature: 'Starting price',        nrtur: '$29/user/mo',     hubspot: '$90/user/mo',      win: true },
  { feature: 'Free trial',            nrtur: '14 days',         hubspot: 'Limited free',     win: true },
  { feature: 'Setup time',            nrtur: '~5 minutes',      hubspot: '1–4 weeks',        win: true },
  { feature: 'Contact management',    nrtur: true,              hubspot: true,               win: false },
  { feature: 'Sales pipelines',       nrtur: true,              hubspot: true,               win: false },
  { feature: 'Email sync',            nrtur: true,              hubspot: true,               win: false },
  { feature: 'Automations',           nrtur: true,              hubspot: 'Paid add-on',      win: true },
  { feature: 'Team management',       nrtur: true,              hubspot: true,               win: false },
  { feature: 'No enterprise upsells', nrtur: true,              hubspot: false,              win: true },
  { feature: 'Onboarding support',    nrtur: 'Human, 1:1',      hubspot: 'Documentation',    win: true },
  { feature: 'Contract lock-in',      nrtur: 'Month-to-month',  hubspot: 'Annual plans',     win: true },
  { feature: 'UI complexity',         nrtur: 'Simple, focused', hubspot: 'Enterprise-grade', win: true },
];

function ComparisonCell({ value, highlight }) {
  const I = NrturIcons;
  if (value === true) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 24, height: 24, borderRadius: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: highlight ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
          color: highlight ? '#34d399' : 'var(--fg-5)',
        }}>
          <I.Check size={13} stroke={2.4} />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 24, height: 24, borderRadius: 9999,
          background: 'rgba(239,68,68,0.10)', color: 'rgba(248,113,113,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <I.X size={13} stroke={2.4} />
        </div>
      </div>
    );
  }
  return (
    <span style={{
      fontSize: 14, fontWeight: 500,
      color: highlight ? '#34d399' : 'var(--fg-4)',
    }}>{value}</span>
  );
}

function ComparisonTable() {
  return (
    <section id="compare" style={{ padding: '112px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--surface-950), var(--surface-925))' }}/>
      <div className="orb" style={{ width: 384, height: 384, background: 'rgba(79,70,229,0.10)', top: '25%', right: -192 }}/>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="eyebrow">Why nrtur</span>
          <h2 className="gradient-text" style={{ margin: '16px 0 20px 0', fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em' }}>
            The obvious upgrade<br/>from HubSpot
          </h2>
          <p style={{ maxWidth: 540, margin: '0 auto', fontSize: 18, color: 'var(--fg-5)', lineHeight: 1.6 }}>
            HubSpot was built for enterprise. nrtur is built for you. Same core power, fraction of the price, none of the bloat.
          </p>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', borderBottom: '1px solid var(--border-3)' }}>
            <div style={{ padding: '20px 24px' }}/>
            <div style={{
              padding: '20px 16px', textAlign: 'center',
              borderLeft: '1px solid rgba(99,102,241,0.20)',
              background: 'rgba(99,102,241,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <NrturLogo size={20} radius={6} />
                <span style={{ fontWeight: 700, color: 'var(--fg-1)', fontSize: 14 }}>nrtur</span>
              </div>
              <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 500 }}>from $29/mo</span>
            </div>
            <div style={{ padding: '20px 16px', textAlign: 'center', borderLeft: '1px solid var(--border-3)' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--fg-5)', fontSize: 14, marginBottom: 4 }}>HubSpot</p>
              <span style={{ fontSize: 11, color: 'var(--fg-7)' }}>from $90/mo</span>
            </div>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <div key={row.feature} style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 160px',
              borderBottom: i === COMPARISON_ROWS.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', fontSize: 14, color: 'var(--fg-3)' }}>{row.feature}</div>
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(99,102,241,0.10)', background: 'rgba(99,102,241,0.03)' }}>
                <ComparisonCell value={row.nrtur} highlight={row.win} />
              </div>
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                <ComparisonCell value={row.hubspot} />
              </div>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ padding: '20px 24px' }}/>
            <div style={{ padding: '20px 16px', display: 'flex', justifyContent: 'center', borderLeft: '1px solid rgba(99,102,241,0.15)' }}>
              <a href="#" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13, textDecoration: 'none' }}>Get started</a>
            </div>
            <div style={{ padding: '20px 16px', display: 'flex', justifyContent: 'center', borderLeft: '1px solid var(--border-3)' }}>
              <button style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--fg-7)', cursor: 'pointer' }}>Stay with HubSpot</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
window.ComparisonTable = ComparisonTable;
