// Pricing tiles · Starter / Pro (popular) / Business.
const PLANS = [
  { name: 'Starter', monthly: 29, yearly: 23, popular: false,
    desc: 'Perfect for solo operators and tiny teams just getting started.',
    features: ['Up to 2 users', '5,000 contacts', '2 pipelines', 'Email sync (1 account)', 'Basic automations (5 workflows)', 'Standard reporting', 'Email support', 'Mobile app'] },
  { name: 'Pro', monthly: 59, yearly: 47, popular: true,
    desc: 'For growing teams that need more pipelines, automations, and power.',
    features: ['Up to 5 users', '25,000 contacts', 'Unlimited pipelines', 'Email sync (3 accounts)', 'Advanced automations (unlimited)', 'Advanced analytics & forecasting', 'Priority support', 'API access', 'Custom fields', 'Team collaboration tools'] },
  { name: 'Business', monthly: 99, yearly: 79, popular: false,
    desc: 'For established teams that need full control, compliance, and scale.',
    features: ['Unlimited users', 'Unlimited contacts', 'Unlimited pipelines', 'Email sync (unlimited)', 'Automations + custom webhooks', 'Custom reporting builder', 'Dedicated onboarding', 'SLA support', 'SSO / SAML', 'Audit logs & permissions', 'Custom integrations'] },
];

const ADDONS = [
  { name: 'Extra email account sync', price: '$5/mo per account', desc: 'Add additional email accounts beyond your plan limit' },
  { name: 'White-label reports',      price: '$15/mo',            desc: 'Brand reports with your company logo for client delivery' },
];

function PricingTile({ plan, yearly }) {
  const I = NrturIcons;
  const price = yearly ? plan.yearlyPrice ?? plan.yearly : plan.monthlyPrice ?? plan.monthly;
  return (
    <div style={{
      position: 'relative', borderRadius: 16, padding: 28,
      display: 'flex', flexDirection: 'column',
      background: plan.popular ? 'linear-gradient(to bottom, rgba(99,102,241,0.10), transparent)' : 'rgba(255,255,255,0.03)',
      border: '1px solid ' + (plan.popular ? 'rgba(99,102,241,0.30)' : 'var(--border-3)'),
      boxShadow: plan.popular ? 'var(--shadow-brand)' : 'none',
      transition: 'all 300ms ease',
    }}>
      {plan.popular && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '4px 12px', borderRadius: 9999, boxShadow: 'var(--shadow-brand)',
        }}>
          <I.Zap size={10} stroke={2.4} />
          Most popular
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-4)', marginBottom: 4 }}>{plan.name}</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: 'var(--fg-1)', lineHeight: 1 }}>${price}</span>
          <div style={{ paddingBottom: 6 }}>
            <p style={{ margin: 0, color: 'var(--fg-6)', fontSize: 14, lineHeight: 1 }}>/user</p>
            <p style={{ margin: 0, color: 'var(--fg-6)', fontSize: 14, lineHeight: 1.2 }}>/month</p>
          </div>
        </div>
        {yearly && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-6)' }}>Billed ${price * 12}/yr per user</p>
        )}
        <p style={{ margin: '12px 0 0 0', fontSize: 14, color: 'var(--fg-5)', lineHeight: 1.6 }}>{plan.desc}</p>
      </div>

      <a href="#" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14,
        textDecoration: 'none', marginBottom: 28,
        background: plan.popular ? '#6366f1' : 'rgba(255,255,255,0.06)',
        color: plan.popular ? '#fff' : 'var(--fg-2)',
        border: plan.popular ? 'none' : '1px solid var(--border-1)',
        boxShadow: plan.popular ? 'var(--shadow-brand)' : 'none',
        transition: 'all 200ms ease',
      }}>
        Start free trial <I.ArrowRight size={14} stroke={2.4} />
      </a>

      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 16px 0', fontSize: 11, fontWeight: 600, color: 'var(--fg-7)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>What's included</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plan.features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--fg-4)' }}>
              <I.Check size={14} stroke={2.4} style={{ color: plan.popular ? '#818cf8' : 'var(--fg-6)', flexShrink: 0, marginTop: 2 }} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PricingTable() {
  const [yearly, setYearly] = React.useState(false);
  return (
    <section id="pricing" style={{ padding: '112px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-925)' }}/>
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(79,70,229,0.10)', top: 0, right: 0 }}/>
      <div className="orb" style={{ width: 384, height: 384, background: 'rgba(124,58,237,0.08)', bottom: 0, left: 0 }}/>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="eyebrow">Pricing</span>
          <h2 className="gradient-text" style={{ margin: '16px 0 20px 0', fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Honest pricing.<br/>No surprises.
          </h2>
          <p style={{ maxWidth: 540, margin: '0 auto 32px', fontSize: 18, color: 'var(--fg-5)', lineHeight: 1.6 }}>
            Everything is month-to-month. No annual lock-in, no enterprise sales calls. Just pick a plan and start using it today.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-2)',
            borderRadius: 9999, padding: 4,
          }}>
            <button onClick={() => setYearly(false)} style={{
              background: !yearly ? 'rgba(255,255,255,0.10)' : 'transparent',
              color: !yearly ? 'var(--fg-1)' : 'var(--fg-5)',
              padding: '8px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, transition: 'all 200ms ease',
            }}>Monthly</button>
            <button onClick={() => setYearly(true)} style={{
              background: yearly ? 'rgba(255,255,255,0.10)' : 'transparent',
              color: yearly ? 'var(--fg-1)' : 'var(--fg-5)',
              padding: '8px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'all 200ms ease',
            }}>
              Yearly
              <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.20)', color: '#34d399', padding: '1px 8px', borderRadius: 9999, fontWeight: 600 }}>Save 20%</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {PLANS.map(plan => <PricingTile key={plan.name} plan={plan} yearly={yearly} />)}
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--fg-6)', marginBottom: 56 }}>
          All plans include a <span style={{ color: 'var(--fg-3)', fontWeight: 500 }}>14-day free trial</span> with full access.{' '}
          <span style={{ color: 'var(--fg-3)', fontWeight: 500 }}>No credit card required.</span>
        </p>

        <div>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--fg-6)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 24 }}>Add-ons</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 640, margin: '0 auto' }}>
            {ADDONS.map(a => (
              <div key={a.name} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-3)' }}>{a.name}</p>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#818cf8' }}>{a.price}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-6)' }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
window.PricingTable = PricingTable;
window.PricingTile = PricingTile;
