// Kanban pipeline view.
function PipelineDealCard({ deal }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        border: '1px solid ' + (hover ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)'),
        borderRadius: 12, padding: 12, cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', lineHeight: 1.25 }}>{deal.company}</p>
        <span style={{ color: 'var(--fg-8)', opacity: hover ? 1 : 0, transition: 'opacity 150ms', fontSize: 13 }}>⋯</span>
      </div>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--fg-4)', marginBottom: 10 }}>{deal.value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 9999,
          background: 'rgba(99,102,241,0.20)', border: '1px solid rgba(99,102,241,0.20)',
          color: '#818cf8', fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{deal.owner}</div>
        <span style={{
          fontSize: 10, fontWeight: 500, padding: '3px 8px',
          borderRadius: 9999, background: deal.tagBg, color: deal.tagFg,
        }}>{deal.tag}</span>
      </div>
    </div>
  );
}

function PipelineView() {
  const I = NrturIcons;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppTopbar
        title="Sales Pipeline"
        subtitle="Q2 2025 · 28 open deals · $324k total"
        primaryLabel="+ New Deal"
      />

      {/* Metrics strip */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 32, flexShrink: 0, overflowX: 'auto',
      }}>
        {APP_METRICS.map(m => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-6)', lineHeight: 1, marginBottom: 5 }}>{m.label}</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1 }}>{m.value}</p>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, padding: '2px 7px', borderRadius: 9999,
              background: m.up ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
              color: m.up ? '#34d399' : '#f87171',
            }}>
              <I.TrendUp size={9} stroke={2.5} />
              {m.change}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)',
            color: 'var(--fg-4)', fontSize: 11, padding: '6px 12px', borderRadius: 8,
            display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}>
            <I.Filter size={11} stroke={2} /> Filter
          </button>
          <button style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-3)',
            color: 'var(--fg-4)', fontSize: 11, padding: '6px 12px', borderRadius: 8,
            cursor: 'pointer',
          }}>This quarter</button>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: 'flex', gap: 14, padding: 20, flex: 1, overflowX: 'auto', minHeight: 0 }}>
        {APP_PIPELINE.map(stage => (
          <div key={stage.name} style={{ minWidth: 220, width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: 9999, background: stage.color }}/>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)' }}>{stage.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 11, color: 'var(--fg-6)' }}>{stage.value}</span>
                <span style={{
                  fontSize: 10, background: 'rgba(255,255,255,0.06)',
                  width: 18, height: 18, borderRadius: 9999,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--fg-5)', fontWeight: 600,
                }}>{stage.count}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stage.deals.map(deal => <PipelineDealCard key={deal.company} deal={deal} />)}
              <div style={{
                border: '1px dashed var(--border-3)', borderRadius: 12,
                padding: 10, display: 'flex', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--fg-7)', fontSize: 11,
                transition: 'border-color 150ms ease',
              }}>+ Add deal</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.PipelineView = PipelineView;
window.PipelineDealCard = PipelineDealCard;
