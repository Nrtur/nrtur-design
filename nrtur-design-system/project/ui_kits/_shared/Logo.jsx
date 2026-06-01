// Reusable Nrtur logo mark + wordmark.
function NrturLogo({ size = 32, withWordmark = false, radius }) {
  const r = radius ?? (size <= 24 ? 6 : 8);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: size, height: size, borderRadius: r,
          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 4px 60px rgba(99,102,241,0.15)',
        }}
      >
        <span style={{
          color: '#fff',
          fontWeight: 900,
          fontSize: Math.round(size * 0.45),
          lineHeight: 1,
        }}>n</span>
      </div>
      {withWordmark && (
        <span style={{
          color: 'var(--fg-1)',
          fontWeight: 700,
          fontSize: size <= 28 ? 17 : 19,
          letterSpacing: '-0.01em',
        }}>nrtur</span>
      )}
    </div>
  );
}
window.NrturLogo = NrturLogo;
