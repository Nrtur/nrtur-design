// Hero section: badge, headline, subhead, CTAs, trust badges, mockup, stats.
function LandingHero() {
  const I = NrturIcons;
  const trustBadges = ['14-day free trial', 'No credit card required', 'Cancel anytime'];
  const stats = [
    { value: '2,400+', label: 'Teams using nrtur' },
    { value: '99.9%',  label: 'Uptime SLA' },
    { value: '$29',    label: 'Per user / mo' },
    { value: '5 min',  label: 'Setup time' },
  ];

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 64 }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="orb" style={{ width: 600, height: 600, background: 'rgba(79,70,229,0.20)', top: -160, left: -160 }}/>
        <div className="orb" style={{ width: 500, height: 500, background: 'rgba(109,40,217,0.15)', top: -80, right: 0 }}/>
        <div className="orb" style={{ width: 400, height: 400, background: 'rgba(55,48,163,0.10)', top: '50%', left: '33%' }}/>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.08), transparent)' }}/>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 192, background: 'linear-gradient(to top, var(--surface-950), transparent)' }}/>
      </div>

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '96px 32px 48px', textAlign: 'center' }}>
          {/* Badge */}
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)',
            borderRadius: 9999, padding: '6px 16px', marginBottom: 32,
          }}>
            <span className="glow-pulse" style={{ width: 6, height: 6, borderRadius: 9999, background: '#818cf8' }}/>
            <span style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 500 }}>Now in early access · Spring 2025</span>
            <I.ArrowRight size={13} stroke={2} style={{ color: '#818cf8' }} />
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{
            fontSize: 'clamp(48px, 7vw, 82px)', lineHeight: 1.05, fontWeight: 900,
            letterSpacing: '-0.02em', margin: '0 0 24px 0',
            animationDelay: '0.1s', animationFillMode: 'both',
          }}>
            <span className="gradient-text">The CRM small teams</span>
            <br/>
            <span className="gradient-text-brand">actually want to use.</span>
          </h1>

          {/* Subhead */}
          <p className="fade-up" style={{
            maxWidth: 640, margin: '0 auto 40px',
            fontSize: 20, color: 'var(--fg-4)', lineHeight: 1.6,
            animationDelay: '0.2s', animationFillMode: 'both',
          }}>
            Everything you need to manage contacts, close deals, and automate follow-ups — without HubSpot's complexity or price tag. Built for teams of 1–5 who move fast.
          </p>

          {/* CTAs */}
          <div className="fade-up" style={{
            display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap',
            animationDelay: '0.3s', animationFillMode: 'both',
          }}>
            <a href="#" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15, textDecoration: 'none' }}>
              Start free trial <I.ArrowRight size={16} stroke={2.4} />
            </a>
            <a href="#" className="btn-secondary" style={{ padding: '14px 32px', fontSize: 15, textDecoration: 'none' }}>
              <span style={{ width: 20, height: 20, borderRadius: 9999, background: 'rgba(255,255,255,0.10)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <I.Play size={9} stroke={0} style={{ color: 'var(--fg-3)', marginLeft: 1 }} />
              </span>
              Watch demo
            </a>
          </div>

          {/* Trust badges */}
          <div className="fade-up" style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
            gap: '8px 24px', marginBottom: 64,
            animationDelay: '0.4s', animationFillMode: 'both',
          }}>
            {trustBadges.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-5)' }}>
                <I.CheckCircle size={13} style={{ color: '#34d399' }} stroke={2.2} />
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="fade-up" style={{
          maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 32px',
          animationDelay: '0.5s', animationFillMode: 'both',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -32, background: 'rgba(99,102,241,0.10)', borderRadius: 24, filter: 'blur(48px)' }}/>
            <div className="float" style={{ position: 'relative' }}>
              <DashboardMockup height={460} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '64px 32px 16px' }}>
          <div style={{
            borderTop: '1px solid var(--border-3)', paddingTop: 40, paddingBottom: 16,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32,
          }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p className="gradient-text-brand" style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>{s.value}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--fg-6)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <I.Star key={i} size={14} style={{ color: '#fbbf24' }} stroke={0} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--fg-5)' }}>
              <span style={{ color: 'var(--fg-3)', fontWeight: 600 }}>4.9/5</span> from 300+ early access reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
window.LandingHero = LandingHero;
