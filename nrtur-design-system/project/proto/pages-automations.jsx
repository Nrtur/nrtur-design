// ─── pages-automations.jsx ── Automations List + Automation Builder ───────────

const STEP_PRESETS_A = {
  assign:   {label:'Assign to rep',      Icon:I.UserPlus,    bg:'rgba(59,130,246,0.18)',  fg:'#60a5fa'},
  welcome:  {label:'Send welcome email', Icon:I.Mail,        bg:'rgba(99,102,241,0.18)',  fg:'#818cf8'},
  task:     {label:'Create task',        Icon:I.CheckSquare, bg:'rgba(245,158,11,0.18)',  fg:'#fbbf24', meta:'2d'},
  proposal: {label:'Send proposal',      Icon:I.Send,        bg:'rgba(99,102,241,0.18)',  fg:'#818cf8'},
  slack:    {label:'Notify Slack',       Icon:I.Hash,        bg:'rgba(16,185,129,0.18)',  fg:'#34d399'},
  reminder: {label:'Set reminder',       Icon:I.Bell,        bg:'rgba(245,158,11,0.18)',  fg:'#fbbf24', meta:'5d'},
  reengage: {label:'Re-engagement email',Icon:I.Mail,        bg:'rgba(236,72,153,0.18)',  fg:'#f472b6'},
  flag:     {label:'Flag for review',    Icon:I.Flag,        bg:'rgba(239,68,68,0.16)',   fg:'#f87171'},
  celebrate:{label:'Notify team',        Icon:I.Sparkles,    bg:'rgba(124,58,237,0.18)',  fg:'#a78bfa'},
  report:   {label:'Generate report',    Icon:I.BarChart,    bg:'rgba(99,102,241,0.18)',  fg:'#818cf8'},
};

const AUTOMATIONS_DATA = [
  {name:'New Lead Welcome Sequence', trigger:'Contact created',   active:true,  runs:284, success:100, lastRun:'12m ago',
   spark:[4,6,5,8,12,9,11,14,12,16,18,15,22,24], steps:[STEP_PRESETS_A.assign, STEP_PRESETS_A.welcome, STEP_PRESETS_A.task]},
  {name:'Proposal Follow-Up',        trigger:'Deal moved to Proposal', active:true, runs:91, success:97, lastRun:'1h ago',
   spark:[2,3,1,4,5,3,6,4,7,5,8,6,9,7], steps:[STEP_PRESETS_A.proposal, STEP_PRESETS_A.slack, STEP_PRESETS_A.reminder]},
  {name:'Re-engagement Campaign',    trigger:'Deal inactive 7 days', active:false, runs:47, pausedSince:'Apr 12', lastRun:'3 weeks ago',
   spark:[3,5,4,6,7,5,4,3,2,1,1,0,0,0], steps:[STEP_PRESETS_A.reengage, STEP_PRESETS_A.flag]},
];

const TEMPLATES_A = [
  {name:'Lead Nurture Sequence',   desc:'Drip educational content over 14 days.', Icon:I.Users,    iconBg:'rgba(59,130,246,0.12)',  iconFg:'#60a5fa', steps:4},
  {name:'Deal Won Celebration',    desc:'Notify team and send thank-you on close.', Icon:I.Trophy,   iconBg:'rgba(245,158,11,0.12)',  iconFg:'#fbbf24', steps:3},
  {name:'Weekly Pipeline Report',  desc:'Auto-generate Monday digest for your team.',Icon:I.BarChart, iconBg:'rgba(124,58,237,0.12)', iconFg:'#a78bfa', steps:3},
];

// ── Automations sub-nav (shared by Automations + Sequences pages) ─────────────
function AutomationsSubNav({ active, goTo }) {
  const tabs = [
    { label:'Workflows',    page:'automations' },
    { label:'Email Seq',    page:'email-sequences' },
    { label:'SMS Seq',      page:'sms-sequences' },
  ];
  return (
    <div className="shrink-0 border-b border-white/[0.05] px-7" style={{background:'#09091a'}}>
      <div className="flex items-center gap-1">
        {tabs.map(t => {
          const a = active === t.page;
          return (
            <button key={t.label} onClick={() => goTo(t.page)}
              className={['relative px-4 py-3 text-[13px] font-medium transition-colors',
                a ? 'text-white' : 'text-white/45 hover:text-white/75'].join(' ')}>
              {t.label}
              {a && <span className="absolute left-3 right-3 -bottom-px h-px" style={{background:'linear-gradient(90deg,transparent,#818cf8,transparent)',boxShadow:'0 0 12px rgba(129,140,248,0.7)'}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}


function MiniSparkA({ data, color='#818cf8' }) {
  if (!data||data.length===0) return null;
  const W=96, H=28;
  const max=Math.max(...data)||1;
  const step=W/(data.length-1);
  const pts=data.map((v,i)=>`${(i*step).toFixed(1)},${(H-2-(v/max)*(H-4)).toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} className="overflow-visible">
      <defs><linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#sg-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function StepPillA({ step, last }) {
  const Icon = step.Icon;
  return (
    <>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.07] transition-all whitespace-nowrap">
        <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{background:step.bg,color:step.fg}}><Icon size={11} stroke={2.2}/></span>
        <span className="text-[12px] font-medium text-white/80">{step.label}</span>
        {step.meta && <span className="text-[10px] text-white/35 font-mono">{step.meta}</span>}
      </div>
      {!last && <span className="text-white/20 mx-0.5"><I.ArrowRight size={12} stroke={2}/></span>}
    </>
  );
}

function AutomationCard({ auto, idx, goTo }) {
  const [on, setOn] = React.useState(auto.active);
  return (
    <div className={['rounded-2xl border backdrop-blur-md p-5 transition-all duration-300',
      on?'bg-white/[0.035] border-white/[0.08] hover:border-white/[0.14]':'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.10] opacity-90'].join(' ')}
      style={{animationDelay:`${idx*60}ms`}}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={['w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            on?'bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25':'bg-white/[0.05] text-white/40 ring-1 ring-white/[0.06]'].join(' ')}>
            <I.Zap size={17} stroke={2.2}/>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white text-[16px] font-bold leading-tight">{auto.name}</h3>
              <span className={['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1',
                on?'bg-emerald-500/12 text-emerald-300 ring-emerald-500/25':'bg-white/[0.05] text-white/45 ring-white/[0.08]'].join(' ')}>
                <span className={['w-1.5 h-1.5 rounded-full', on?'bg-emerald-400':'bg-white/30'].join(' ')}/>
                {on?'Active':'Paused'}
              </span>
            </div>
            <p className="text-[12px] text-white/55 mt-1.5"><span className="text-white/35">When:</span> <span className="font-medium text-white/80">{auto.trigger}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Toggle on={on} onChange={setOn}/>
          <button onClick={()=>goTo('automation-builder')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white/65 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all">
            <I.Edit size={12}/>Edit
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.06] transition-all"><I.More size={14}/></button>
        </div>
      </div>
      {/* Steps */}
      <div className="rounded-xl bg-black/20 border border-white/[0.04] px-3 py-3 mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {auto.steps.map((s,i)=><StepPillA key={i} step={s} last={i===auto.steps.length-1}/>)}
        </div>
      </div>
      {/* Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-[12px] text-white/45">
            <I.Play size={9} className="text-white/35"/>Runs <span className="text-[13px] font-bold text-white tabular-nums">{auto.runs}</span>
          </div>
          {on ? (
            <div className="flex items-center gap-2 text-[12px] text-white/45">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Success <span className="text-[13px] font-bold text-emerald-300 tabular-nums">{auto.success}%</span>
            </div>
          ) : (
            <span className="text-[12px] text-white/35 italic">Paused since {auto.pausedSince}</span>
          )}
          {auto.lastRun && <span className="text-[11px] text-white/35 flex items-center gap-1"><I.Clock size={10}/>Last {auto.lastRun}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/35">Last 14d</span>
          <MiniSparkA data={auto.spark} color={on?'#818cf8':'#64748b'}/>
        </div>
      </div>
    </div>
  );
}

function AutomationsPage({ goTo }) {
  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="automations" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Automations" subtitle="3 active · 7 available · 422 runs this month"
          rightSlot={
            <button onClick={()=>goTo('automation-builder')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all">
              <I.Plus size={14} stroke={2.4}/>New Automation
            </button>
          }
        />
        <AutomationsSubNav active="automations" goTo={goTo}/>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1240px] mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-white text-[15px] font-semibold">Active Automations</p><p className="text-[12px] text-white/45 mt-0.5">Workflows that ran in the last 30 days.</p></div>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/70 font-medium">All <span className="font-mono text-white/40">3</span></span>
              </div>
            </div>
            <div className="flex flex-col gap-4 mb-10">
              {AUTOMATIONS_DATA.map((a,i)=><AutomationCard key={a.name} auto={a} idx={i} goTo={goTo}/>)}
            </div>

            {/* Templates */}
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-white text-[15px] font-semibold">Available Templates</p><p className="text-[12px] text-white/45 mt-0.5">One click to set up.</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {TEMPLATES_A.map(t=>(
                <div key={t.name} className="group rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-brand-500/30 hover:bg-white/[0.04] p-5 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:t.iconBg,color:t.iconFg}}><t.Icon size={18} stroke={2}/></div>
                    <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-white/35 flex items-center gap-1"><I.Lock size={9}/>Preview</span>
                  </div>
                  <h4 className="text-white text-[15px] font-bold leading-tight">{t.name}</h4>
                  <p className="text-[12px] text-white/50 leading-relaxed mt-1.5 mb-4">{t.desc}</p>
                  <button onClick={()=>goTo('automation-builder')} className="w-full py-2 rounded-xl text-[12px] font-semibold text-white/70 hover:text-brand-200 bg-white/[0.04] hover:bg-brand-500/15 border border-white/[0.08] hover:border-brand-500/30 transition-all flex items-center justify-center gap-1.5">
                    Use template<I.ArrowRight size={11} stroke={2.4}/>
                  </button>
                </div>
              ))}
            </div>

            {/* Build your own */}
            <div className="rounded-2xl border border-dashed border-white/[0.08] hover:border-brand-500/30 transition-colors p-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-300 mx-auto mb-3 flex items-center justify-center ring-1 ring-brand-500/20"><I.Sparkles size={16}/></div>
              <p className="text-[14px] font-semibold text-white">Build your own</p>
              <p className="text-[12px] text-white/50 mt-1 max-w-sm mx-auto">Start from a blank canvas. Pick a trigger, chain together actions, and go live.</p>
              <button onClick={()=>goTo('automation-builder')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">
                <I.Plus size={14} stroke={2.4}/>New Automation
              </button>
            </div>
          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

// ── Automation Builder ─────────────────────────────────────────────────────────
function AutomationBuilderPage({ goTo }) {
  const [steps, setSteps] = React.useState([
    {id:1, ...STEP_PRESETS_A.assign},
    {id:2, ...STEP_PRESETS_A.welcome},
    {id:3, ...STEP_PRESETS_A.task},
  ]);
  const [name, setName] = React.useState('New Automation');
  const [trigger, setTrigger] = React.useState('Contact created');
  const { confirmNode, openConfirm } = useConfirm();

  const availableSteps = Object.values(STEP_PRESETS_A);

  return (
    <div className="h-full flex" style={{background:'#07070f'}}>
      <AppSidebar active="automations" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 border-b border-white/[0.05] px-7 py-3.5 flex items-center justify-between" style={{background:'#09091a'}}>
          <div className="flex items-center gap-2 text-[13px]">
            <button onClick={()=>goTo('automations')} className="text-white/45 hover:text-white transition-colors">Automations</button>
            <I.ChevronRight size={12} className="text-white/25"/>
            <input value={name} onChange={e=>setName(e.target.value)} className="bg-transparent text-white font-semibold outline-none border-b border-transparent focus:border-brand-500/40 px-0.5"/>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>goTo('automations')} className="px-3 py-1.5 rounded-lg text-[13px] text-white/65 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
            <button onClick={()=>goTo('automations')} className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Save automation</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-start">

              {/* Builder canvas */}
              <div className="flex flex-col gap-4">
                {/* Trigger */}
                <div className="rounded-2xl bg-white/[0.03] border border-brand-500/25 p-5">
                  <p className="text-[10px] font-semibold text-brand-300 uppercase tracking-[0.18em] mb-3">Trigger</p>
                  <select value={trigger} onChange={e=>setTrigger(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40 appearance-none">
                    <option>Contact created</option>
                    <option>Deal moved to Proposal</option>
                    <option>Deal inactive 7 days</option>
                    <option>Email received</option>
                    <option>Form submitted</option>
                  </select>
                </div>

                {/* Steps */}
                {steps.map((s,i)=>{
                  const Icon = s.Icon;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex items-center justify-center">
                        <div className="w-px h-6 bg-white/[0.10]"/><div className="w-2 h-2 rounded-full bg-brand-500/50 mx-auto -mt-3 -mb-2"/>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]">Step {i+1}</span>
                          <button onClick={()=>openConfirm({
                            title: `Remove "${s.label}"?`,
                            body: 'This step will be deleted from the workflow. This cannot be undone.',
                            confirmLabel: 'Remove step',
                            danger: true,
                            onConfirm: ()=>setSteps(steps.filter(x=>x.id!==s.id)),
                          })} className="text-white/30 hover:text-red-400 text-[11px] transition-colors">Remove</button>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:s.bg,color:s.fg}}><Icon size={14}/></span>
                          <div>
                            <p className="text-[13px] font-semibold text-white">{s.label}</p>
                            {s.meta && <p className="text-[11px] text-white/45 mt-0.5">Delay: {s.meta}</p>}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Add step */}
                <div className="flex items-center justify-center"><div className="w-px h-6 bg-white/[0.10]"/></div>
                <div className="rounded-2xl border border-dashed border-white/[0.12] hover:border-brand-500/30 p-4 text-center transition-all">
                  <p className="text-[12px] text-white/45">Add step from the panel →</p>
                </div>
              </div>

              {/* Step palette */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 sticky top-4">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.14em] mb-4">Actions</p>
                <div className="flex flex-col gap-2">
                  {availableSteps.map((s,i)=>{
                    const Icon = s.Icon;
                    return (
                      <button key={i} onClick={()=>setSteps([...steps, {...s, id:Date.now()+i}])}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all text-left group">
                        <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{background:s.bg,color:s.fg}}><Icon size={13}/></span>
                        <span className="text-[12px] text-white/65 group-hover:text-white transition-colors">{s.label}</span>
                        <I.Plus size={11} stroke={2.4} className="ml-auto text-white/20 group-hover:text-brand-300 transition-colors"/>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <AppFooter/>
        {confirmNode}
      </div>
    </div>
  );
}

// ── SMS Sequences Page ────────────────────────────────────────────────────────
const SEQ_DATA = [
  { id:1, name:'New Lead Welcome',       channel:'sms', steps:3, enrolled:142, active:true,  lastRun:'8m ago',   sent:412, replied:38 },
  { id:2, name:'Deal Follow-Up',         channel:'sms', steps:4, enrolled:67,  active:true,  lastRun:'2h ago',   sent:211, replied:19 },
  { id:3, name:'Re-engagement (30d)',    channel:'sms', steps:2, enrolled:0,   active:false, lastRun:'1w ago',   sent:88,  replied:6  },
  { id:4, name:'Post-close Check-in',    channel:'sms', steps:2, enrolled:29,  active:true,  lastRun:'1d ago',   sent:63,  replied:11 },
];

function SMSSequencesPage({ goTo }) {
  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="sms-sequences" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Sequences" subtitle="SMS drip sequences for contacts and deals"
          rightSlot={
            <button onClick={()=>goTo('automation-builder')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all">
              <I.Plus size={14} stroke={2.4}/>New Sequence
            </button>
          }
        />
        <AutomationsSubNav active="sms-sequences" goTo={goTo}/>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1100px] mx-auto">

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                {label:'Active sequences', value:'3', Icon:I.Layers,   color:'bg-brand-500/10 ring-brand-500/20 text-brand-300'},
                {label:'Messages sent',    value:'774', Icon:I.Send,    color:'bg-violet-500/10 ring-violet-500/20 text-violet-300'},
                {label:'Reply rate',       value:'9.6%', Icon:I.Reply, color:'bg-emerald-500/10 ring-emerald-500/20 text-emerald-300'},
              ].map(m=>(
                <div key={m.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-center gap-4 hover:border-white/[0.10] transition-all">
                  <div className={['w-10 h-10 rounded-xl flex items-center justify-center ring-1 shrink-0', m.color].join(' ')}><m.Icon size={16}/></div>
                  <div><p className="text-white text-[24px] font-black leading-none tabular-nums">{m.value}</p><p className="text-[11px] text-white/45 mt-1">{m.label}</p></div>
                </div>
              ))}
            </div>

            {/* Sequences list */}
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-white text-[15px] font-semibold">All Sequences</p><p className="text-[12px] text-white/45 mt-0.5">{SEQ_DATA.length} sequences · SMS channel</p></div>
            </div>

            <div className="flex flex-col gap-3">
              {SEQ_DATA.map((seq,idx)=>{
                const [on,setOn]=React.useState(seq.active);
                const {confirmNode,openConfirm}=useConfirm();
                return (
                  <div key={seq.id} className={['rounded-2xl border backdrop-blur-md p-5 transition-all',
                    on?'bg-white/[0.035] border-white/[0.08] hover:border-white/[0.14]':'bg-white/[0.02] border-white/[0.05] opacity-80'].join(' ')}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1',
                          on?'bg-brand-500/12 text-brand-300 ring-brand-500/25':'bg-white/[0.05] text-white/40 ring-white/[0.06]'].join(' ')}>
                          <I.Layers size={17} stroke={2.2}/>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white text-[15px] font-bold leading-tight">{seq.name}</h3>
                            <span className={['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1',
                              on?'bg-emerald-500/12 text-emerald-300 ring-emerald-500/25':'bg-white/[0.05] text-white/45 ring-white/[0.08]'].join(' ')}>
                              <span className={['w-1.5 h-1.5 rounded-full',on?'bg-emerald-400':'bg-white/30'].join(' ')}/>
                              {on?'Active':'Paused'}
                            </span>
                          </div>
                          <p className="text-[12px] text-white/45 mt-1">{seq.steps} steps · SMS · {seq.lastRun ? `Last run ${seq.lastRun}` : 'Never run'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-5 text-[12px] text-white/40">
                          <span>Enrolled <span className="text-white font-bold tabular-nums ml-1">{seq.enrolled}</span></span>
                          <span>Sent <span className="text-white font-bold tabular-nums ml-1">{seq.sent}</span></span>
                          <span>Replied <span className="text-emerald-300 font-bold tabular-nums ml-1">{seq.replied}</span></span>
                        </div>
                        <Toggle on={on} onChange={setOn}/>
                        <button onClick={()=>goTo('automation-builder')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white/65 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all">
                          <I.Edit size={12}/>Edit
                        </button>
                        <button onClick={()=>openConfirm({
                          title:`Delete "${seq.name}"?`,
                          body:'All enrolled contacts will exit this sequence. Sent messages are not affected.',
                          confirmLabel:'Delete sequence',
                          danger:true,
                        })} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/08 transition-all">
                          <I.Trash size={13}/>
                        </button>
                      </div>
                    </div>
                    {confirmNode}
                  </div>
                );
              })}
            </div>

            {/* Empty CTA */}
            <div className="mt-6 rounded-2xl border border-dashed border-white/[0.08] hover:border-brand-500/30 transition-colors p-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-300 mx-auto mb-3 flex items-center justify-center ring-1 ring-brand-500/20"><I.Layers size={16}/></div>
              <p className="text-[14px] font-semibold text-white">Build a new sequence</p>
              <p className="text-[12px] text-white/50 mt-1 max-w-sm mx-auto">Set up a timed SMS drip: a trigger, a delay, and a series of messages.</p>
              <button onClick={()=>goTo('automation-builder')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">
                <I.Plus size={14} stroke={2.4}/>New Sequence
              </button>
            </div>

          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

// ── Email Sequences Page ──────────────────────────────────────────────────────
const EMAIL_SEQ_DATA = [
  {id:1, name:'New Lead Nurture',        steps:5, enrolled:98,  active:true,  lastRun:'15m ago',  sent:312, opened:187, replied:24},
  {id:2, name:'Proposal Follow-Up',      steps:3, enrolled:41,  active:true,  lastRun:'3h ago',   sent:128, opened:71,  replied:18},
  {id:3, name:'Re-engagement (60d)',     steps:4, enrolled:0,   active:false, lastRun:'2w ago',   sent:203, opened:88,  replied:9 },
  {id:4, name:'Post-close Onboarding',   steps:6, enrolled:22,  active:true,  lastRun:'1d ago',   sent:89,  opened:68,  replied:15},
];

function EmailStepCard({ step, idx }) {
  const [notOpened, setNotOpened] = React.useState(false);
  const delays = ['Immediately','1 day later','2 days later','3 days later','5 days later','1 week later','2 weeks later'];
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]">Step {idx+1}</span>
        <div className="flex items-center gap-2">
          <select defaultValue={delays[Math.min(idx,delays.length-1)]}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-white/65 outline-none appearance-none">
            {delays.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <input defaultValue={step.subject} placeholder="Subject line…"
          className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white outline-none focus:border-brand-500/40 placeholder:text-white/25"/>
        <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[12px] text-white/60 leading-relaxed min-h-[64px]">
          {step.preview}
        </div>
        <div className="flex items-center gap-2">
          <Toggle on={notOpened} onChange={setNotOpened}/>
          <span className="text-[12px] text-white/55">Only send if previous email not opened</span>
        </div>
      </div>
    </div>
  );
}

function EmailSequencesPage({ goTo }) {
  const [expanded, setExpanded] = React.useState(null);
  const {confirmNode, openConfirm} = useConfirm();

  const SEQ_STEPS = {
    1: [
      {subject:'Welcome to the loop — quick intro',      preview:'Hi {{first_name}}, thanks for reaching out. I wanted to personally introduce myself and share how nrtur has helped teams like yours…'},
      {subject:'How [Company] saved 4h/week on follow-up',preview:'One of our customers, a 6-person agency, was spending every Monday manually chasing leads. Here\'s the exact workflow they set up…'},
      {subject:'Quick question for you',                  preview:'{{first_name}}, I noticed you haven\'t had a chance to reply yet — totally fine! I just had one quick question…'},
      {subject:'Case study: Forge & Co closed 40% more', preview:'I thought this might be relevant for you. Forge & Co increased their close rate by 40% in the first 90 days…'},
      {subject:'Last one — resources if you\'re curious', preview:'This is my last email in this sequence. I don\'t want to clutter your inbox, but I wanted to leave you with a few resources…'},
    ],
  };

  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="email-sequences" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Email Sequences" subtitle="Timed email drips for contacts and deals"
          rightSlot={
            <button onClick={()=>goTo('automation-builder')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all">
              <I.Plus size={14} stroke={2.4}/>New Sequence
            </button>
          }
        />
        <AutomationsSubNav active="email-sequences" goTo={goTo}/>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1100px] mx-auto">

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                {label:'Active sequences', value:'3',    Icon:I.Mail,    color:'bg-brand-500/10 ring-brand-500/20 text-brand-300'},
                {label:'Emails sent',      value:'732',  Icon:I.Send,    color:'bg-violet-500/10 ring-violet-500/20 text-violet-300'},
                {label:'Open rate',        value:'58%',  Icon:I.Eye,     color:'bg-amber-500/10 ring-amber-500/20 text-amber-300'},
                {label:'Reply rate',       value:'14.2%',Icon:I.Reply,   color:'bg-emerald-500/10 ring-emerald-500/20 text-emerald-300'},
              ].map(m=>(
                <div key={m.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-center gap-4 hover:border-white/[0.10] transition-all">
                  <div className={['w-10 h-10 rounded-xl flex items-center justify-center ring-1 shrink-0', m.color].join(' ')}><m.Icon size={16}/></div>
                  <div><p className="text-white text-[22px] font-black leading-none tabular-nums">{m.value}</p><p className="text-[11px] text-white/45 mt-1">{m.label}</p></div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {EMAIL_SEQ_DATA.map(seq=>{
                const [on, setOn] = React.useState(seq.active);
                const isExpanded = expanded === seq.id;
                const steps = SEQ_STEPS[seq.id] || [];
                return (
                  <div key={seq.id} className={['rounded-2xl border transition-all',
                    on?'bg-white/[0.035] border-white/[0.08]':'bg-white/[0.02] border-white/[0.05] opacity-80'].join(' ')}>
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-4 p-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1',
                          on?'bg-brand-500/12 text-brand-300 ring-brand-500/25':'bg-white/[0.05] text-white/40 ring-white/[0.06]'].join(' ')}>
                          <I.Mail size={17} stroke={2}/>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white text-[15px] font-bold">{seq.name}</h3>
                            <span className={['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1',
                              on?'bg-emerald-500/12 text-emerald-300 ring-emerald-500/25':'bg-white/[0.05] text-white/45 ring-white/[0.08]'].join(' ')}>
                              <span className={['w-1.5 h-1.5 rounded-full',on?'bg-emerald-400':'bg-white/30'].join(' ')}/>{on?'Active':'Paused'}
                            </span>
                          </div>
                          <p className="text-[12px] text-white/45 mt-1">{seq.steps} steps · Email · {seq.lastRun?`Last run ${seq.lastRun}`:'Never run'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <div className="flex items-center gap-4 text-[12px] text-white/40">
                          <span>Enrolled <span className="text-white font-bold ml-1 tabular-nums">{seq.enrolled}</span></span>
                          <span>Sent <span className="text-white font-bold ml-1 tabular-nums">{seq.sent}</span></span>
                          <span>Opened <span className="text-amber-300 font-bold ml-1 tabular-nums">{seq.opened}</span></span>
                          <span>Replied <span className="text-emerald-300 font-bold ml-1 tabular-nums">{seq.replied}</span></span>
                        </div>
                        <Toggle on={on} onChange={setOn}/>
                        <button onClick={()=>setExpanded(isExpanded?null:seq.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white/65 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all">
                          <I.Edit size={12}/>{isExpanded?'Collapse':'Edit steps'}
                        </button>
                        <button onClick={()=>openConfirm({
                          title:`Delete "${seq.name}"?`,
                          body:'All enrolled contacts will exit this sequence. Sent emails are not affected.',
                          confirmLabel:'Delete sequence', danger:true,
                        })} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 transition-all">
                          <I.Trash size={13}/>
                        </button>
                      </div>
                    </div>

                    {/* Expanded step editor */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-white/[0.05] pt-5 flex flex-col gap-3">
                        {(steps.length ? steps : [{subject:'Welcome email',preview:'Hi {{first_name}}, thanks for reaching out…'}]).map((s,i)=>(
                          <EmailStepCard key={i} step={s} idx={i}/>
                        ))}
                        <button className="flex items-center gap-2 text-[13px] text-brand-300 hover:text-brand-200 transition-colors py-2">
                          <I.Plus size={13} stroke={2.4}/>Add step
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty CTA */}
            <div className="mt-6 rounded-2xl border border-dashed border-white/[0.08] hover:border-brand-500/30 transition-colors p-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-300 mx-auto mb-3 flex items-center justify-center ring-1 ring-brand-500/20"><I.Mail size={16}/></div>
              <p className="text-[14px] font-semibold text-white">Build a new email sequence</p>
              <p className="text-[12px] text-white/50 mt-1 max-w-sm mx-auto">Write a timed series of emails: a trigger, a delay between each step, and optional open-tracking conditions.</p>
              <button onClick={()=>goTo('automation-builder')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">
                <I.Plus size={14} stroke={2.4}/>New Email Sequence
              </button>
            </div>
          </div>
        </div>
        <AppFooter/>
        {confirmNode}
      </div>
    </div>
  );
}

Object.assign(window, { AutomationsPage, AutomationBuilderPage, SMSSequencesPage, EmailSequencesPage });
