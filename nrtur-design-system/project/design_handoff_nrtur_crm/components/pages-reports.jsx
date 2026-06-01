// ─── pages-reports.jsx ── Reports & Analytics ────────────────────────────────

function ReportsPage({ goTo }) {
  const [range, setRange] = React.useState('Last 30 days');
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [showExportToast, setShowExportToast] = React.useState(false);
  const rangeRef = React.useRef(null);
  const RANGES = ['Last 7 days','Last 30 days','Last 90 days','This quarter','Year to date'];

  React.useEffect(()=>{
    const fn = e=>{if(rangeRef.current&&!rangeRef.current.contains(e.target))setRangeOpen(false);};
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);

  const handleExport = () => {
    setShowExportToast(true);
    setTimeout(()=>setShowExportToast(false), 3000);
  };

  // ── KPI data ──
  const KPIS = [
    {label:'Revenue Won',    value:'$134k', delta:'+31%', up:true,  sub:'vs $102k last month',          Icon:I.Dollar,   accent:'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'},
    {label:'Total Deals',    value:'107',   delta:'+18%', up:true,  sub:'16 more than last month',       Icon:I.GitBranch,accent:'bg-brand-500/10 border-brand-500/20 text-brand-300'},
    {label:'Win Rate',       value:'68%',   delta:'-2%',  up:false, sub:'Dropped 2pts vs last month',    Icon:I.Target,   accent:'bg-amber-500/10 border-amber-500/20 text-amber-300'},
    {label:'Avg Deal Cycle', value:'14d',   delta:'-3d',  up:true,  sub:'Faster · target 12d',           Icon:I.Clock,    accent:'bg-violet-500/10 border-violet-500/20 text-violet-300'},
  ];

  // ── Revenue chart ──
  const REV = [{m:'Jan',won:62,fc:18},{m:'Feb',won:48,fc:22},{m:'Mar',won:76,fc:28},{m:'Apr',won:92,fc:32},{m:'May',won:84,fc:26},{m:'Jun',won:100,fc:38}];
  const [hovBar, setHovBar] = React.useState(null);
  const RW=520,RH=200,RPL=38,RPR=8,RPT=10,RPB=26;
  const RIW=RW-RPL-RPR, RIH=RH-RPT-RPB;
  const RMAX=140;
  const barGap=10, barW=(RIW-barGap*5)/6;

  // ── Pipeline by stage ──
  const P_STAGES = [
    {name:'Prospecting',fill:35,color:'#94a3b8',count:8, val:'$42k'},
    {name:'Qualified',  fill:60,color:'#818cf8',count:5, val:'$81k'},
    {name:'Proposal',   fill:50,color:'#a78bfa',count:4, val:'$67k'},
    {name:'Negotiation',fill:43,color:'#fbbf24',count:3, val:'$58k'},
    {name:'Won',        fill:100,color:'#34d399',count:11,val:'$134k'},
  ];

  // ── Team ──
  const TEAM = [
    {name:'Alex Morgan', role:'Manager', avatar:'AM', color:'#3b82f6', created:42, closed:12, emails:184, win:82},
    {name:'Sarah Chen',  role:'Sales',   avatar:'SC', color:'#8b5cf6', created:38, closed:9,  emails:162, win:71},
    {name:'Jamie Kim',   role:'Sales',   avatar:'JK', color:'#10b981', created:31, closed:8,  emails:148, win:68},
    {name:'Ravi Lee',    role:'Sales',   avatar:'RL', color:'#f59e0b', created:24, closed:5,  emails:96,  win:56},
    {name:'Marcus Rios', role:'BDR',     avatar:'MR', color:'#ec4899', created:58, closed:3,  emails:312, win:40},
  ];

  // ── Contact growth area chart ──
  const CG = [42,51,58,64,72,79,88,97,104,115,128,138];
  const CGL = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const CGW=320, CGH=180, CGPL=28, CGPR=8, CGPT=10, CGPB=22;
  const CGiW=CGW-CGPL-CGPR, CGiH=CGH-CGPT-CGPB;
  const CGmax=Math.max(...CG);
  const cgStep=CGiW/(CG.length-1);
  const cgPts=CG.map((v,i)=>[CGPL+i*cgStep, CGPT+CGiH-(v/CGmax)*CGiH]);
  let cgPath=`M ${cgPts[0][0]} ${cgPts[0][1]}`;
  for(let i=0;i<cgPts.length-1;i++){
    const p0=cgPts[i-1]||cgPts[i], p1=cgPts[i], p2=cgPts[i+1], p3=cgPts[i+2]||p2;
    cgPath+=` C ${p1[0]+(p2[0]-p0[0])/6} ${p1[1]+(p2[1]-p0[1])/6}, ${p2[0]-(p3[0]-p1[0])/6} ${p2[1]-(p3[1]-p1[1])/6}, ${p2[0]} ${p2[1]}`;
  }
  const cgArea=`${cgPath} L ${cgPts[cgPts.length-1][0]} ${CGPT+CGiH} L ${cgPts[0][0]} ${CGPT+CGiH} Z`;

  // ── Top deals ──
  const TOP_DEALS = [
    {co:'Forge & Co',      val:'$44,000',stage:'Won',        sColor:'#34d399', owner:'SC',ownerColor:'#3b82f6', close:'Closed 2h ago', prob:100, weighted:'$44,000'},
    {co:'Summit Digital',  val:'$31,000',stage:'Negotiation',sColor:'#fbbf24', owner:'JK',ownerColor:'#8b5cf6', close:'Jun 28',        prob:80,  weighted:'$24,800'},
    {co:'Kapoor & Assoc',  val:'$28,000',stage:'Negotiation',sColor:'#fbbf24', owner:'MR',ownerColor:'#ec4899', close:'Jul 2',         prob:75,  weighted:'$21,000'},
    {co:'Pivot Studio',    val:'$22,500',stage:'Proposal',   sColor:'#a78bfa', owner:'SC',ownerColor:'#3b82f6', close:'Jul 8',         prob:55,  weighted:'$12,375'},
    {co:'Atlas Consult',   val:'$18,000',stage:'Qualified',  sColor:'#818cf8', owner:'MR',ownerColor:'#ec4899', close:'Jul 15',        prob:40,  weighted:'$7,200'},
  ];

  const TCOL = '1.5fr 110px 130px 1fr 130px 110px 28px';

  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="reports" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Reports" subtitle="Track revenue, win rate, and team performance."
          rightSlot={<>
            <div ref={rangeRef} className="relative">
              <button onClick={()=>setRangeOpen(!rangeOpen)}
                className={['inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all border',
                  rangeOpen?'border-brand-500/40 bg-white/[0.05] text-white shadow-[0_0_0_3px_rgba(99,102,241,0.12)]':'border-white/[0.08] bg-white/[0.04] text-white/70 hover:text-white hover:border-white/[0.18]'].join(' ')}>
                <I.Calendar size={13}/>{range}<I.ChevronDown size={12} stroke={2.2} className={rangeOpen?'rotate-180 transition-transform':'transition-transform'}/>
              </button>
              {rangeOpen && (
                <div className="absolute right-0 mt-2 w-52 z-20 rounded-xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden" style={{background:'rgba(13,13,26,0.97)',backdropFilter:'blur(16px)'}}>
                  <div className="p-1.5">
                    {RANGES.map(r=>(
                      <button key={r} onClick={()=>{setRange(r);setRangeOpen(false);}}
                        className={['w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between',
                          r===range?'bg-brand-500/15 text-brand-200':'text-white/70 hover:bg-white/[0.05] hover:text-white'].join(' ')}>
                        {r}{r===range&&<span className="w-1.5 h-1.5 rounded-full bg-brand-400"/>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.18] transition-all">
              <I.Download size={13}/>Export CSV
            </button>
          </>}
        />

        {/* Export toast */}
        {showExportToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-emerald-500/12 text-emerald-200 border border-emerald-500/25 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            <I.Check size={14} stroke={2.4}/>CSV downloaded
          </div>
        )}

        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1480px] mx-auto flex flex-col gap-5">

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {KPIS.map((k,i)=>(
                <div key={i} className="rounded-2xl p-5 backdrop-blur-md bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">{k.label}</p>
                    <div className={['w-9 h-9 rounded-xl flex items-center justify-center border', k.accent].join(' ')}><k.Icon size={14}/></div>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-[34px] font-black text-white leading-none tabular-nums">{k.value}</p>
                    <span className={['inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                      k.up?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'].join(' ')}>
                      {k.up?<I.TrendUp size={10} stroke={2.6}/>:<I.TrendDown size={10} stroke={2.6}/>}{k.delta}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/45 mt-2">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Row 2: Revenue chart + Pipeline stages */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-5">
              {/* Revenue chart */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Revenue Over Time</p>
                    <p className="text-white text-[20px] font-bold mt-1 tabular-nums">$605k <span className="text-emerald-400 text-[13px] font-semibold ml-1.5">+38%</span></p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'linear-gradient(180deg,#818cf8,#4f46e5)'}}/><span className="text-white/65">Won</span></span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'rgba(99,102,241,0.22)',boxShadow:'inset 0 0 0 1px rgba(99,102,241,0.4)'}}/><span className="text-white/65">Forecast</span></span>
                  </div>
                </div>
                <div style={{height:200}}>
                  <svg viewBox={`0 0 ${RW} ${RH}`} preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
                    <defs>
                      <linearGradient id="rbar-won" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a5b4fc"/><stop offset="100%" stopColor="#4f46e5"/></linearGradient>
                      <pattern id="rbar-fc" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                        <rect width="6" height="6" fill="rgba(99,102,241,0.18)"/><line x1="0" y1="0" x2="0" y2="6" stroke="rgba(99,102,241,0.5)" strokeWidth="1.2"/>
                      </pattern>
                    </defs>
                    {[0,35,70,105,140].map((y,i)=>{
                      const cy=RPT+RIH-(y/RMAX)*RIH;
                      return(<g key={i}><line x1={RPL} x2={RW-RPR} y1={cy} y2={cy} stroke="rgba(255,255,255,0.05)"/>
                        <text x={RPL-6} y={cy+3} fontSize="9" fill="rgba(255,255,255,0.35)" textAnchor="end" fontFamily="ui-monospace,monospace">${y}k</text></g>);
                    })}
                    {REV.map((d,i)=>{
                      const x=RPL+i*(barW+barGap);
                      const wonH=(d.won/RMAX)*RIH, fcH=(d.fc/RMAX)*RIH;
                      const yWon=RPT+RIH-wonH, yFc=yWon-fcH;
                      const hov=hovBar===i;
                      return(<g key={d.m} onMouseEnter={()=>setHovBar(i)} onMouseLeave={()=>setHovBar(null)} style={{cursor:'pointer'}}>
                        <rect x={x-2} y={RPT} width={barW+4} height={RIH} fill="transparent"/>
                        <rect x={x} y={yFc} width={barW} height={fcH} fill="url(#rbar-fc)" stroke="rgba(99,102,241,0.4)" strokeWidth="0.75" rx="3"/>
                        <rect x={x} y={yWon} width={barW} height={wonH} fill="url(#rbar-won)" rx="3" style={{filter:hov?'drop-shadow(0 0 12px rgba(99,102,241,0.55))':'none',transition:'filter 150ms ease'}}/>
                        <text x={x+barW/2} y={RH-8} fontSize="11" fill={hov?'#a5b4fc':'rgba(255,255,255,0.50)'} textAnchor="middle" fontWeight="500">{d.m}</text>
                        {hov&&<g><rect x={x+barW/2-46} y={yFc-36} width="92" height="30" rx="6" fill="rgba(15,15,28,0.96)" stroke="rgba(255,255,255,0.08)"/>
                          <text x={x+barW/2} y={yFc-21} fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle">${d.won}k won</text>
                          <text x={x+barW/2} y={yFc-10} fontSize="10" fill="rgba(255,255,255,0.55)" textAnchor="middle">+${d.fc}k forecast</text>
                        </g>}
                      </g>);
                    })}
                  </svg>
                </div>
              </div>

              {/* Pipeline by stage */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col">
                <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Pipeline by Stage</p>
                <p className="text-white text-[16px] font-bold mt-1 mb-5 tabular-nums">31 deals · $382k</p>
                <div className="flex flex-col gap-3.5 flex-1">
                  {P_STAGES.map(s=>(
                    <div key={s.name} className="group cursor-pointer" onClick={()=>goTo('pipeline')}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{background:s.color}}/>
                          <span className="text-[12px] font-semibold text-white/75 group-hover:text-white transition-colors">{s.name}</span>
                          <span className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded-full bg-white/[0.05]">{s.count}</span>
                        </div>
                        <span className="text-[13px] font-bold text-white tabular-nums">{s.val}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full transition-all group-hover:brightness-110" style={{width:`${s.fill}%`,background:`linear-gradient(to right,${s.color},${s.color}cc)`,boxShadow:`0 0 14px ${s.color}55`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Team table + Contact growth */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
              {/* Team activity */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Team Activity</p><p className="text-white/45 text-[12px] mt-1">Performance for {range}</p></div>
                </div>
                <div className="grid items-center gap-3 px-2 pb-2 border-b border-white/[0.05] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
                     style={{gridTemplateColumns:'1.6fr 80px 80px 80px 90px'}}>
                  <span>Rep</span><span className="text-right">Created</span><span className="text-right">Closed</span><span className="text-right">Emails</span><span className="text-right">Win rate</span>
                </div>
                {TEAM.map(t=>(
                  <div key={t.name} className="grid items-center gap-3 px-2 py-3 border-b border-white/[0.025] hover:bg-white/[0.02] transition-colors cursor-pointer"
                       style={{gridTemplateColumns:'1.6fr 80px 80px 80px 90px'}}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:t.color}}>{t.avatar}</div>
                      <div className="min-w-0"><p className="text-[13px] font-semibold text-white truncate">{t.name}</p><p className="text-[11px] text-white/45">{t.role}</p></div>
                    </div>
                    <span className="text-[13px] text-white/85 font-mono tabular-nums text-right">{t.created}</span>
                    <span className="text-[13px] text-white font-bold tabular-nums text-right">{t.closed}</span>
                    <span className="text-[13px] text-white/55 font-mono tabular-nums text-right">{t.emails}</span>
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${t.win}%`,background:t.win>=70?'#34d399':t.win>=55?'#818cf8':'#fbbf24'}}/>
                      </div>
                      <span className={['text-[12px] font-semibold tabular-nums w-9 text-right',t.win>=70?'text-emerald-300':t.win>=55?'text-white/85':'text-amber-300'].join(' ')}>{t.win}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact growth */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col">
                <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Contact Growth</p>
                <p className="text-white text-[20px] font-bold mt-1 tabular-nums">+1,284 <span className="text-emerald-400 text-[13px] font-semibold ml-1.5">+22%</span></p>
                <p className="text-[12px] text-white/45 mb-3">Cumulative · last 12 months</p>
                <div className="flex-1 min-h-0" style={{minHeight:160}}>
                  <svg viewBox={`0 0 ${CGW} ${CGH}`} preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
                    <defs><linearGradient id="cg-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45"/><stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
                    </linearGradient></defs>
                    {[0,1,2,3].map(i=><line key={i} x1={CGPL} x2={CGW-CGPR} y1={CGPT+(CGiH/3)*i} y2={CGPT+(CGiH/3)*i} stroke="rgba(255,255,255,0.05)"/>)}
                    {[CGmax,Math.round(CGmax*2/3),Math.round(CGmax/3),0].map((v,i)=>(
                      <text key={i} x={CGPL-4} y={CGPT+(CGiH/3)*i+3} fontSize="9" fill="rgba(255,255,255,0.30)" textAnchor="end" fontFamily="ui-monospace,monospace">{v}</text>
                    ))}
                    <path d={cgArea} fill="url(#cg-area)"/>
                    <path d={cgPath} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" style={{filter:'drop-shadow(0 0 8px rgba(165,180,252,0.5))'}}/>
                    <circle cx={cgPts[cgPts.length-1][0]} cy={cgPts[cgPts.length-1][1]} r="4" fill="#818cf8" stroke="#0c0c1a" strokeWidth="2"/>
                    <circle cx={cgPts[cgPts.length-1][0]} cy={cgPts[cgPts.length-1][1]} r="9" fill="rgba(99,102,241,0.18)"/>
                    {CGL.map((l,i)=><text key={i} x={CGPL+i*cgStep} y={CGH-5} fontSize="9" fill="rgba(255,255,255,0.30)" textAnchor="middle">{l}</text>)}
                  </svg>
                </div>
              </div>
            </div>

            {/* Row 4: Top deals */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <div><p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em]">Top Deals This Month</p><p className="text-white/45 text-[12px] mt-1">5 of 28 open · ranked by weighted value</p></div>
                <button onClick={()=>goTo('pipeline')} className="text-[12px] text-brand-300 hover:text-brand-200 flex items-center gap-1">View all<I.ArrowRight size={11} stroke={2.4}/></button>
              </div>
              <div className="grid items-center gap-4 px-5 py-3 border-b border-white/[0.05] bg-white/[0.015] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
                   style={{gridTemplateColumns:TCOL}}>
                <span>Company</span><span className="text-right">Value</span><span>Stage</span><span>Owner</span><span>Close date</span><span className="text-right">Weighted</span><span/>
              </div>
              {TOP_DEALS.map((d,i)=>(
                <div key={i} className={['grid items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors group',i<TOP_DEALS.length-1?'border-b border-white/[0.03]':''].join(' ')}
                     style={{gridTemplateColumns:TCOL}} onClick={()=>goTo('deal-detail')}>
                  <p className="text-[13px] font-semibold text-white truncate">{d.co}</p>
                  <p className="text-[13px] font-bold text-white text-right tabular-nums">{d.val}</p>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 w-fit" style={{background:`${d.sColor}18`,color:d.sColor,boxShadow:`0 0 0 1px ${d.sColor}40`}}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{background:d.sColor}}/>{d.stage}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{background:d.ownerColor}}>{d.owner}</div>
                  </div>
                  <span className="text-[12px] text-white/60">{d.close}</span>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[12px] font-bold text-white tabular-nums">{d.weighted}</span>
                    <span className="text-[10px] font-mono text-white/35">{d.prob}%</span>
                  </div>
                  <button className="w-6 h-6 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><I.More size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AppFooter note="Data refreshed 2 minutes ago"/>
      </div>
    </div>
  );
}

Object.assign(window, { ReportsPage });
