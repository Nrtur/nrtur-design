// ─── pages-auth.jsx ── Landing, SignUp, SignIn, ForgotPassword, Onboarding ────

// ── Landing ───────────────────────────────────────────────────────────────────
function LandingPage({ goTo }) {
  const FEATURES = [
    { icon: I.Users,     title:'Contact management', desc:'Keep every lead, prospect, and customer organized in one searchable, filterable view.' },
    { icon: I.GitBranch, title:'Sales pipeline',     desc:'Visualize your deals. Drag cards between stages and watch your forecast update live.' },
    { icon: I.Zap,       title:'Automations',        desc:'Set up welcome sequences, follow-ups, and reminders — once, then let them run.' },
    { icon: I.Mail,      title:'Email sync',         desc:'Connect Gmail or Outlook and see every thread alongside the contact it belongs to.' },
    { icon: I.BarChart,  title:'Reports',            desc:'Revenue over time, win rate, team activity. Every chart you actually need.' },
    { icon: I.Users,     title:'Team collaboration', desc:'Assign deals, share notes, and see who worked what — without a meeting.' },
  ];
  const PRICING = [
    { name:'Starter', price:'Free', sub:'Up to 2 users', features:['500 contacts','1 pipeline','Basic automations','Email support'], cta:'Get started free', highlight:false },
    { name:'Pro',     price:'$59',  sub:'/user / month', features:['25,000 contacts','Unlimited pipelines','Advanced automations','Priority support','Reports & analytics'], cta:'Start free trial', highlight:true },
    { name:'Business',price:'$149', sub:'/user / month', features:['Unlimited contacts','Custom fields','White-label reports','Dedicated CSM','SLA & SSO'], cta:'Talk to sales', highlight:false },
  ];
  const TESTIMONIALS = [
    { name:'Mateo Reyes', role:'CEO, Bloom Creative', quote:'We replaced HubSpot with nrtur and cut our CRM spend by 70%. The pipeline view is exactly what our team needed.', avatar:'MR', color:'#8b5cf6' },
    { name:'Priya Nair',  role:'Head of Sales, Vertex', quote:'Automations alone save us 4 hours a week. The welcome sequence books more calls than our old SDR setup.', avatar:'PN', color:'#ec4899' },
    { name:'Luca Bianchi',role:'Founder, Forge & Co',   quote:'The clean UI means my team actually uses it. No six-week training. Open on Monday, selling by Friday.', avatar:'LB', color:'#10b981' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto scroll-area" style={{background:'#07070f'}}>
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/[0.05] px-8 py-4 flex items-center justify-between" style={{background:'rgba(7,7,15,0.85)',backdropFilter:'blur(16px)'}}>
        <div className="flex items-center gap-8">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-brand shrink-0">
            <img src="assets/nrtur-mark.svg" width="32" height="32" alt="nrtur"/>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[13px] text-white/65 hover:text-white transition-colors">Features</a>
            <a href="#pricing"  className="text-[13px] text-white/65 hover:text-white transition-colors">Pricing</a>
            <a href="#faq"      className="text-[13px] text-white/65 hover:text-white transition-colors">FAQ</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>goTo('signin')} className="text-[13px] font-medium text-white/65 hover:text-white transition-colors">Sign in</button>
          <button onClick={()=>goTo('signup')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">
            <I.Plus size={13} stroke={2.4}/>Start free trial
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto w-full text-center">
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{width:800,height:800,background:'rgba(99,102,241,0.12)',filter:'blur(180px)',top:-320,left:'50%',transform:'translateX(-50%)'}}/>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-[11px] font-semibold ring-1 ring-brand-500/25 mb-6">
          <I.Sparkles size={11} stroke={2}/>Now in public beta
        </span>
        <h1 className="text-[60px] font-black text-white leading-[1.05] tracking-tight mb-6" style={{textWrap:'balance'}}>
          The CRM built<br/>for modern sales
        </h1>
        <p className="text-[18px] text-white/65 leading-relaxed mb-10 max-w-xl mx-auto">
          Manage leads, automate follow-ups, and close more deals—without the complexity of enterprise software.
        </p>
        <div className="flex items-center justify-center gap-4 mb-16">
          <button onClick={()=>goTo('signup')} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand-lg hover:-translate-y-0.5 transition-all">
            Start free trial<I.ArrowRight size={14} stroke={2.4}/>
          </button>
          <button onClick={()=>goTo('dashboard')} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-medium text-white/75 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.18] transition-all">
            <I.Eye size={14}/>Watch demo
          </button>
        </div>
        {/* Mini dashboard preview */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_40px_120px_rgba(0,0,0,0.8)]" style={{background:'#09091a'}}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
            {['#ef4444','#fbbf24','#34d399'].map((c,i)=><span key={i} className="w-3 h-3 rounded-full" style={{background:c}}/>)}
            <div className="flex-1 mx-4 h-5 rounded-md bg-white/[0.04] border border-white/[0.06]"/>
          </div>
          <div className="grid grid-cols-4 gap-4 p-6">
            {[['Revenue','$134k','+31%','#34d399'],['Deals','107','+18%','#818cf8'],['Win Rate','68%','-2%','#fbbf24'],['Avg Cycle','14d','-3d','#34d399']].map(([l,v,d,dc])=>(
              <div key={l} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                <p className="text-[10px] text-white/45 uppercase tracking-[0.14em] font-semibold">{l}</p>
                <p className="text-white text-[22px] font-black mt-1">{v}</p>
                <span className="text-[10px] font-semibold" style={{color:dc}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[12px] text-white/35 mt-4">No credit card required · Free 14-day trial · Cancel anytime</p>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold text-brand-300 uppercase tracking-[0.18em] mb-3">Platform</p>
          <h2 className="text-[38px] font-black text-white leading-tight">Everything your team needs</h2>
          <p className="text-white/55 mt-3 max-w-lg mx-auto">A CRM that fits your workflow, not the other way around.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f=>(
            <div key={f.title} className="rounded-2xl bg-white/[0.025] border border-white/[0.05] p-6 hover:border-brand-500/25 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25 flex items-center justify-center mb-4">
                <f.icon size={17} stroke={2}/>
              </div>
              <p className="text-[15px] font-bold text-white mb-2">{f.title}</p>
              <p className="text-[13px] text-white/55 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold text-brand-300 uppercase tracking-[0.18em] mb-3">Pricing</p>
          <h2 className="text-[38px] font-black text-white leading-tight">Simple, transparent pricing</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING.map(p=>(
            <div key={p.name} className={['rounded-2xl border p-6 relative',
              p.highlight ? 'bg-brand-500/[0.06] border-brand-500/35 shadow-brand' : 'bg-white/[0.025] border-white/[0.06]'].join(' ')}>
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-white text-[10px] font-bold uppercase tracking-[0.14em]">Most popular</span>}
              <p className="text-[13px] font-semibold text-white/70 mb-2">{p.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-[36px] font-black text-white">{p.price}</p>
                {p.price!=='Free' && <span className="text-white/45 text-[13px]">{p.sub}</span>}
              </div>
              {p.price==='Free' && <p className="text-white/45 text-[12px] mb-4">{p.sub}</p>}
              <div className="flex flex-col gap-2 mb-6 mt-4">
                {p.features.map(f=>(
                  <div key={f} className="flex items-center gap-2 text-[13px] text-white/75">
                    <span className="w-4 h-4 rounded-full bg-brand-500/15 text-brand-300 flex items-center justify-center shrink-0"><I.Check size={9} stroke={3}/></span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={()=>goTo('signup')}
                className={['w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all',
                  p.highlight ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-brand' : 'bg-white/[0.05] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08]'].join(' ')}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-8 py-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t=>(
            <div key={t.name} className="rounded-2xl bg-white/[0.025] border border-white/[0.05] p-6">
              <I.Star size={14} className="text-amber-400 mb-4" fill="#fbbf24"/>
              <p className="text-[14px] text-white/80 leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{background:t.color}}>{t.avatar}</div>
                <div><p className="text-[13px] font-semibold text-white">{t.name}</p><p className="text-[11px] text-white/45">{t.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FinalCTA */}
      <section className="px-8 py-16 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl bg-brand-500/[0.06] border border-brand-500/25 p-10 text-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full" style={{width:500,height:500,background:'rgba(99,102,241,0.15)',filter:'blur(120px)',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>
          </div>
          <h2 className="text-[36px] font-black text-white mb-4 relative">Ready to start selling smarter?</h2>
          <p className="text-white/65 mb-8 max-w-md mx-auto relative">Join 1,200+ teams already using nrtur. Set up in minutes.</p>
          <button onClick={()=>goTo('signup')} className="relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand-lg hover:-translate-y-0.5 transition-all">
            Start for free<I.ArrowRight size={15} stroke={2.4}/>
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Sign Up ───────────────────────────────────────────────────────────────────
function SignUpPage({ goTo }) {
  return (
    <div className="h-full flex items-center justify-center" style={{background:'#07070f'}}>
      <GlowBg/>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/[0.06] backdrop-blur-md p-8" style={{background:'rgba(9,9,26,0.85)'}}>
          <button onClick={()=>goTo('landing')} className="inline-flex items-center gap-1.5 text-[12px] text-white/45 hover:text-white mb-6 transition-colors">
            <I.ChevronLeft size={12}/> nrtur
          </button>
          <h1 className="text-white text-[28px] font-black mb-2">Create account</h1>
          <p className="text-white/55 text-[13px] mb-7">Join 1,200+ teams already selling with nrtur.</p>
          <div className="flex flex-col gap-3 mb-5">
            <button className="w-full px-4 py-2.5 rounded-xl border border-white/[0.10] text-[13px] font-medium text-white/75 hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16"><text y="13" fontSize="11" fontFamily="sans-serif">G</text></svg>
              Continue with Google
            </button>
            <button className="w-full px-4 py-2.5 rounded-xl border border-white/[0.10] text-[13px] font-medium text-white/75 hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16"><text y="13" fontSize="11" fontFamily="sans-serif" fill="#4285f4">M</text></svg>
              Continue with Microsoft
            </button>
          </div>
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]"/></div>
            <div className="relative flex justify-center"><span className="px-2 text-[11px] text-white/35" style={{background:'#09091a'}}>or continue with email</span></div>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First name" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
              <input type="text" placeholder="Last name" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
            </div>
            <input type="email" placeholder="Work email" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
            <input type="password" placeholder="Password (min 8 chars)" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
          </div>
          <button onClick={()=>goTo('onboarding-1')}
            className="w-full py-3 rounded-xl text-[14px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all mb-4">
            Create account
          </button>
          <p className="text-[12px] text-white/45 text-center">
            Already have an account? <button onClick={()=>goTo('signin')} className="text-brand-300 hover:text-brand-200">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sign In ───────────────────────────────────────────────────────────────────
function SignInPage({ goTo }) {
  return (
    <div className="h-full flex items-center justify-center" style={{background:'#07070f'}}>
      <GlowBg/>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/[0.06] backdrop-blur-md p-8" style={{background:'rgba(9,9,26,0.85)'}}>
          <button onClick={()=>goTo('landing')} className="inline-flex items-center gap-1.5 text-[12px] text-white/45 hover:text-white mb-6 transition-colors">
            <I.ChevronLeft size={12}/> nrtur
          </button>
          <h1 className="text-white text-[28px] font-black mb-2">Welcome back</h1>
          <p className="text-white/55 text-[13px] mb-7">Sign in to your workspace.</p>
          <div className="flex flex-col gap-3 mb-5">
            <button className="w-full px-4 py-2.5 rounded-xl border border-white/[0.10] text-[13px] font-medium text-white/75 hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16"><text y="13" fontSize="11" fontFamily="sans-serif">G</text></svg>
              Sign in with Google
            </button>
            <button className="w-full px-4 py-2.5 rounded-xl border border-white/[0.10] text-[13px] font-medium text-white/75 hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16"><text y="13" fontSize="11" fontFamily="sans-serif" fill="#4285f4">M</text></svg>
              Sign in with Microsoft
            </button>
          </div>
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]"/></div>
            <div className="relative flex justify-center"><span className="px-2 text-[11px] text-white/35" style={{background:'#09091a'}}>or</span></div>
          </div>
          <div className="flex flex-col gap-3 mb-2">
            <input type="email" placeholder="Work email" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
            <input type="password" placeholder="Password" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
          </div>
          <div className="text-right mb-6">
            <button onClick={()=>goTo('forgot-password')} className="text-[12px] text-white/45 hover:text-brand-300 transition-colors">Forgot password?</button>
          </div>
          <button onClick={()=>goTo('dashboard')}
            className="w-full py-3 rounded-xl text-[14px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all mb-4">
            Sign in
          </button>
          <p className="text-[12px] text-white/45 text-center">
            Don't have an account? <button onClick={()=>goTo('signup')} className="text-brand-300 hover:text-brand-200">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Forgot Password ───────────────────────────────────────────────────────────
function ForgotPasswordPage({ goTo }) {
  const [sent, setSent] = React.useState(false);
  return (
    <div className="h-full flex items-center justify-center" style={{background:'#07070f'}}>
      <GlowBg/>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/[0.06] backdrop-blur-md p-8" style={{background:'rgba(9,9,26,0.85)'}}>
          <button onClick={()=>goTo('signin')} className="inline-flex items-center gap-1.5 text-[12px] text-white/45 hover:text-white mb-6 transition-colors">
            <I.ChevronLeft size={12}/> Back to sign in
          </button>
          {!sent ? (
            <>
              <h1 className="text-white text-[24px] font-black mb-2">Reset your password</h1>
              <p className="text-white/55 text-[13px] mb-7">Enter your work email and we'll send you a reset link.</p>
              <input type="email" placeholder="Work email" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40 mb-4"/>
              <button onClick={()=>{setSent(true);setTimeout(()=>goTo('signin'),2000);}}
                className="w-full py-3 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">
                Send reset link
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center mx-auto mb-4 ring-1 ring-emerald-500/25"><I.Check size={20} stroke={2.5}/></div>
              <p className="text-white text-[18px] font-bold">Check your email</p>
              <p className="text-white/55 text-[13px] mt-2">Reset link sent. Redirecting to sign in…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Onboarding (steps 1-4) ────────────────────────────────────────────────────
function OnboardingPage({ step, goTo }) {
  const steps = [
    { n:1, title:"Set up your workspace", desc:"Tell us about your company so we can personalize nrtur for your team.",
      prev:null, next:'onboarding-2',
      fields: <>
        <input type="text" placeholder="Company name" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
        <select className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white/70 outline-none focus:border-brand-500/40 appearance-none">
          <option>What best describes your company?</option>
          <option>Agency / Consulting</option>
          <option>SaaS / Software</option>
          <option>E-commerce / Retail</option>
          <option>Other</option>
        </select>
        <select className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white/70 outline-none focus:border-brand-500/40 appearance-none">
          <option>Team size</option>
          <option>Just me</option>
          <option>2–10</option>
          <option>11–50</option>
          <option>51+</option>
        </select>
      </>
    },
    { n:2, title:"Invite your team", desc:"Add teammates now or later. Everyone gets a 14-day free trial.",
      prev:'onboarding-1', next:'onboarding-3',
      fields: <>
        <input type="email" placeholder="Email address" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
        <input type="email" placeholder="Another teammate (optional)" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
        <button className="inline-flex items-center gap-2 text-[13px] text-brand-300 hover:text-brand-200">
          <I.Plus size={14} stroke={2.4}/> Add another
        </button>
      </>
    },
    { n:3, title:"Import your contacts", desc:"Bring your existing contacts from a CSV, or start fresh.",
      prev:'onboarding-2', next:'onboarding-4',
      fields: <>
        <div className="p-6 rounded-xl border border-dashed border-white/[0.14] hover:border-brand-500/35 transition-colors text-center cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25 flex items-center justify-center mx-auto mb-3"><I.Upload size={16}/></div>
          <p className="text-[13px] font-semibold text-white">Drag CSV file here</p>
          <p className="text-[11px] text-white/40 mt-1">or click to browse — max 10,000 rows</p>
        </div>
        <button className="w-full py-2.5 rounded-xl text-[13px] text-white/55 hover:text-white border border-white/[0.08] hover:border-white/[0.18] transition-all">
          Skip — I'll add contacts manually
        </button>
      </>
    },
    { n:4, title:"You're all set!", desc:"nrtur is ready to go. Start adding contacts and building your pipeline.",
      prev:'onboarding-3', next:'dashboard',
      fields: <>
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25 flex items-center justify-center mx-auto mb-4">
            <I.Sparkles size={22} stroke={2}/>
          </div>
          <p className="text-[16px] font-bold text-white">Welcome to nrtur 🎉</p>
          <p className="text-[13px] text-white/55 mt-2 leading-relaxed">Your workspace is ready. Head to the dashboard to get started.</p>
          <div className="mt-5 flex flex-col gap-2 text-left">
            {['Import contacts','Set up your first pipeline','Create an automation','Connect your email'].map((s,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-brand-500/15 text-brand-300 shrink-0"><I.Check size={10} stroke={3}/></span>
                <span className="text-[12px] text-white/65">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    },
  ];
  const curr = steps[step-1];

  return (
    <div className="h-full flex items-center justify-center" style={{background:'#07070f'}}>
      <GlowBg/>
      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {steps.map(s=>(
            <div key={s.n} className="flex items-center gap-2">
              <div className={['w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all',
                s.n < step ? 'bg-brand-500 text-white' :
                s.n === step ? 'bg-brand-500 text-white ring-4 ring-brand-500/20' :
                'bg-white/[0.06] text-white/35'].join(' ')}>
                {s.n < step ? <I.Check size={12} stroke={2.5}/> : s.n}
              </div>
              {s.n < 4 && <div className={['w-12 h-px transition-all', s.n < step ? 'bg-brand-500' : 'bg-white/[0.08]'].join(' ')}/>}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] backdrop-blur-md p-8" style={{background:'rgba(9,9,26,0.85)'}}>
          <p className="text-[11px] font-semibold text-brand-300 uppercase tracking-[0.18em] mb-3">Step {step} of 4</p>
          <h1 className="text-white text-[26px] font-black mb-2">{curr.title}</h1>
          <p className="text-white/55 text-[13px] mb-7">{curr.desc}</p>
          <div className="flex flex-col gap-3 mb-7">{curr.fields}</div>

          <div className="flex gap-3">
            {curr.prev && (
              <button onClick={()=>goTo(curr.prev)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] transition-all">
                Back
              </button>
            )}
            <button onClick={()=>goTo(curr.next)}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">
              {step===4 ? 'Go to dashboard' : 'Continue'}
            </button>
          </div>
          <div className="text-center mt-4">
            <button onClick={()=>goTo('dashboard')} className="text-[11px] text-white/35 hover:text-white/60 transition-colors">Skip setup →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingPage, SignUpPage, SignInPage, ForgotPasswordPage, OnboardingPage });
