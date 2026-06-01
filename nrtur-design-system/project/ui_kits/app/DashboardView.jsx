// Dashboard overview · combines metric tiles + recent activity + quick-view pipeline.
function DashboardView() {
  const I = NrturIcons;
  const top = APP_PIPELINE;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppTopbar
        title={`Good afternoon, ${APP_USER.name.split(' ')[0]}`}
        subtitle="Here's how your pipeline is looking today"
        primaryLabel="+ New Deal"
      />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Metric tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {APP_METRICS.map(m => (
            <div key={m.label} className="glass-card" style={{ padding: 18 }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-6)', marginBottom: 10 }}>{m.label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--fg-1)', lineHeight: 1 }}>{m.value}</p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 9999,
                  background: m.up ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                  color: m.up ? '#34d399' : '#f87171',
                }}>
                  <I.TrendUp size={10} stroke={2.5}/>
                  {m.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
          {/* Pipeline glimpse */}
          <div className="glass-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>Pipeline overview</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--fg-6)' }}>28 open deals across 4 stages</p>
              </div>
              <a href="#" style={{ fontSize: 12, color: '#818cf8', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                Open pipeline <I.ArrowRight size={11} stroke={2.4} />
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, flex: 1 }}>
              {top.map(s => (
                <div key={s.name} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-4)',
                  borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 9999, background: s.color }}/>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-4)' }}>{s.name}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--fg-1)', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-6)' }}>{s.count} deals</p>
                  <div style={{ marginTop: 'auto', height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.count / 12) * 100}%`, background: s.color, borderRadius: 9999 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="glass-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <p style={{ margin: '0 0 14px 0', fontSize: 12, fontWeight: 600, color: 'var(--fg-6)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Activity</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
              {APP_ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 9999, background: a.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
                  }}>{a.name[0]}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.4 }}>
                      <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{a.name}</span> {a.action}
                    </p>
                    <p style={{ margin: '3px 0 0 0', fontSize: 10, color: 'var(--fg-7)' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardView = DashboardView;
