const companies = [
  'Meridian Agency',
  'Bloom Creative',
  'Vertex Labs',
  'Summit Digital',
  'Forge & Co',
  'Pivot Studio',
  'Atlas Consulting',
  'Nova Growth',
  'Kapoor & Assoc',
  'Barrett Digital',
  'Clearview Media',
  'Lucent Partners',
  'Meridian Agency',
  'Bloom Creative',
  'Vertex Labs',
  'Summit Digital',
  'Forge & Co',
  'Pivot Studio',
  'Atlas Consulting',
  'Nova Growth',
  'Kapoor & Assoc',
  'Barrett Digital',
  'Clearview Media',
  'Lucent Partners',
]

export default function TrustedBy() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070f] via-[#0a0a14] to-[#07070f]" />

      <div className="relative z-10">
        <p className="text-center text-sm font-medium text-white/25 tracking-widest uppercase mb-10 px-6">
          Trusted by fast-moving teams at
        </p>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#07070f] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#07070f] to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee whitespace-nowrap">
            {companies.map((company, i) => (
              <div
                key={i}
                className="inline-flex items-center mx-8 text-white/20 font-semibold text-lg tracking-tight hover:text-white/40 transition-colors duration-300 cursor-default"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                <span className="mr-3 text-brand-500/30 text-xs">◆</span>
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
