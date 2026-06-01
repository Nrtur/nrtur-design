// Contacts table view.
const STATUS_STYLE = {
  Active:      { bg: 'rgba(16,185,129,0.10)', fg: '#34d399' },
  'Follow-up': { bg: 'rgba(245,158,11,0.10)', fg: '#fbbf24' },
  New:         { bg: 'rgba(59,130,246,0.10)', fg: '#60a5fa' },
};

function ContactsView() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppTopbar
        title="All Contacts"
        subtitle={`${APP_CONTACTS.length * 41} contacts · Last updated now`}
        primaryLabel="+ New Contact"
      />
      <div style={{
        padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)', color: 'var(--fg-4)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>All</button>
        <button style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--fg-6)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Leads</button>
        <button style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--fg-6)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Customers</button>
        <button style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--fg-6)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Archived</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)', color: 'var(--fg-4)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Import CSV</button>
          <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)', color: 'var(--fg-4)', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Export</button>
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 1.5fr 1.5fr 110px 90px 24px',
        gap: 16, padding: '10px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        fontSize: 10, color: 'var(--fg-7)', textTransform: 'uppercase', letterSpacing: '0.14em',
        flexShrink: 0,
      }}>
        <span/>
        <span>Name / Company</span>
        <span>Email</span>
        <span>Status</span>
        <span style={{ textAlign: 'right' }}>Pipeline</span>
        <span/>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {APP_CONTACTS.map(c => (
          <div key={c.email} style={{
            display: 'grid', gridTemplateColumns: '36px 1.5fr 1.5fr 110px 90px 24px',
            gap: 16, padding: '14px 24px', alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            cursor: 'pointer', transition: 'background 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 30, height: 30, borderRadius: 9999, background: c.color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.avatar}</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', lineHeight: 1 }}>{c.name}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--fg-6)' }}>{c.company}</p>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 9999,
              background: STATUS_STYLE[c.status].bg, color: STATUS_STYLE[c.status].fg,
              justifySelf: 'start',
            }}>{c.status}</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--fg-3)', textAlign: 'right' }}>{c.value}</p>
            <span style={{ color: 'var(--fg-7)', fontSize: 14, textAlign: 'right' }}>⋯</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ContactsView = ContactsView;
