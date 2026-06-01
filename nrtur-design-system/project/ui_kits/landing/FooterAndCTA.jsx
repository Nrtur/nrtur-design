// Final CTA + footer.

function FinalCTA() {
  const I = NrturIcons;
  return (
    <section style={{ padding: '112px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-950)' }}/>
      <div className="orb" style={{ width: 720, height: 720, background: 'rgba(99,102,241,0.20)', top: '-30%', left: '50%', transform: 'translateX(-50%)' }}/>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
        <h2 className="gradient-text" style={{ margin: 0, fontSize: 56, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          Stop paying for<br/>features you don't use.
        </h2>
        <p style={{ margin: '24px auto 32px', maxWidth: 480, fontSize: 18, color: 'var(--fg-5)', lineHeight: 1.6 }}>
          Try nrtur free for 14 days. Set up takes about 5 minutes. Cancel any time.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <a href="#" className="btn-primary" style={{ padding: '14px 28px', fontSize: 15, textDecoration: 'none' }}>
            Start free trial <I.ArrowRight size={16} stroke={2.4} />
          </a>
          <a href="#" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 15, textDecoration: 'none' }}>
            Talk to a human
          </a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: 'var(--fg-6)', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <I.CheckCircle size={13} stroke={2.2} style={{ color: '#34d399' }} /> No credit card required
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <I.CheckCircle size={13} stroke={2.2} style={{ color: '#34d399' }} /> Cancel anytime
          </span>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const cols = [
    { title: 'Product', items: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'] },
    { title: 'Resources', items: ['Help center', 'API docs', 'Blog', 'Templates', 'Community'] },
    { title: 'Company', items: ['About', 'Customers', 'Careers', 'Press kit', 'Contact'] },
    { title: 'Legal', items: ['Privacy', 'Terms', 'Security', 'DPA', 'Status'] },
  ];
  return (
    <footer style={{ background: 'var(--surface-950)', borderTop: '1px solid var(--border-3)', padding: '64px 0 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 48, marginBottom: 48 }}>
          <div>
            <NrturLogo size={32} withWordmark />
            <p style={{ margin: '16px 0 0 0', fontSize: 13, color: 'var(--fg-5)', lineHeight: 1.6, maxWidth: 260 }}>
              The CRM small teams actually want to use. Built for the 1–5 person crowd who move fast.
            </p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p style={{ margin: '0 0 16px 0', fontSize: 12, fontWeight: 600, color: 'var(--fg-6)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{col.title}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map(item => (
                  <li key={item}>
                    <a href="#" style={{ fontSize: 13, color: 'var(--fg-4)', textDecoration: 'none', transition: 'color 150ms ease' }}
                       onMouseEnter={e => e.currentTarget.style.color = 'var(--fg-1)'}
                       onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-4)'}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: '1px solid var(--border-3)', paddingTop: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-7)' }}>© 2025 nrtur, Inc. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--fg-7)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="glow-pulse" style={{ width: 6, height: 6, borderRadius: 9999, background: '#34d399' }}/>
              All systems operational
            </span>
            <span style={{ width: 1, height: 12, background: 'var(--border-1)' }}/>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
window.FinalCTA = FinalCTA;
window.LandingFooter = LandingFooter;
