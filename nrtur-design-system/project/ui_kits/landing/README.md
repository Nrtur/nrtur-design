# Landing UI Kit · nrtur marketing site

A high-fidelity recreation of the nrtur marketing landing page, refactored into small composable JSX components. Use these pieces to assemble new marketing surfaces, sub-pages, slides, or one-off promo screens that need to feel like the rest of the site.

## Files

| File | Component | Notes |
|---|---|---|
| `index.html` | Demo page — assembles every component in source order. | Click-thru: scroll, pricing toggle (Monthly/Yearly), feature/testimonial hover states all wired up. |
| `Navbar.jsx` | `<LandingNavbar />` | Transparent on top; switches to frosted-glass + 6% border at `scrollY > 24`. |
| `Hero.jsx` | `<LandingHero />` | Centered headline + gradient-text + indigo CTA + floating mockup. Background = orbs + grid + radial fade + bottom fade-out. |
| `DashboardMockup.jsx` | `<DashboardMockup />`, `<DealCard />` | The product UI used as hero image — pipeline view with sidebar, topbar, kanban, activity rail. Used inside Hero. |
| `FeatureGrid.jsx` | `<FeatureGrid />`, `<FeatureCard />` | 3-column grid, first card spans 2. Icon tile + tag pill + chips + hover arrow. |
| `ComparisonTable.jsx` | `<ComparisonTable />`, `<ComparisonCell />` | nrtur vs HubSpot. Highlighted column on the nrtur side; bottom CTA row. |
| `PricingTable.jsx` | `<PricingTable />`, `<PricingTile />` | Monthly/Yearly pill toggle. Pro tile gets the brand-tinted gradient + "Most popular" badge. |
| `Testimonials.jsx` | `<Testimonials />`, `<TestimonialCard />` | Six glass cards, stars + quote + metric chip + avatar/name. |
| `FooterAndCTA.jsx` | `<FinalCTA />`, `<LandingFooter />` | Closing CTA panel + 4-column link footer with status indicator. |

## Conventions used

- All components are global-scoped (`window.<name>`) because the demo loads them as separate Babel scripts.
- Icons come from `../_shared/icons.jsx` (`NrturIcons.<name>`). Stroke 2, currentColor — color via parent.
- Logo comes from `../_shared/Logo.jsx` (`<NrturLogo size withWordmark radius />`).
- Tokens come from `../../colors_and_type.css`. No Tailwind — all styles are inline or use the utility classes exposed by the CSS (`btn-primary`, `btn-secondary`, `glass-card`, `eyebrow`, `gradient-text`, `gradient-text-brand`, `fade-up`, `float`, `glow-pulse`, `noise-overlay`, `orb`).

## Known gaps vs. source repo

- **Mobile menu** in Navbar omitted — desktop only. The hamburger and drawer exist in `src/components/Navbar.tsx` if you need them.
- **FAQ section** and **Team section** and **TrustedBy** marquee from the source are not recreated here. The pattern is captured in `src/components/{FAQ,Team,TrustedBy}.tsx`; copy from there as needed.
- **`reveal` on-scroll animation** is replaced with `fade-up` CSS for the hero. The source uses an IntersectionObserver hook (`useScrollReveal`) — see `src/hooks/useScrollReveal.ts` if you want true on-enter reveals.
