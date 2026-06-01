import { useScrollReveal } from '../hooks/useScrollReveal'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    quote:
      "We switched from HubSpot after two years of paying for features we never touched. nrtur does everything our team actually needs and costs a quarter of the price. The pipeline view alone saved us hours a week.",
    name: 'Sarah Chen',
    title: 'CEO',
    company: 'Bloom Creative',
    avatar: 'SC',
    color: 'bg-blue-500',
    stars: 5,
    metric: 'Cut CRM costs by 74%',
  },
  {
    quote:
      "Finally a CRM that doesn't require a three-week onboarding. I set up our sales process in an afternoon and my whole team was using it by end of day. The automations have been a game-changer for follow-ups.",
    name: 'Marcus Rodriguez',
    title: 'Founder',
    company: 'Pivot Studio',
    avatar: 'MR',
    color: 'bg-violet-500',
    stars: 5,
    metric: '3x faster deal closing',
  },
  {
    quote:
      "As a consultant, I need to track relationships across a dozen clients without things getting messy. nrtur's contact management is the cleanest I've used — everything is where you expect it to be.",
    name: 'James Whitfield',
    title: 'Independent Consultant',
    company: 'JW Advisory',
    avatar: 'JW',
    color: 'bg-emerald-500',
    stars: 5,
    metric: 'Manages 12 client accounts',
  },
  {
    quote:
      "We were duct-taping together a spreadsheet, Notion, and Gmail to manage our pipeline. nrtur replaced all three. Email sync was the feature that sold us — every thread is automatically linked to the right deal.",
    name: 'Priya Kapoor',
    title: 'Owner',
    company: 'Kapoor & Associates',
    avatar: 'PK',
    color: 'bg-amber-500',
    stars: 5,
    metric: 'Replaced 3 separate tools',
  },
  {
    quote:
      "The pricing model is refreshingly honest. No upsells, no feature gating behind enterprise tiers. What you see is what you get. For a 4-person agency, Pro plan at $59 is an absolute no-brainer.",
    name: 'Tom Barrett',
    title: 'Founder & Creative Director',
    company: 'Barrett Digital',
    avatar: 'TB',
    color: 'bg-pink-500',
    stars: 5,
    metric: 'Team of 4 · Pro plan',
  },
  {
    quote:
      "We evaluated six CRMs before choosing nrtur. The others either cost too much for a team our size or were too stripped down to be useful. nrtur hit the exact right balance. The support team is also genuinely incredible.",
    name: 'Lisa Nakamura',
    title: 'Head of Operations',
    company: 'Summit Agency',
    avatar: 'LN',
    color: 'bg-teal-500',
    stars: 5,
    metric: 'Chose over 6 competitors',
  },
]

export default function Testimonials() {
  const ref = useScrollReveal()

  return (
    <section className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-[#07070f]" />
      <div className="orb w-[600px] h-[600px] bg-brand-600/8 top-0 left-1/2 -translate-x-1/2 absolute pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal section-label mb-4"><span>Testimonials</span></div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black tracking-tight gradient-text mb-5">
            Loved by teams<br />who move fast
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-lg text-white/40 leading-relaxed">
            Real feedback from founders, agencies, and consultants who made the switch.
          </p>

          {/* Rating bar */}
          <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
              </div>
              <span className="text-white font-bold">4.9</span>
              <span className="text-white/40 text-sm">/ 5.0</span>
            </div>
            <div className="w-px h-5 bg-white/10 hidden sm:block" />
            <span className="text-sm text-white/35">Based on 300+ early access reviews</span>
            <div className="w-px h-5 bg-white/10 hidden sm:block" />
            <span className="text-sm text-white/35">98% would recommend</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`reveal reveal-delay-${Math.min(i + 1, 5)} group glass-card p-7 flex flex-col hover:border-white/10 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300`}
            >
              {/* Stars */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-0.5">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <Quote size={16} className="text-brand-500/40 group-hover:text-brand-500/60 transition-colors" />
              </div>

              {/* Quote */}
              <p className="text-[14px] text-white/55 leading-relaxed mb-6 flex-1">"{t.quote}"</p>

              {/* Metric */}
              <div className="bg-brand-500/[0.07] border border-brand-500/15 rounded-xl px-3 py-2 mb-5">
                <p className="text-[12px] font-semibold text-brand-400">{t.metric}</p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none mb-0.5">{t.name}</p>
                  <p className="text-[12px] text-white/35">{t.title} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
