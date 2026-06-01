// ─── pages-dashboard.jsx ─────────────────────────────────────────────────────

function DashboardSkeleton({ goTo }) {
  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="dashboard" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo}/>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1480px] mx-auto">
            <div className="mb-6"><Skel w="260px" h="28px" r="7px"/><Skel w="200px" h="13px" r="5px" s={{marginTop:8}}/></div>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[0,1,2,3].map(i=>(
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="flex items-center justify-between mb-3"><Skel w="80px" h="10px"/><Skel w="32px" h="32px" r="8px"/></div>
                  <Skel w="90px" h="30px" r="6px"/>
                  <Skel w="56px" h="10px" r="4px" s={{marginTop:8}}/>
                </div>
              ))}
            </div>
            {/* Body rows */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col gap-4">
                <Skel w="130px" h="13px"/>
                {[0,1,2,3].map(i=>(
                  <div key={i} className="flex items-center gap-3">
                    <Skel w="32px" h="32px" r="8px"/>
                    <div className="flex-1 flex flex-col gap-2"><Skel w={`${160+i*20}px`} h="12px"/><Skel w="100px" h="10px"/></div>
                    <Skel w="50px" h="10px"/>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col gap-3">
                <Skel w="110px" h="13px"/>
                {[0,1,2,3,4].map(i=>(
                  <div key={i} className="flex items-center gap-3">
                    <Skel w="32px" h="32px" r="50%"/>
                    <div className="flex-1 flex flex-col gap-2"><Skel w={`${120+i*10}px`} h="12px"/><Skel w="70px" h="10px"/></div>
                    <Skel w="38px" h="11px"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

function DashboardPage({ goTo }) {
  const loading = useSkeleton(1100);
  if (loading) return <DashboardSkeleton goTo={goTo}/>;
  const METRICS = [
    { label:'Revenue Won',   value:'$134k', delta:'+31%', up:true,  accent:{bg:'bg-emerald-500/10',ring:'ring-emerald-500/20',fg:'text-emerald-300', Icon:I.Dollar} },
    { label:'Total Deals',  value:'107',   delta:'+18%', up:true,  accent:{bg:'bg-brand-500/10',   ring:'ring-brand-500/20',  fg:'text-brand-300',   Icon:I.GitBranch} },
    { label:'Win Rate',     value:'68%',   delta:'-2%',  up:false, accent:{bg:'bg-amber-500/10',   ring:'ring-amber-500/20',  fg:'text-amber-300',   Icon:I.Target} },
    { label:'Avg Cycle',    value:'14 days',delta:'-3d', up:true,  accent:{bg:'bg-violet-500/10',  ring:'ring-violet-500/20', fg:'text-violet-300',  Icon:I.Clock} },
  ];
  const TOP_CONTACTS = [
    {name:'Sarah Chen',    co:'Meridian Agency', avatar:'SC', color:'#3b82f6', status:'Active',  deal:'$24k'},
    {name:'James Rivera',  co:'Summit Digital',  avatar:'JR', color:'#8b5cf6', status:'Hot',     deal:'$31k'},
    {name:'Maria Lopez',   co:'Bloom Creative',  avatar:'ML', color:'#ec4899', status:'Warm',    deal:'$18k'},
    {name:'Ravi Lee',      co:'Vertex Labs',     avatar:'RL', color:'#10b981', status:'New',     deal:'$6.2k'},
    {name:'Marcus Rios',   co:'Kapoor & Assoc',  avatar:'MR', color:'#f59e0b', status:'Warm',    deal:'$28k'},
  ];
  const ACTIVITY = [
    {kind:'email', label:'EMAIL SENT', title:'Sent proposal to Summit Digital', sub:'James Rivera · $31k deal', time:'12m ago', chipBg:'bg-brand-500/15 ring-brand-500/25 text-brand-300'},
    {kind:'deal',  label:'DEAL MOVED', title:'Forge & Co moved → Won',          sub:'Alex Morgan · $44k',       time:'2h ago',  chipBg:'bg-emerald-500/15 ring-emerald-500/25 text-emerald-300'},
    {kind:'note',  label:'NOTE ADDED', title:'Called Sarah, ready to proceed',  sub:'Sarah Chen · Meridian',    time:'5h ago',  chipBg:'bg-amber-500/15 ring-amber-500/25 text-amber-300'},
    {kind:'new',   label:'NEW CONTACT',title:'Barrett Digital added',            sub:'By Jamie Kim',             time:'1d ago',  chipBg:'bg-violet-500/15 ring-violet-500/25 text-violet-300'},
  ];
  const PIPELINE_STAGES = [
    {name:'Prospecting', count:8,  val:'$42k', fill:35, color:'#94a3b8'},
    {name:'Qualified',   count:5,  val:'$81k', fill:60, color:'#818cf8'},
    {name:'Proposal',    count:4,  val:'$67k', fill:50, color:'#a78bfa'},
    {name:'Negotiation', count:3,  val:'$58k', fill:43, color:'#fbbf24'},
    {name:'Won',         count:11, val:'$134k',fill:100,color:'#34d399'},
  ];
  const statusColor = {Active:'text-emerald-300 bg-emerald-500/12 ring-emerald-500/25', Hot:'text-red-300 bg-red-500/12 ring-red-500/25', Warm:'text-amber-300 bg-amber-500/12 ring-amber-500/25', New:'text-blue-300 bg-blue-500/12 ring-blue-500/25'};

  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="dashboard" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} rightSlot={
          <button onClick={()=>goTo('add-contact')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all">
            <I.Plus size={14} stroke={2.4}/>New Contact
          </button>
        }/>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1480px] mx-auto">
            <div className="mb-6">
              <h1 className="text-white text-[26px] font-bold">Good morning, Alex 👋</h1>
              <p className="text-white/50 text-[13px] mt-1">May 20, 2026 · Here's where things stand today.</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {METRICS.map((m,i)=>(
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/[0.10] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.14em]">{m.label}</p>
                    <div className={['w-8 h-8 rounded-lg flex items-center justify-center ring-1', m.accent.bg, m.accent.ring, m.accent.fg].join(' ')}>
                      <m.accent.Icon size={14}/>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-white text-[28px] font-black leading-none tabular-nums">{m.value}</p>
                    <span className={['inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                      m.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'].join(' ')}>
                      {m.up ? <I.TrendUp size={9} stroke={2.6}/> : <I.TrendDown size={9} stroke={2.6}/>}
                      {m.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 mb-5">
              {/* Activity feed */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div>
                    <p className="text-white font-semibold">Recent Activity</p>
                    <p className="text-[11px] text-white/45 mt-0.5">Last 24 hours</p>
                  </div>
                  <button onClick={()=>goTo('reports')} className="text-[12px] text-brand-300 hover:text-brand-200 flex items-center gap-1">View all<I.ArrowRight size={11} stroke={2.4}/></button>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {ACTIVITY.map((a,i)=>(
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        {a.kind==='email'?<I.Mail size={12}/>:a.kind==='deal'?<I.GitBranch size={12}/>:a.kind==='note'?<I.Note size={12}/>:<I.UserPlus size={12}/>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={['inline-flex items-center text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full ring-1', a.chipBg].join(' ')}>{a.label}</span>
                          <span className="text-[10px] text-white/30">{a.time}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-white leading-tight">{a.title}</p>
                        <p className="text-[11px] text-white/45 mt-0.5">{a.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline snapshot */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div>
                    <p className="text-white font-semibold">Pipeline</p>
                    <p className="text-[11px] text-white/45 mt-0.5">$324k · 28 open deals</p>
                  </div>
                  <button onClick={()=>goTo('pipeline')} className="text-[12px] text-brand-300 hover:text-brand-200 flex items-center gap-1">View all<I.ArrowRight size={11} stroke={2.4}/></button>
                </div>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  {PIPELINE_STAGES.map(s=>(
                    <div key={s.name} className="cursor-pointer group" onClick={()=>goTo('pipeline')}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{background:s.color}}/>
                          <span className="text-[12px] font-medium text-white/70 group-hover:text-white transition-colors">{s.name}</span>
                          <span className="text-[10px] font-mono text-white/35 px-1 py-0.5 rounded bg-white/[0.05]">{s.count}</span>
                        </div>
                        <span className="text-[12px] font-bold text-white tabular-nums">{s.val}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full group-hover:brightness-110 transition-all" style={{width:`${s.fill}%`,background:s.color}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top contacts */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <div>
                  <p className="text-white font-semibold">Top Contacts</p>
                  <p className="text-[11px] text-white/45 mt-0.5">Most active this week</p>
                </div>
                <button onClick={()=>goTo('contacts')} className="text-[12px] text-brand-300 hover:text-brand-200 flex items-center gap-1">View all<I.ArrowRight size={11} stroke={2.4}/></button>
              </div>
              <div>
                {TOP_CONTACTS.map((c,i)=>(
                  <button key={i} onClick={()=>goTo('contact-detail')}
                    className={['w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left',i<TOP_CONTACTS.length-1?'border-b border-white/[0.03]':''].join(' ')}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:c.color}}>{c.avatar}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-white leading-tight">{c.name}</p>
                      <p className="text-[11px] text-white/45">{c.co}</p>
                    </div>
                    <span className={['text-[10px] font-medium px-2 py-0.5 rounded-full ring-1', statusColor[c.status]||'text-white/50 bg-white/[0.05] ring-white/[0.10]'].join(' ')}>{c.status}</span>
                    <span className="text-[13px] font-bold text-white tabular-nums">{c.deal}</span>
                    <I.ChevronRight size={12} className="text-white/25 shrink-0"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPage });
