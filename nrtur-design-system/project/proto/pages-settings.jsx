// ─── pages-settings.jsx ── Settings (all tabs) + Profile ─────────────────────

// ── Shared settings shell ──────────────────────────────────────────────────────
function SettingsShell({ active, goTo, children }) {
  return (
    <div className="h-full flex" style={{background:'#07070f'}}>
      <AppSidebar active={active} goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Settings" subtitle="Workspace · Bloom Creative"/>
        <SettingsSubNav active={active} goTo={goTo}/>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1100px] mx-auto flex flex-col gap-5">
            {children}
          </div>
        </div>
        <AppFooter note="Plan changes take effect at the next billing cycle"/>
      </div>
    </div>
  );
}

// ── Billing ────────────────────────────────────────────────────────────────────
function SettingsBillingPage({ goTo }) {
  const [inviteModal, setInviteModal] = React.useState(false);
  const [addedEmail, setAddedEmail] = React.useState(false);
  const [addedWhitelabel, setAddedWhitelabel] = React.useState(false);

  const INVOICES = [
    {date:'May 1, 2026', amount:'$177.00', users:3, id:'INV-2026-005'},
    {date:'Apr 1, 2026', amount:'$177.00', users:3, id:'INV-2026-004'},
    {date:'Mar 1, 2026', amount:'$118.00', users:2, id:'INV-2026-003'},
    {date:'Feb 1, 2026', amount:'$118.00', users:2, id:'INV-2026-002'},
    {date:'Jan 1, 2026', amount:'$118.00', users:2, id:'INV-2026-001'},
  ];

  const ICOL='1.2fr 110px 1fr 120px 130px';

  return (
    <SettingsShell active="settings-billing" goTo={goTo}>
      {/* Current plan */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-6">
        <div className="absolute -top-32 -right-20 w-80 h-80 rounded-full pointer-events-none" style={{background:'rgba(99,102,241,0.18)',filter:'blur(120px)'}}/>
        <div className="relative">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Current Plan</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30"><I.Sparkles size={11} stroke={2}/>Pro</span>
              </div>
              <div className="flex items-baseline gap-3 mb-3">
                <p className="text-white text-[36px] font-black leading-none tabular-nums">$59</p>
                <p className="text-white/55 text-[13px]">/user / month</p>
              </div>
              <p className="text-[13px] text-white/65 mb-4">3 users × $59 = <span className="text-white font-semibold">$177</span> / month</p>
              <div className="flex items-center gap-2 text-[12px] text-white/55">
                <I.Calendar size={13} className="text-white/40"/>Next billing on <span className="text-white/85 font-medium">June 1, 2026</span>
                <span className="text-white/25 mx-1">·</span>
                <I.ShieldCheck size={13} className="text-emerald-400"/><span className="text-emerald-300">Auto-renews</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="#" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-300 hover:text-brand-200">Upgrade to Business<I.ArrowRight size={12} stroke={2.4}/></a>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all">Manage plan<I.ArrowRight size={13} stroke={2.4}/></button>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-white/[0.05] grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Up to 5 users','25,000 contacts','Unlimited pipelines','Advanced automations'].map(f=>(
              <div key={f} className="flex items-center gap-2 text-[12px] text-white/65">
                <span className="w-4 h-4 rounded-full bg-brand-500/15 text-brand-300 flex items-center justify-center shrink-0"><I.Check size={9} stroke={3}/></span>{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage + payment */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5">
        {/* Usage */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] mb-1">Usage This Month</p>
          <p className="text-white/45 text-[12px] mb-5">May 1 — June 1 · resets monthly</p>
          {[
            {label:'Contacts',       used:1284, total:5000, meta:'138 added this month'},
            {label:'Automations',    used:3,    total:10,   meta:'7 more templates available'},
            {label:'Email accounts', used:2,    total:3,    meta:'Add another inbox for $5/mo'},
          ].map(u=>{
            const pct=Math.round((u.used/u.total)*100);
            const high=pct>=80,mid=pct>=60&&pct<80;
            const color=high?'#fbbf24':mid?'#a5b4fc':'#818cf8';
            return (
              <div key={u.label} className="mb-5 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-white">{u.label}</span>
                  <span className="text-[12px] tabular-nums"><span className="text-white font-bold">{u.used.toLocaleString()}</span><span className="text-white/45"> / {u.total.toLocaleString()}</span><span className={['ml-2 font-medium', high?'text-amber-300':mid?'text-brand-300':'text-white/55'].join(' ')}>{pct}%</span></span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden"><div className="h-full rounded-full" style={{width:`${pct}%`,background:`linear-gradient(to right,${color},${color}cc)`,boxShadow:`0 0 12px ${color}55`}}/></div>
                <p className="text-[11px] text-white/40 mt-1.5">{u.meta}</p>
              </div>
            );
          })}
        </div>

        {/* Payment method */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Payment Method</p>
            <button className="text-[12px] text-brand-300 hover:text-brand-200 transition-colors">Update card</button>
          </div>
          <div className="relative rounded-xl p-5 overflow-hidden" style={{background:'linear-gradient(135deg,#1e1b4b 0%,#0c0c1a 100%)',boxShadow:'0 0 0 1px rgba(255,255,255,0.04),0 20px 50px rgba(0,0,0,0.5)'}}>
            <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full pointer-events-none" style={{background:'rgba(99,102,241,0.35)',filter:'blur(50px)'}}/>
            <div className="relative">
              <div className="flex items-start justify-between mb-12">
                <div className="w-10 h-7 rounded-md" style={{background:'linear-gradient(135deg,#fde047,#f59e0b)'}}/>
                <svg width="42" height="14" viewBox="0 0 42 14"><text y="12" fontSize="14" fontFamily="Inter,system-ui" fontWeight="900" fontStyle="italic" letterSpacing="-0.5" fill="#fff">VISA</text></svg>
              </div>
              <p className="font-mono text-white text-[15px] tracking-[0.18em] mb-5"><span className="text-white/45">•••• •••• ••••</span> 4242</p>
              <div className="flex items-end justify-between">
                <div><p className="text-[9px] uppercase tracking-[0.14em] text-white/40">Cardholder</p><p className="text-[12px] font-medium text-white/90 mt-0.5">Alex Morgan</p></div>
                <div><p className="text-[9px] uppercase tracking-[0.14em] text-white/40">Expires</p><p className="text-[12px] font-medium text-white/90 mt-0.5 tabular-nums">09 / 27</p></div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2">
            <I.ShieldCheck size={13} stroke={2.2} className="text-emerald-400 mt-0.5 shrink-0"/>
            <p className="text-[11px] text-white/45 leading-relaxed">Secured by Stripe. Card details are never stored on our servers.</p>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] mb-1">Add-ons</p>
        <p className="text-white/45 text-[12px] mb-5">Stack on top of your Pro plan. Cancel anytime.</p>
        {[
          {Icon:I.Mail,  name:'Extra email sync account', price:'$5/mo',  desc:'Connect an additional Gmail or Outlook inbox.', added:addedEmail, setAdded:setAddedEmail},
          {Icon:I.BarChart,name:'White-label reports',   price:'$15/mo', desc:'Replace the nrtur logo with your brand on shared reports.', added:addedWhitelabel, setAdded:setAddedWhitelabel},
        ].map(a=>(
          <div key={a.name} className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.04] last:border-b-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25 flex items-center justify-center shrink-0"><a.Icon size={14}/></div>
              <div>
                <div className="flex items-baseline gap-3 flex-wrap"><p className="text-[14px] font-semibold text-white">{a.name}</p><span className="text-[12px] font-mono text-brand-300 tabular-nums">{a.price}</span></div>
                <p className="text-[12px] text-white/55 mt-0.5">{a.desc}</p>
              </div>
            </div>
            {a.added ? (
              <button onClick={()=>a.setAdded(false)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-emerald-300 bg-emerald-500/12 ring-1 ring-emerald-500/25 hover:bg-emerald-500/18 transition-all"><I.Check size={12} stroke={2.6}/>Added</button>
            ) : (
              <button onClick={()=>a.setAdded(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-white/[0.20] transition-all"><I.Plus size={12} stroke={2.4}/>Add</button>
            )}
          </div>
        ))}
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <div><p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Invoice History</p><p className="text-white/45 text-[12px] mt-1">Past 12 months</p></div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white/65 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] transition-all"><I.Download size={12}/>Download all</button>
        </div>
        <div className="grid items-center gap-4 px-6 py-3 border-b border-white/[0.05] bg-white/[0.015] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
             style={{gridTemplateColumns:ICOL}}>
          <span>Date</span><span>Amount</span><span>Invoice</span><span>Status</span><span className="text-right">Download</span>
        </div>
        {INVOICES.map((inv,i)=>(
          <div key={inv.id} className={['grid items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors',i<INVOICES.length-1?'border-b border-white/[0.03]':''].join(' ')}
               style={{gridTemplateColumns:ICOL}}>
            <div><p className="text-[13px] font-medium text-white">{inv.date}</p><p className="text-[11px] text-white/45 mt-0.5">{inv.users} users</p></div>
            <p className="text-[13px] font-bold text-white tabular-nums">{inv.amount}</p>
            <p className="text-[12px] font-mono text-white/60">{inv.id}</p>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-500/25 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Paid</span>
            <div className="flex items-center justify-end"><button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-brand-300 hover:text-brand-200 hover:bg-brand-500/10 transition-all"><I.Download size={12} stroke={2.2}/>PDF</button></div>
          </div>
        ))}
      </div>
    </SettingsShell>
  );
}

// ── Team ───────────────────────────────────────────────────────────────────────
function SettingsTeamPage({ goTo }) {
  const [inviteModal, setInviteModal] = React.useState(false);
  const { confirmNode, openConfirm } = useConfirm();
  const members = [
    {name:'Alex Morgan', email:'alex@bloom.co',  role:'Admin',  avatar:'AM', color:'#3b82f6', status:'Active'},
    {name:'Sarah Chen',  email:'sarah@bloom.co', role:'Member', avatar:'SC', color:'#8b5cf6', status:'Active'},
    {name:'Jamie Kim',   email:'jamie@bloom.co', role:'Member', avatar:'JK', color:'#10b981', status:'Active'},
    {name:'Ravi Lee',    email:'ravi@bloom.co',  role:'Member', avatar:'RL', color:'#f59e0b', status:'Active'},
    {name:'Marcus Rios', email:'marcus@bloom.co',role:'Member', avatar:'MR', color:'#ec4899', status:'Pending'},
  ];
  const COL='1.5fr 1.5fr 110px 110px 80px';
  return (
    <SettingsShell active="settings-team" goTo={goTo}>
      <div className="flex items-center justify-between">
        <div><p className="text-white text-[18px] font-bold">Team Members</p><p className="text-white/45 text-[13px] mt-1">5 of 5 seats used · Pro plan</p></div>
        <button onClick={()=>setInviteModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all"><I.Plus size={14} stroke={2.4}/>Invite member</button>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="grid items-center gap-4 px-6 py-3 border-b border-white/[0.05] bg-white/[0.015] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
             style={{gridTemplateColumns:COL}}>
          <span>Member</span><span>Email</span><span>Role</span><span>Status</span><span/>
        </div>
        {members.map((m,i)=>(
          <div key={m.email} className={['grid items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors',i<members.length-1?'border-b border-white/[0.03]':''].join(' ')}
               style={{gridTemplateColumns:COL}}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:m.color}}>{m.avatar}</div>
              <p className="text-[13px] font-semibold text-white truncate">{m.name}</p>
            </div>
            <p className="text-[12px] text-white/55 truncate">{m.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25 w-fit">{m.role}</span>
            <span className={['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 w-fit',m.status==='Active'?'bg-emerald-500/12 text-emerald-300 ring-emerald-500/25':'bg-amber-500/12 text-amber-300 ring-amber-500/25'].join(' ')}>
              <span className={['w-1.5 h-1.5 rounded-full',m.status==='Active'?'bg-emerald-400':'bg-amber-400'].join(' ')}/>
              {m.status}
            </span>
            <button
              onClick={() => openConfirm({
                title: `Remove ${m.name}?`,
                body: 'They will lose access immediately. You can re-invite them at any time.',
                confirmLabel: 'Remove',
                danger: true,
              })}
              className="text-white/40 hover:text-red-400 transition-colors ml-auto">
              <I.Trash size={13}/>
            </button>
          </div>
        ))}
      </div>
      {confirmNode}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}}>
          <div className="w-full max-w-md rounded-2xl border border-white/[0.10] p-7" style={{background:'#0d0d1a'}}>
            <div className="flex items-center justify-between mb-5"><p className="text-white text-[18px] font-bold">Invite teammate</p><button onClick={()=>setInviteModal(false)} className="text-white/45 hover:text-white"><I.X size={16}/></button></div>
            <input type="email" placeholder="Email address" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40 mb-3"/>
            <select className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white/70 outline-none focus:border-brand-500/40 appearance-none mb-5">
              <option>Member</option><option>Admin</option>
            </select>
            <div className="flex gap-3">
              <button onClick={()=>setInviteModal(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
              <button onClick={()=>setInviteModal(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Send invite</button>
            </div>
          </div>
        </div>
      )}
      )}
    </SettingsShell>
  );
}

// ── General ────────────────────────────────────────────────────────────────────
function SettingsGeneralPage({ goTo }) {
  const { confirmNode, openConfirm } = useConfirm();
  return (
    <SettingsShell active="settings-general" goTo={goTo}>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-white text-[18px] font-bold mb-6">Workspace settings</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {[['Workspace name','Bloom Creative'],['Industry','Agency / Consulting'],['Timezone','America/Los_Angeles'],['Currency','USD ($)']].map(([l,v])=>(
            <div key={l}><label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{l}</label>
              <input type="text" defaultValue={v} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40"/>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Save changes</button>
        </div>
      </div>
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
        <p className="text-red-300 font-semibold mb-1">Danger zone</p>
        <p className="text-white/45 text-[12px] mb-4">Once you delete the workspace, there's no going back.</p>
        <button
          onClick={() => openConfirm({
            title: 'Delete this workspace?',
            body: 'All contacts, deals, and automations will be permanently removed. This cannot be undone.',
            confirmLabel: 'Delete workspace',
            danger: true,
          })}
          className="px-4 py-2 rounded-xl text-[13px] font-medium text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 transition-all">
          Delete workspace
        </button>
      </div>
      {confirmNode}
    </SettingsShell>
  );
}

// ── Twilio Setup Modal ────────────────────────────────────────────────────────
function TwilioSetupModal({ close }) {
  const [step, setStep] = React.useState(1);
  const [sid,  setSid]  = React.useState('');
  const [tok,  setTok]  = React.useState('');
  const [num,  setNum]  = React.useState('');

  React.useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)'}}>
      <div style={{width:480, background:'rgba(13,13,26,0.97)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(24px)', boxShadow:'0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.65)', padding:24}}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-[15px]" style={{background:'#e13128',border:'1px solid rgba(225,49,40,0.3)'}}>T</div>
            <div>
              <p className="text-white text-[15px] font-bold">Connect Twilio</p>
              <p className="text-white/45 text-[12px]">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={close} className="text-white/40 hover:text-white transition-colors"><I.X size={16}/></button>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5 mb-6 mt-4">
          {[1,2,3].map(s=>(
            <div key={s} className={['flex-1 h-1 rounded-full transition-all', s<=step?'bg-brand-500':'bg-white/[0.08]'].join(' ')}/>
          ))}
        </div>
        {step===1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-white/65 leading-relaxed">Enter your Twilio Account SID and Auth Token from the <a href="#" className="text-brand-300 hover:text-brand-200">Twilio Console</a>.</p>
            {[{l:'Account SID',v:sid,set:setSid,ph:'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'},
              {l:'Auth Token', v:tok,set:setTok,ph:'••••••••••••••••••••••••••••••••'}].map(f=>(
              <div key={f.l}>
                <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{f.l}</label>
                <input value={f.v} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white font-mono outline-none focus:border-brand-500/40 placeholder:text-white/20"/>
              </div>
            ))}
          </div>
        )}
        {step===2 && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-white/65 leading-relaxed">Enter your Twilio phone number. This will be used to send and receive SMS messages.</p>
            <div>
              <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Twilio Phone Number</label>
              <input value={num} onChange={e=>setNum(e.target.value)} placeholder="+1 415 555 0100"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white font-mono outline-none focus:border-brand-500/40 placeholder:text-white/25"/>
            </div>
            <div className="rounded-xl bg-brand-500/08 border border-brand-500/20 p-3">
              <p className="text-[12px] text-brand-200">✓ Credentials verified. Number will be tested by sending a confirmation SMS.</p>
            </div>
          </div>
        )}
        {step===3 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-emerald-500/08 border border-emerald-500/20 p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center mx-auto mb-3"><I.Check size={20} stroke={2.5}/></div>
              <p className="text-white font-bold text-[15px]">Twilio connected!</p>
              <p className="text-white/55 text-[12px] mt-1">+1 415-555-0100 is ready to send and receive SMS.</p>
            </div>
            <p className="text-[12px] text-white/45 text-center">You can now use SMS Inbox and SMS Sequences from the sidebar.</p>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={close} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">
            {step===3?'Close':'Cancel'}
          </button>
          {step<3 && (
            <button onClick={()=>setStep(s=>s+1)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand border-none transition-all">
              {step===2?'Verify & Connect':'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Vonage Setup Modal ────────────────────────────────────────────────────────
function VonageSetupModal({ close }) {
  const [step, setStep] = React.useState(1);
  const [key,  setKey]  = React.useState('');
  const [sec,  setSec]  = React.useState('');
  const [num,  setNum]  = React.useState('');

  React.useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)'}}>
      <div style={{width:480, background:'rgba(13,13,26,0.97)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(24px)', boxShadow:'0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.65)', padding:24}}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-[15px]" style={{background:'#6a55fa',border:'1px solid rgba(106,85,250,0.3)'}}>V</div>
            <div>
              <p className="text-white text-[15px] font-bold">Connect Vonage</p>
              <p className="text-white/45 text-[12px]">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={close} className="text-white/40 hover:text-white transition-colors"><I.X size={16}/></button>
        </div>
        <div className="flex gap-1.5 mb-6 mt-4">
          {[1,2,3].map(s=>(
            <div key={s} className={['flex-1 h-1 rounded-full transition-all', s<=step?'bg-brand-500':'bg-white/[0.08]'].join(' ')}/>
          ))}
        </div>
        {step===1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-white/65 leading-relaxed">Enter your Vonage API Key and Secret from the <a href="#" className="text-brand-300 hover:text-brand-200">Vonage Dashboard</a>.</p>
            {[{l:'API Key',    v:key,set:setKey,ph:'a1b2c3d4'},
              {l:'API Secret', v:sec,set:setSec,ph:'••••••••••••••••'}].map(f=>(
              <div key={f.l}>
                <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{f.l}</label>
                <input value={f.v} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white font-mono outline-none focus:border-brand-500/40 placeholder:text-white/20"/>
              </div>
            ))}
          </div>
        )}
        {step===2 && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-white/65 leading-relaxed">Select your Vonage virtual number for SMS send/receive.</p>
            <div>
              <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Virtual Number</label>
              <input value={num} onChange={e=>setNum(e.target.value)} placeholder="+44 20 7946 0318"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white font-mono outline-none focus:border-brand-500/40 placeholder:text-white/25"/>
            </div>
          </div>
        )}
        {step===3 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-emerald-500/08 border border-emerald-500/20 p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center mx-auto mb-3"><I.Check size={20} stroke={2.5}/></div>
              <p className="text-white font-bold text-[15px]">Vonage connected!</p>
              <p className="text-white/55 text-[12px] mt-1">Your virtual number is ready.</p>
            </div>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={close} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">{step===3?'Close':'Cancel'}</button>
          {step<3 && (
            <button onClick={()=>setStep(s=>s+1)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand border-none transition-all">
              {step===2?'Verify & Connect':'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Integrations ───────────────────────────────────────────────────────────────
function SettingsIntegrationsPage({ goTo }) {
  const [connected, setConnected] = React.useState({gmail:true, slack:false, zapier:false, stripe:true, hubspot:false});
  const [twilioModal, setTwilioModal] = React.useState(false);
  const [vonageModal, setVonageModal] = React.useState(false);

  const INTEGRATIONS = [
    {key:'gmail',   name:'Gmail',    desc:'Sync your Gmail inbox to log emails against contacts.',   iconColor:'#ea4335'},
    {key:'slack',   name:'Slack',    desc:'Get deal alerts and assign tasks directly in Slack.',      iconColor:'#4a154b'},
    {key:'zapier',  name:'Zapier',   desc:'Connect nrtur to 3,000+ apps through Zapier.',            iconColor:'#ff4a00'},
    {key:'stripe',  name:'Stripe',   desc:'See Stripe payments alongside your CRM contacts.',        iconColor:'#635bff'},
    {key:'hubspot', name:'HubSpot',  desc:'One-way import contacts and companies from HubSpot.',     iconColor:'#ff7a59'},
  ];
  const SMS_PROVIDERS = [
    {key:'twilio', name:'Twilio',   desc:'Send and receive SMS via Twilio. Powers SMS Inbox and SMS Sequences.', iconColor:'#e13128', onConnect:()=>setTwilioModal(true)},
    {key:'vonage', name:'Vonage',   desc:'Send and receive SMS via Vonage (formerly Nexmo).',                    iconColor:'#6a55fa', onConnect:()=>setVonageModal(true)},
  ];

  return (
    <SettingsShell active="settings-integrations" goTo={goTo}>
      <div><p className="text-white text-[18px] font-bold">Integrations</p><p className="text-white/45 text-[13px] mt-1">Connect nrtur with your existing tools.</p></div>

      {/* Standard integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map(intg=>{
          const on=connected[intg.key];
          return (
            <div key={intg.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 hover:border-white/[0.10] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-[14px]" style={{background:intg.iconColor+'20',color:intg.iconColor,border:`1px solid ${intg.iconColor}30`}}>{intg.name.slice(0,1)}</div>
                <Toggle on={on} onChange={v=>setConnected({...connected,[intg.key]:v})}/>
              </div>
              <p className="text-[15px] font-bold text-white">{intg.name}</p>
              <p className="text-[12px] text-white/50 mt-1 leading-relaxed">{intg.desc}</p>
              {on && <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] text-emerald-300 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Connected</span>}
            </div>
          );
        })}
      </div>

      {/* SMS Providers */}
      <div>
        <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] mb-4">SMS Providers</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SMS_PROVIDERS.map(p=>(
            <div key={p.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 hover:border-white/[0.10] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-[14px]" style={{background:p.iconColor+'20',color:p.iconColor,border:`1px solid ${p.iconColor}30`}}>{p.name[0]}</div>
                <button onClick={p.onConnect}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-brand-300 bg-brand-500/10 border border-brand-500/25 hover:bg-brand-500/15 transition-all">
                  <I.Plug size={11}/>Connect
                </button>
              </div>
              <p className="text-[15px] font-bold text-white">{p.name}</p>
              <p className="text-[12px] text-white/50 mt-1 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {twilioModal && <TwilioSetupModal close={()=>setTwilioModal(false)}/>}
      {vonageModal && <VonageSetupModal close={()=>setVonageModal(false)}/>}
    </SettingsShell>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────────
function ProfilePage({ goTo }) {
  const [saved, setSaved] = React.useState(false);
  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false),3000); };

  return (
    <div className="h-full flex" style={{background:'#07070f'}}>
      <AppSidebar active="settings-billing" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Your Profile" subtitle="Manage your personal account settings"/>
        {saved && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-emerald-500/12 text-emerald-200 border border-emerald-500/25 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            <I.Check size={14} stroke={2.4}/>Changes saved
          </div>
        )}
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-2xl mx-auto flex flex-col gap-5">
            {/* Avatar */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[24px] font-bold ring-2 ring-white/[0.06]" style={{background:'#3b82f6'}}>AM</div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center ring-2 ring-[#0c0c1a]"><I.Edit size={11}/></button>
                </div>
                <div>
                  <p className="text-white text-[20px] font-bold">Alex Morgan</p>
                  <p className="text-white/55 text-[13px] mt-1">Manager · Bloom Creative</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[['First name','Alex'],['Last name','Morgan'],['Work email','alex@bloom.co'],['Phone','+1 415-555-0123'],['Job title','Sales Manager'],['Timezone','Pacific Time (PT)']].map(([l,v])=>(
                  <div key={l}><label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{l}</label>
                    <input type="text" defaultValue={v} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40"/>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Save changes</button>
              </div>
            </div>
            {/* Change password */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
              <p className="text-white font-semibold mb-4">Change password</p>
              <div className="flex flex-col gap-3 mb-5">
                {['Current password','New password','Confirm new password'].map(l=>(
                  <div key={l}><label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{l}</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40"/>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.10] hover:border-white/[0.20] transition-all">Update password</button>
            </div>
            {/* Sign out */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 flex items-center justify-between">
              <div><p className="text-white font-semibold">Sign out</p><p className="text-white/45 text-[12px] mt-1">Sign out of all devices.</p></div>
              <button onClick={()=>goTo('landing')} className="px-4 py-2 rounded-xl text-[13px] font-medium text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all">Sign out</button>
            </div>
          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

// ── Pipeline settings ──────────────────────────────────────────────────────────
function SettingsPipelinePage({ goTo }) {
  const { confirmNode, openConfirm } = useConfirm();
  const [stages, setStages] = React.useState([
    {id:1, name:'Prospecting', color:'#94a3b8', deals:8,  prob:10},
    {id:2, name:'Qualified',   color:'#818cf8', deals:5,  prob:30},
    {id:3, name:'Proposal',    color:'#a78bfa', deals:4,  prob:55},
    {id:4, name:'Negotiation', color:'#fbbf24', deals:3,  prob:75},
    {id:5, name:'Won',         color:'#34d399', deals:11, prob:100},
  ]);
  const [newStage, setNewStage] = React.useState('');

  const addStage = () => {
    if (!newStage.trim()) return;
    setStages(s => [...s, {id: Date.now(), name: newStage.trim(), color:'#818cf8', deals:0, prob:50}]);
    setNewStage('');
  };

  return (
    <SettingsShell active="settings-pipeline" goTo={goTo}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-[18px] font-bold">Pipeline Stages</p>
          <p className="text-white/45 text-[13px] mt-1">Drag to reorder · click to rename · set close probability per stage.</p>
        </div>
        <button onClick={()=>goTo('pipeline')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white/70 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">
          <I.Eye size={13}/>Preview pipeline
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="grid items-center gap-4 px-6 py-3 border-b border-white/[0.05] bg-white/[0.015] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
             style={{gridTemplateColumns:'32px 1fr 80px 100px 80px 40px'}}>
          <span/>
          <span>Stage name</span>
          <span>Deals</span>
          <span>Close prob.</span>
          <span>Color</span>
          <span/>
        </div>
        {stages.map((stage, i) => (
          <div key={stage.id}
               className={['grid items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors', i < stages.length-1 ? 'border-b border-white/[0.03]' : ''].join(' ')}
               style={{gridTemplateColumns:'32px 1fr 80px 100px 80px 40px'}}>
            <div className="text-white/25 cursor-grab hover:text-white/50 transition-colors"><I.Grip size={14}/></div>
            <input defaultValue={stage.name}
              className="bg-transparent text-[13px] font-semibold text-white outline-none border-b border-transparent focus:border-brand-500/40 pb-0.5 w-full max-w-[200px]"/>
            <span className="text-[13px] text-white/60 tabular-nums">{stage.deals}</span>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="100" defaultValue={stage.prob}
                className="w-16 accent-indigo-500" style={{accentColor:'#6366f1'}}/>
              <span className="text-[11px] text-white/50 tabular-nums w-8">{stage.prob}%</span>
            </div>
            <div className="w-5 h-5 rounded-full cursor-pointer ring-1 ring-white/10" style={{background:stage.color}}/>
            <button
              onClick={() => openConfirm({
                title: `Delete "${stage.name}" stage?`,
                body: `${stage.deals} deals in this stage will be moved to the previous stage.`,
                confirmLabel: 'Delete stage',
                danger: true,
                onConfirm: () => setStages(s => s.filter(x => x.id !== stage.id)),
              })}
              className="text-white/25 hover:text-red-400 transition-colors">
              <I.Trash size={13}/>
            </button>
          </div>
        ))}
        {/* Add stage row */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.01]">
          <input value={newStage} onChange={e => setNewStage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStage()}
            placeholder="New stage name…"
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40 max-w-xs"/>
          <button onClick={addStage}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-brand-300 bg-brand-500/10 border border-brand-500/25 hover:bg-brand-500/15 transition-all">
            <I.Plus size={13} stroke={2.4}/>Add stage
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-white font-semibold mb-1">Pipeline preferences</p>
        <p className="text-white/45 text-[12px] mb-5">Configure how deals flow through your pipeline.</p>
        <div className="flex flex-col gap-4">
          {[
            {label:'Auto-move stale deals', sub:'Move deals with no activity after 14 days to a review queue.'},
            {label:'Require close date on Proposal', sub:'Enforce a close date before a deal can enter the Proposal stage.'},
            {label:'Notify on stage change', sub:'Send Slack notification when a deal moves to Won or Lost.'},
          ].map(pref => (
            <div key={pref.label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-white">{pref.label}</p>
                <p className="text-[12px] text-white/45 mt-0.5">{pref.sub}</p>
              </div>
              <Toggle on={false} onChange={()=>{}}/>
            </div>
          ))}
        </div>
      </div>
      {confirmNode}
    </SettingsShell>
  );
}

// ── Unsubscribes settings ──────────────────────────────────────────────────────
function SettingsUnsubscribesPage({ goTo }) {
  const { confirmNode, openConfirm } = useConfirm();
  const [searchQ, setSearchQ] = React.useState('');
  const unsubs = [
    {email:'bounce@example.com',   reason:'Hard bounce',     date:'May 28, 2026', type:'bounce'},
    {email:'noreply@domain.co',    reason:'Manual opt-out',  date:'May 22, 2026', type:'manual'},
    {email:'spam@test.io',         reason:'Spam complaint',  date:'May 19, 2026', type:'complaint'},
    {email:'old@company.net',      reason:'Manual opt-out',  date:'May 14, 2026', type:'manual'},
    {email:'donotcontact@firm.co', reason:'GDPR request',    date:'May 10, 2026', type:'gdpr'},
    {email:'blocked@co.org',       reason:'Hard bounce',     date:'Apr 30, 2026', type:'bounce'},
  ];
  const typeChip = {
    bounce:    'bg-amber-500/12 text-amber-300 ring-amber-500/25',
    manual:    'bg-white/[0.06] text-white/55 ring-white/[0.10]',
    complaint: 'bg-red-500/12 text-red-300 ring-red-500/25',
    gdpr:      'bg-brand-500/12 text-brand-300 ring-brand-500/25',
  };
  const filtered = unsubs.filter(u =>
    !searchQ || u.email.toLowerCase().includes(searchQ.toLowerCase())
  );
  const COL = '1.6fr 140px 130px 110px 40px';
  return (
    <SettingsShell active="settings-unsubscribes" goTo={goTo}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-white text-[18px] font-bold">Unsubscribes &amp; Opt-outs</p>
          <p className="text-white/45 text-[13px] mt-1">{unsubs.length} contacts suppressed from all outbound email.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 focus-within:border-brand-500/40 transition-all">
            <I.Search size={12} className="text-white/40"/>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search emails…"
              className="bg-transparent outline-none text-[12px] text-white placeholder:text-white/30 w-40"/>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">
            <I.Download size={12}/>Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="grid items-center gap-4 px-6 py-3 border-b border-white/[0.05] bg-white/[0.015] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
             style={{gridTemplateColumns:COL}}>
          <span>Email address</span><span>Reason</span><span>Date</span><span>Type</span><span/>
        </div>
        {filtered.map((u, i) => (
          <div key={u.email}
               className={['grid items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors', i < filtered.length-1 ? 'border-b border-white/[0.03]' : ''].join(' ')}
               style={{gridTemplateColumns:COL}}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                <I.Ban size={12} className="text-white/30"/>
              </div>
              <p className="text-[12px] font-mono text-white/80 truncate">{u.email}</p>
            </div>
            <p className="text-[12px] text-white/55">{u.reason}</p>
            <p className="text-[12px] text-white/45">{u.date}</p>
            <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 w-fit capitalize', typeChip[u.type]].join(' ')}>
              {u.type}
            </span>
            <button
              onClick={() => openConfirm({
                title: 'Re-subscribe this contact?',
                body: `${u.email} will be removed from the suppression list and can receive emails again.`,
                confirmLabel: 'Re-subscribe',
                danger: false,
              })}
              className="text-white/25 hover:text-brand-300 transition-colors ml-auto" title="Re-subscribe">
              <I.Check size={13} stroke={2.2}/>
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-white font-semibold mb-1">Compliance preferences</p>
        <p className="text-white/45 text-[12px] mb-5">Control how unsubscribes are handled across your workspace.</p>
        <div className="flex flex-col gap-4">
          {[
            {label:'Global opt-out suppression',     sub:'Any contact who unsubscribes is suppressed from all sequences, not just the current one.', on:true},
            {label:'Honor GDPR deletion requests',   sub:'Contacts requesting erasure are anonymised within 30 days.',                               on:true},
            {label:'Include unsubscribe link',       sub:'Automatically append a one-click unsubscribe footer to all outbound emails.',               on:true},
          ].map(pref => (
            <div key={pref.label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-white">{pref.label}</p>
                <p className="text-[12px] text-white/45 mt-0.5">{pref.sub}</p>
              </div>
              <Toggle on={pref.on} onChange={()=>{}}/>
            </div>
          ))}
        </div>
      </div>
      {confirmNode}
    </SettingsShell>
  );
}

// ── Notifications settings ────────────────────────────────────────────────────
function SettingsNotificationsPage({ goTo }) {
  const CHANNELS = [
    {key:'sms_received',   label:'SMS received',          sub:'When a contact replies to an SMS'},
    {key:'email_opened',   label:'Email opened',           sub:'When a contact opens one of your emails'},
    {key:'deal_moved',     label:'Deal stage changed',     sub:'When any deal moves to a new stage'},
    {key:'deal_won',       label:'Deal marked Won',        sub:'When a deal is moved to Won'},
    {key:'contact_assigned',label:'Contact assigned to me',sub:'When a contact is assigned to you'},
    {key:'automation_run', label:'Automation completed',   sub:'When an automation finishes a run'},
    {key:'team_mention',   label:'Team @mention',          sub:'When a teammate mentions you in a note'},
  ];
  const [prefs, setPrefs] = React.useState({
    sms_received:    {email:true,  app:true},
    email_opened:    {email:false, app:true},
    deal_moved:      {email:false, app:true},
    deal_won:        {email:true,  app:true},
    contact_assigned:{email:true,  app:true},
    automation_run:  {email:false, app:false},
    team_mention:    {email:true,  app:true},
  });
  const toggle = (key, col) =>
    setPrefs(p => ({...p, [key]: {...p[key], [col]: !p[key][col]}}));

  return (
    <SettingsShell active="settings-notifications" goTo={goTo}>
      <div>
        <p className="text-white text-[18px] font-bold">Notification Preferences</p>
        <p className="text-white/45 text-[13px] mt-1">Choose how you want to be notified for each event.</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        {/* Column headers */}
        <div className="grid items-center gap-4 px-6 py-3 border-b border-white/[0.05] bg-white/[0.015]"
             style={{gridTemplateColumns:'1fr 80px 80px'}}>
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]">Event</span>
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em] text-center">Email</span>
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em] text-center">In-app</span>
        </div>

        {CHANNELS.map((ch, i) => (
          <div key={ch.key}
               className={['grid items-center gap-4 px-6 py-4', i < CHANNELS.length-1 ? 'border-b border-white/[0.03]' : ''].join(' ')}
               style={{gridTemplateColumns:'1fr 80px 80px'}}>
            <div>
              <p className="text-[13px] font-medium text-white">{ch.label}</p>
              <p className="text-[11px] text-white/45 mt-0.5">{ch.sub}</p>
            </div>
            <div className="flex justify-center">
              <Toggle on={prefs[ch.key]?.email} onChange={()=>toggle(ch.key,'email')}/>
            </div>
            <div className="flex justify-center">
              <Toggle on={prefs[ch.key]?.app} onChange={()=>toggle(ch.key,'app')}/>
            </div>
          </div>
        ))}
      </div>

      {/* Digest */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-white font-semibold mb-1">Daily digest</p>
        <p className="text-white/45 text-[12px] mb-5">Receive a single daily summary instead of individual email notifications.</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-white">Enable daily digest email</p>
            <p className="text-[12px] text-white/45 mt-0.5">Sent every morning at 8am in your local timezone.</p>
          </div>
          <Toggle on={false} onChange={()=>{}}/>
        </div>
      </div>
    </SettingsShell>
  );
}

// ── Privacy settings ──────────────────────────────────────────────────────────
function SettingsPrivacyPage({ goTo }) {
  const { confirmNode, openConfirm } = useConfirm();
  const [retention, setRetention] = React.useState('2 years');
  const RETENTIONS = ['6 months','1 year','2 years','5 years','Forever'];

  return (
    <SettingsShell active="settings-privacy" goTo={goTo}>
      <div>
        <p className="text-white text-[18px] font-bold">Privacy &amp; Data</p>
        <p className="text-white/45 text-[13px] mt-1">Manage your data, exports, and account deletion.</p>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-white font-semibold mb-1">Export workspace data</p>
        <p className="text-white/45 text-[12px] mb-5">Download all contacts, deals, notes, and automations as a CSV archive.</p>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white/70 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.18] transition-all">
            <I.Download size={13}/>Export as CSV
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white/70 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.18] transition-all">
            <I.Download size={13}/>Export as JSON
          </button>
        </div>
      </div>

      {/* GDPR */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-white font-semibold mb-1">Download account data (GDPR)</p>
        <p className="text-white/45 text-[12px] mb-5">Receive a full export of your personal account data within 72 hours, as required under GDPR Article 20.</p>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-brand-300 bg-brand-500/10 border border-brand-500/25 hover:bg-brand-500/15 transition-all">
          <I.Download size={13}/>Request data export
        </button>
      </div>

      {/* Retention */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-white font-semibold mb-1">Data retention policy</p>
        <p className="text-white/45 text-[12px] mb-5">How long to keep deleted contacts and deals before permanent erasure.</p>
        <div className="flex items-center gap-4">
          <select value={retention} onChange={e=>setRetention(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40 appearance-none">
            {RETENTIONS.map(r=><option key={r}>{r}</option>)}
          </select>
          <p className="text-[12px] text-white/45">after deletion</p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
        <p className="text-red-300 font-semibold mb-1">Delete account</p>
        <p className="text-white/45 text-[12px] mb-4">Permanently delete your personal account. Your workspace and its data will not be deleted.</p>
        <button
          onClick={() => openConfirm({
            title: 'Delete your account?',
            body: 'Your personal account will be permanently removed. Your workspace data remains intact.',
            confirmLabel: 'Delete account',
            danger: true,
          })}
          className="px-4 py-2 rounded-xl text-[13px] font-medium text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 transition-all">
          Delete my account
        </button>
      </div>
      {confirmNode}
    </SettingsShell>
  );
}

Object.assign(window, {
  SettingsBillingPage, SettingsTeamPage, SettingsGeneralPage,
  SettingsIntegrationsPage, ProfilePage,
  SettingsPipelinePage, SettingsUnsubscribesPage,
  SettingsNotificationsPage, SettingsPrivacyPage,
  TwilioSetupModal, VonageSetupModal,
});
