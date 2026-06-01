import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Compare', href: '#comparison' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07070f]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand">
            <span className="text-white font-black text-sm tracking-tight">n</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">nrtur</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/50 hover:text-white/90 px-4 py-2 rounded-lg hover:bg-white/[0.04] transition-all duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="text-sm text-white/60 hover:text-white font-medium px-4 py-2 transition-colors duration-150"
          >
            Sign in
          </a>
          <a
            href="#"
            className="btn-primary text-sm py-2 px-5"
          >
            Start free trial
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/[0.04] transition-all"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#07070f]/95 backdrop-blur-xl border-b border-white/[0.06] px-6 pb-6 pt-2 flex flex-col gap-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-white/60 hover:text-white py-3 px-3 rounded-lg hover:bg-white/[0.04] transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            <a href="#" className="text-sm text-white/60 hover:text-white py-2 px-3 text-center transition-colors">
              Sign in
            </a>
            <a href="#" className="btn-primary text-sm justify-center">
              Start free trial
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
