import { Twitter, Linkedin, Github, Mail } from 'lucide-react'

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Compare: [
    { label: 'vs HubSpot', href: '#comparison' },
    { label: 'vs Salesforce', href: '#' },
    { label: 'vs Pipedrive', href: '#' },
    { label: 'vs Zoho CRM', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Partners', href: '#' },
  ],
}

const social = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Mail, label: 'Email', href: '#' },
]

export default function Footer() {
  return (
    <footer className="relative bg-[#07070f] border-t border-white/[0.05]">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-12">
          {/* Brand column */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand">
                <span className="text-white font-black text-sm">n</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">nrtur</span>
            </a>
            <p className="text-sm text-white/35 leading-relaxed mb-6 max-w-52">
              The CRM built for small teams who'd rather close deals than configure software.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-3">Product updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 transition-all"
                />
                <button className="bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs px-3 py-2 rounded-lg hover:bg-brand-500/30 transition-all whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2">
              {social.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">{category}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">
            © 2025 nrtur, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((item) => (
              <a key={item} href="#" className="text-xs text-white/20 hover:text-white/40 transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/20">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
