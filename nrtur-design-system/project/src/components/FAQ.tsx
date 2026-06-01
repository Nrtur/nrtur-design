import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How does the 14-day free trial work?',
    a: "Sign up and get full access to your chosen plan for 14 days — no credit card required. You'll have access to all features without restrictions. If you decide nrtur isn't right for you, just cancel before the trial ends and you'll never be charged.",
  },
  {
    q: 'Can I import my existing contacts from HubSpot or another CRM?',
    a: "Yes. We support CSV imports and direct integrations with HubSpot, Salesforce, Pipedrive, and most major CRMs. Our onboarding team will help you migrate cleanly — it typically takes less than 30 minutes for most team sizes.",
  },
  {
    q: 'What email providers does nrtur sync with?',
    a: "We currently support Gmail and Google Workspace, plus Outlook and Microsoft 365. Email sync is two-way: threads you send or receive from contacts are automatically logged in their contact record and the associated deal. Additional email accounts can be added as an add-on for $5/mo each.",
  },
  {
    q: 'Is nrtur secure? Where is my data stored?',
    a: "nrtur uses AES-256 encryption at rest and TLS 1.3 in transit. We're SOC 2 Type II certified, and all data is stored in AWS us-east-1 and eu-west-1 (you choose at signup). We do not sell or share your data with third parties. Business plan customers also get SAML/SSO and audit logs.",
  },
  {
    q: 'Can I cancel at any time?',
    a: "Yes, always. nrtur is month-to-month with no annual contracts required (though we offer 20% off for yearly billing). Cancel from your settings at any time and you'll keep access until the end of your current billing period.",
  },
  {
    q: "What's the difference between Pro and Business?",
    a: "Pro is designed for teams of up to 5 who need full pipeline + automation power. Business adds unlimited users, SSO/SAML, audit logs, custom webhook integrations, a dedicated onboarding specialist, and SLA-backed support. If you're unsure, start with Pro — upgrading takes seconds.",
  },
  {
    q: 'Does nrtur have a mobile app?',
    a: "Yes. iOS and Android apps are included with all plans. You can view and update contacts, move deals through your pipeline, and see activity — all from your phone. Real-time push notifications keep your team in sync on the go.",
  },
  {
    q: 'How long does onboarding take?',
    a: "For most small teams, you can import contacts, set up your first pipeline, and connect email in under 30 minutes. We also offer free 1:1 onboarding sessions for Pro and Business customers to make sure you're set up for success from day one.",
  },
  {
    q: 'What integrations does nrtur support?',
    a: "We integrate with 100+ tools including Slack, Zapier, Make (Integromat), Calendly, Typeform, Stripe, QuickBooks, Google Calendar, Zoom, and more. Business plan customers get access to full API + webhook support for custom integrations.",
  },
  {
    q: 'Is nrtur right for my industry?',
    a: "nrtur works best for service businesses, agencies, consultants, SaaS companies, and B2B sales teams. If your team manages ongoing client relationships and a sales pipeline — regardless of industry — nrtur will feel right at home. We work with teams in marketing, design, tech, consulting, real estate, finance, and more.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <p className="text-base font-semibold text-white/80 group-hover:text-white transition-colors">{q}</p>
        <div className={`w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 transition-all duration-200 ${open ? 'bg-brand-500/15 border-brand-500/25 rotate-180' : ''}`}>
          <ChevronDown size={14} className={`transition-colors ${open ? 'text-brand-400' : 'text-white/30'}`} />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-base text-white/45 leading-relaxed pr-12">{a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const ref = useScrollReveal()

  return (
    <section id="faq" className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-[#07070f]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="reveal section-label mb-4"><span>FAQ</span></div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black tracking-tight gradient-text mb-5">
            Everything you<br />need to know
          </h2>
          <p className="reveal reveal-delay-2 text-lg text-white/40 leading-relaxed">
            Can't find what you're looking for?{' '}
            <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors">Chat with us</a> — we reply within minutes.
          </p>
        </div>

        <div className="reveal reveal-delay-3 glass-card px-7">
          {faqs.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
