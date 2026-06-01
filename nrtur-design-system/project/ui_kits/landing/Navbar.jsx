// Top navigation bar.
// Transparent on top, frosted bg + 6% border once scrolled past 24px.
function LandingNavbar() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Compare', href: '#compare' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 300ms ease',
        background: scrolled ? 'rgba(7,7,15,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-3)' : '1px solid transparent',
      }}
    >
      <nav style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <NrturLogo size={32} withWordmark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize: 13, color: 'var(--fg-4)',
              padding: '8px 14px', borderRadius: 8,
              textDecoration: 'none', transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg-1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-4)'; e.currentTarget.style.background = 'transparent'; }}
            >{l.label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="#" style={{
            fontSize: 13, color: 'var(--fg-3)', fontWeight: 500,
            padding: '8px 4px', textDecoration: 'none',
          }}>Sign in</a>
          <a href="#" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13, textDecoration: 'none' }}>
            Start free trial
          </a>
        </div>
      </nav>
    </header>
  );
}
window.LandingNavbar = LandingNavbar;
