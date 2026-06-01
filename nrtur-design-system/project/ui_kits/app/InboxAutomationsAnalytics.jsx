// Inbox + Automations + Analytics views.

// ------- Inbox -------
function InboxView() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppTopbar
        title="Email Sync"
        subtitle="Gmail connected · 2 accounts synced"
        primaryLabel="Compose"
      />
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)', color: 'var(--fg-4)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>All inboxes</button>
          <button style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--fg-6)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Unread</button>
          <button style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--fg-6)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Starred</button>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)',
          borderRadius: 9999, padding: '4px 12px',
        }}>
          <span className="glow-pulse" style={{ width: 6, height: 6, borderRadius: 9999, background: '#34d399' }}/>
          <span style={{ fontSize: 11, color: '#34d399', fontWeight: 500 }}>Live sync</span>
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {APP_EMAILS.map(e => (
          <div key={e.subject} style={{
            display: 'flex', gap: 14, padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            cursor: 'pointer', transition: 'background 150ms ease',
            background: e.unread ? 'rgba(255,255,255,0.015)' : 'transparent',
          }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
          onMouseLeave={ev => ev.currentTarget.style.background = e.unread ? 'rgba(255,255,255,0.015)' : 'transparent'}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9999, background: e.color,
              color: '#fff', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{e.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: e.unread ? 'var(--fg-1)' : 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.from}</p>
                <span style={{ fontSize: 11, color: 'var(--fg-7)', flexShrink: 0 }}>{e.time}</span>
              </div>
              <p style={{ margin: '0 0 3px 0', fontSize: 13, color: e.unread ? 'var(--fg-2)' : 'var(--fg-5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.preview}</p>
            </div>
            {e.unread && <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#818cf8', flexShrink: 0, marginTop: 6 }}/>}
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 24px', textAlign: 'center', borderTop: '1px solid var(--border-4)' }}>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-7)' }}>All emails are automatically linked to contacts</p>
      </div>
    </div>
  );
}

// ------- Automations -------
function AutomationsView() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppTopbar
        title="Automations"
        subtitle={`${APP_WORKFLOWS.filter(w => w.active).length} active workflows · 422 runs this month`}
        primaryLabel="+ New Workflow"
      />
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        {APP_WORKFLOWS.map(w => (
          <div key={w.trigger} className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={w.active ? 'glow-pulse' : ''} style={{
                  width: 8, height: 8, borderRadius: 9999,
                  background: w.active ? '#34d399' : 'var(--fg-7)',
                }}/>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>When: {w.trigger}</p>
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 9999,
                  background: w.active ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.06)',
                  color: w.active ? '#34d399' : 'var(--fg-5)',
                }}>{w.active ? 'Active' : 'Paused'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--fg-6)' }}>{w.runs} runs</span>
                <span style={{ color: 'var(--fg-7)', fontSize: 14 }}>⋯</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginLeft: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
                {w.steps.map((_, i) => (
                  <React.Fragment key={i}>
                    <div style={{ width: 6, height: 6, borderRadius: 9999, background: 'rgba(99,102,241,0.50)' }}/>
                    {i < w.steps.length - 1 && <div style={{ width: 1, height: 14, background: 'var(--border-1)' }}/>}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {w.steps.map(step => (
                  <p key={step} style={{ margin: 0, fontSize: 12, color: 'var(--fg-4)' }}>{step}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------- Analytics -------
function AnalyticsView() {
  const I = NrturIcons;
  const bars = [
    { label: 'Jan', value: 65, deals: 14 },
    { label: 'Feb', value: 48, deals: 11 },
    { label: 'Mar', value: 78, deals: 18 },
    { label: 'Apr', value: 92, deals: 21 },
    { label: 'May', value: 86, deals: 19 },
    { label: 'Jun', value: 100, deals: 24 },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppTopbar
        title="Revenue Analytics"
        subtitle="Q2 2025 · Updated live"
        primaryLabel="Export"
      />
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['1M', '3M', '6M', '1Y'].map((t, i) => (
            <button key={t} style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              background: i === 2 ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: '1px solid ' + (i === 2 ? 'rgba(99,102,241,0.25)' : 'var(--border-3)'),
              color: i === 2 ? '#818cf8' : 'var(--fg-5)',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Total Revenue', value: '$134k', change: '+31%', up: true },
            { label: 'Deals Won', value: '107', change: '+18%', up: true },
            { label: 'Win Rate', value: '68%', change: '-2%', up: false },
          ].map(m => (
            <div key={m.label} className="glass-card" style={{ padding: 18 }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-6)', marginBottom: 8 }}>{m.label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: 'var(--fg-1)', lineHeight: 1 }}>{m.value}</p>
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
        <div className="glass-card" style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-5)', fontWeight: 500 }}>Revenue by month</p>
            <span style={{ fontSize: 11, color: 'var(--fg-7)' }}>Deals won shown above bars</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flex: 1, minHeight: 160 }}>
            {bars.map(b => (
              <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                <span style={{ fontSize: 10, color: 'var(--fg-6)' }}>{b.deals}</span>
                <div style={{
                  width: '100%',
                  borderRadius: '6px 6px 0 0',
                  background: 'linear-gradient(to top, #4f46e5, #818cf8)',
                  height: `${b.value}%`,
                  transition: 'height 600ms ease',
                }}/>
                <span style={{ fontSize: 10, color: 'var(--fg-6)' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.InboxView = InboxView;
window.AutomationsView = AutomationsView;
window.AnalyticsView = AnalyticsView;
