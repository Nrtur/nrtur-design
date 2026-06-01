import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { Check, Zap, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 23,
    description: 'Perfect for solo operators and tiny teams just getting started.',
    cta: 'Start free trial',
    popular: false,
    features: [
      'Up to 2 users',
      '5,000 contacts',
      '2 pipelines',
      'Email sync (1 account)',
      'Basic automations (5 workflows)',
      'Standard reporting',
      'Email support',
      'Mobile app',
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 59,
    yearlyPrice: 47,
    description: 'For growing teams that need more pipelines, automations, and power.',
    cta: 'Start free trial',
    popular: true,
    features: [
      'Up to 5 users',
      '25,000 contacts',
      'Unlimited pipelines',
      'Email sync (3 accounts)',
      'Advanced automations (unlimited)',
      'Advanced analytics & forecasting',
      'Priority support',
      'API access',
      'Custom fields',
      'Team collaboration tools',
    ],
  },
  {
    name: 'Business',
    monthlyPrice: 99,
    yearlyPrice: 79,
    description: 'For established teams that need full control, compliance, and scale.',
    cta: 'Start free trial',
    popular: false,
    features: [
      'Unlimited users',
      'Unlimited contacts',
      'Unlimited pipelines',
      'Email sync (unlimited)',
      'Automations + custom webhooks',
      'Custom reporting builder',
      'Dedicated onboarding',
      'SLA support',
      'SSO / SAML',
      'Audit logs & permissions',
      'Custom integrations',
    ],
  },
]

const addOns = [
  { name: 'Extra email account sync', price: '$5/mo per account', description: 'Add additional email accounts beyond your plan limit' },
  { name: 'White-label reports', price: '$15/mo', description: 'Brand reports with your company logo for client delivery' },
]

export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  const ref = useScrollReveal()

  return (
    <section id="pricing" className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-[#09091a]" />
      <div className="orb w-[500px] h-[500px] bg-brand-600/10 top-0 right-0 absolute pointer-events-none" />
      <div className="orb w-96 h-96 bg-violet-600/8 bottom-0 left-0 absolute pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="reveal section-label mb-4"><span>Pricing</span></div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black tracking-tight gradient-text mb-5">
            Honest pricing.<br />No surprises.
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-lg text-white/40 leading-relaxed mb-8">
            Everything is month-to-month. No annual lock-in, no enterprise sales calls.
            Just pick a plan and start using it today.
          </p>

          {/* Toggle */}
          <div className="reveal reveal-delay-3 inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !yearly ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                yearly ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Yearly
              <span className="text-[11px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="reveal reveal-delay-4 grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-brand-500/10 to-transparent border border-brand-500/30 shadow-brand'
                  : 'glass-card hover:border-white/10 hover:shadow-card-hover'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-brand-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-brand">
                    <Zap size={10} />
                    Most popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-white/50 mb-1">{plan.name}</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-black text-white">
                    ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <div className="pb-1.5">
                    <p className="text-white/30 text-sm leading-none">/user</p>
                    <p className="text-white/30 text-sm leading-none">/month</p>
                  </div>
                </div>
                {yearly && (
                  <p className="text-[12px] text-white/30">
                    Billed ${yearly ? plan.yearlyPrice * 12 : plan.monthlyPrice * 12}/yr per user
                  </p>
                )}
                <p className="text-sm text-white/40 leading-relaxed mt-3">{plan.description}</p>
              </div>

              <a
                href="#"
                className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 mb-7 ${
                  plan.popular
                    ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5'
                    : 'bg-white/[0.06] hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white'
                }`}
              >
                {plan.cta}
                <ArrowRight size={14} />
              </a>

              <div className="flex-1">
                <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider mb-4">What's included</p>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/55">
                      <Check
                        size={14}
                        className={`flex-shrink-0 mt-0.5 ${plan.popular ? 'text-brand-400' : 'text-white/30'}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Free trial note */}
        <p className="reveal text-center text-sm text-white/30 mb-14">
          All plans include a <span className="text-white/60 font-medium">14-day free trial</span> with full access.{' '}
          <span className="text-white/60 font-medium">No credit card required.</span>
        </p>

        {/* Add-ons */}
        <div className="reveal">
          <p className="text-center text-sm font-semibold text-white/30 uppercase tracking-widest mb-6">Add-ons</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {addOns.map((a) => (
              <div key={a.name} className="glass-card p-5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white/70">{a.name}</p>
                  <span className="text-sm font-bold text-brand-400">{a.price}</span>
                </div>
                <p className="text-xs text-white/30">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
