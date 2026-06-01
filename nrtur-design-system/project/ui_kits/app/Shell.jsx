// Left rail · vertical icon nav.
function AppSidebar({ active, onChange }) {
  const I = NrturIcons;
  const items = [
    { key: 'dash',        label: 'Dashboard',  Icon: I.LayoutDash },
    { key: 'contacts',    label: 'Contacts',   Icon: I.Users },
    { key: 'pipeline',    label: 'Pipeline',   Icon: I.GitBranch },
    { key: 'inbox',       label: 'Inbox',      Icon: I.Mail },
    { key: 'automations', label: 'Automations',Icon: I.Zap },
    { key: 'analytics',   label: 'Analytics',  Icon: I.BarChart },
  ];

  return (
    <aside style={{
      width: 56, background: 'var(--surface-950)', borderRight: '1px solid var(--border-4)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 0', gap: 6, flexShrink: 0,
    }}>
      <div style={{ marginBottom: 16 }}>
        <NrturLogo size={32} radius={8} />
      </div>
      {items.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={label}
            style={{
              width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'rgba(99,102,241,0.20)' : 'transparent',
              color: isActive ? '#818cf8' : 'var(--fg-7)',
              boxShadow: isActive ? '0 0 0 1px rgba(99,102,241,0.25)' : 'none',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--fg-3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--fg-7)'; e.currentTarget.style.background = 'transparent'; } }}
          >
            <Icon size={16} stroke={2} />
          </button>
        );
      })}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 12, border: 'none',
          background: 'transparent', color: 'var(--fg-7)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <I.Settings size={16} stroke={2} />
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: 9999, background: APP_USER.color,
          color: '#fff', fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{APP_USER.avatar}</div>
      </div>
    </aside>
  );
}

// Top bar — title, count, search, bell, primary action.
function AppTopbar({ title, subtitle, primaryLabel = '+ New', onPrimary }) {
  const I = NrturIcons;
  return (
    <div style={{
      padding: '16px 24px', borderBottom: '1px solid var(--border-4)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, background: 'var(--surface-925)',
    }}>
      <div>
        <p style={{ margin: 0, color: 'var(--fg-1)', fontSize: 15, fontWeight: 600, lineHeight: 1 }}>{title}</p>
        {subtitle && <p style={{ margin: '6px 0 0 0', color: 'var(--fg-6)', fontSize: 12 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)',
          borderRadius: 10, padding: '8px 12px', color: 'var(--fg-7)', width: 260,
        }}>
          <I.Search size={13} stroke={2} />
          <span style={{ fontSize: 12 }}>Search…</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-8)' }}>⌘K</span>
        </div>
        <button style={{
          width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border-3)',
          background: 'rgba(255,255,255,0.04)', color: 'var(--fg-5)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <I.Bell size={14} stroke={2} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 9999, background: '#818cf8' }}/>
        </button>
        <button onClick={onPrimary} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
          background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)',
          color: '#818cf8', fontSize: 12, fontWeight: 500, padding: '8px 14px',
          borderRadius: 10, fontFamily: 'inherit',
        }}>{primaryLabel}</button>
      </div>
    </div>
  );
}

window.AppSidebar = AppSidebar;
window.AppTopbar = AppTopbar;
