// Testimonials grid.
const TESTIMONIALS = [
  { quote: "We switched from HubSpot after two years of paying for features we never touched. nrtur does everything our team actually needs and costs a quarter of the price. The pipeline view alone saved us hours a week.",
    name: 'Sarah Chen', title: 'CEO', company: 'Bloom Creative', avatar: 'SC', color: '#3b82f6', metric: 'Cut CRM costs by 74%' },
  { quote: "Finally a CRM that doesn't require a three-week onboarding. I set up our sales process in an afternoon and my whole team was using it by end of day. The automations have been a game-changer for follow-ups.",
    name: 'Marcus Rodriguez', title: 'Founder', company: 'Pivot Studio', avatar: 'MR', color: '#8b5cf6', metric: '3x faster deal closing' },
  { quote: "As a consultant, I need to track relationships across a dozen clients without things getting messy. nrtur's contact management is the cleanest I've used — everything is where you expect it to be.",
    name: 'James Whitfield', title: 'Independent Consultant', company: 'JW Advisory', avatar: 'JW', color: '#10b981', metric: 'Manages 12 client accounts' },
  { quote: "We were duct-taping together a spreadsheet, Notion, and Gmail to manage our pipeline. nrtur replaced all three. Email sync was the feature that sold us — every thread is automatically linked to the right deal.",
    name: 'Priya Kapoor', title: 'Owner', company: 'Kapoor & Associates', avatar: 'PK', color: '#f59e0b', metric: 'Replaced 3 separate tools' },
  { quote: "The pricing model is refreshingly honest. No upsells, no feature gating behind enterprise tiers. What you see is what you get. For a 4-person agency, Pro plan at $59 is an absolute no-brainer.",
    name: 'Tom Barrett', title: 'Founder & Creative Director', company: 'Barrett Digital', avatar: 'TB', color: '#ec4899', metric: 'Team of 4 · Pro plan' },
  { quote: "We evaluated six CRMs before choosing nrtur. The others either cost too much for a team our size or were too stripped down to be useful. nrtur hit the exact right balance. The support team is also genuinely incredible.",
    name: 'Lisa Nakamura', title: 'Head of Operations', company: 'Summit Agency', avatar: 'LN', color: '#14b8a6', metric: 'Chose over 6 competitors' },
];

function TestimonialCard({ t }) {
  const I = NrturIcons;
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="glass-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 28, display: 'flex', flexDirection: 'column',
        transition: 'all 300ms ease',
        borderColor: hover ? 'rgba(255,255,255,0.10)' : undefined,
        boxShadow: hover ? 'var(--shadow-card-hi)' : 'none',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[...Array(5)].map((_, i) => <I.Star key={i} size={13} stroke={0} style={{ color: '#fbbf24' }} />)}
        </div>
        <I.Quote size={16} stroke={0} style={{ color: hover ? 'rgba(99,102,241,0.60)' : 'rgba(99,102,241,0.40)', transition: 'color 300ms ease' }} />
      </div>
      <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--fg-4)', lineHeight: 1.7, flex: 1 }}>"{t.quote}"</p>
      <div style={{
        background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 12, padding: '6px 12px', marginBottom: 20,
      }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#818cf8' }}>{t.metric}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 9999, background: t.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>{t.avatar}</div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1 }}>{t.name}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--fg-6)' }}>{t.title} · {t.company}</p>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const I = NrturIcons;
  return (
    <section style={{ padding: '112px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-950)' }}/>
      <div className="orb" style={{ width: 600, height: 600, background: 'rgba(79,70,229,0.08)', top: 0, left: '50%', transform: 'translateX(-50%)' }}/>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="eyebrow">Testimonials</span>
          <h2 className="gradient-text" style={{ margin: '16px 0 20px 0', fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Loved by teams<br/>who move fast
          </h2>
          <p style={{ maxWidth: 540, margin: '0 auto', fontSize: 18, color: 'var(--fg-5)', lineHeight: 1.6 }}>
            Real feedback from founders, agencies, and consultants who made the switch.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => <I.Star key={i} size={16} stroke={0} style={{ color: '#fbbf24' }} />)}
              </div>
              <span style={{ color: 'var(--fg-1)', fontWeight: 700 }}>4.9</span>
              <span style={{ color: 'var(--fg-5)', fontSize: 14 }}>/ 5.0</span>
            </div>
            <div style={{ width: 1, height: 20, background: 'var(--border-1)' }}/>
            <span style={{ fontSize: 14, color: 'var(--fg-6)' }}>Based on 300+ early access reviews</span>
            <div style={{ width: 1, height: 20, background: 'var(--border-1)' }}/>
            <span style={{ fontSize: 14, color: 'var(--fg-6)' }}>98% would recommend</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {TESTIMONIALS.map(t => <TestimonialCard key={t.name} t={t} />)}
        </div>
      </div>
    </section>
  );
}
window.Testimonials = Testimonials;
window.TestimonialCard = TestimonialCard;
