// ─── pages-pipeline.jsx ── Kanban + Deal Detail + Add Deal ───────────────────

function PipelineSkeleton({ goTo }) {
  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="pipeline" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Pipeline"/>
        <div className="flex-1 overflow-hidden">
          <div className="h-full px-7 py-5 flex flex-col gap-5">
            {/* Metric row */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
              {[0,1,2,3].map(i=>(
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-center gap-3">
                  <Skel w="36px" h="36px" r="10px"/>
                  <div className="flex flex-col gap-2 flex-1"><Skel w="55px" h="18px"/><Skel w="40px" h="10px"/></div>
                </div>
              ))}
            </div>
            {/* Kanban columns */}
            <div className="flex gap-4 flex-1 min-h-0">
              {[...Array(5)].map((_,col)=>(
                <div key={col} className="flex-1 min-w-0 rounded-2xl bg-white/[0.025] border border-white/[0.05] p-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <Skel w="70px" h="11px"/>
                    <Skel w="22px" h="18px" r="9999px"/>
                  </div>
                  {[...Array(col===4?2:3)].map((_,card)=>(
                    <div key={card} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex flex-col gap-2.5">
                      <Skel w={`${70+card*8}%`} h="12px"/>
                      <Skel w="55%" h="10px"/>
                      <div className="flex items-center justify-between mt-1">
                        <Skel w="24px" h="24px" r="50%"/>
                        <Skel w="44px" h="18px" r="9999px"/>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

// ── Pipeline Page ─────────────────────────────────────────────────────────────
function PipelinePage({ goTo }) {
  const loading = useSkeleton(1000);
  if (loading) return <PipelineSkeleton goTo={goTo}/>;
  return <PipelinePageInner goTo={goTo}/>;
}
const STAGES_DATA = [
{ key: 'prospecting', name: 'Prospecting', color: '#94a3b8', count: 8, value: '$42k',
  deals: [
  { id: 1, company: 'Meridian Agency', value: '$8,400', owner: 'SC', ownerColor: '#3b82f6', tag: 'Follow up', tagBg: 'bg-blue-500/15', tagFg: 'text-blue-300', age: '5d', score: 'cold' },
  { id: 2, company: 'Bloom Creative', value: '$12,000', owner: 'JK', ownerColor: '#8b5cf6', tag: 'New lead', tagBg: 'bg-emerald-500/15', tagFg: 'text-emerald-300', age: '2d', score: 'warm' },
  { id: 3, company: 'Vertex Labs', value: '$6,200', owner: 'RL', ownerColor: '#10b981', tag: 'Call booked', tagBg: 'bg-violet-500/15', tagFg: 'text-violet-300', age: '1d', score: 'hot' }]
},
{ key: 'qualified', name: 'Qualified', color: '#818cf8', count: 5, value: '$81k',
  deals: [
  { id: 4, company: 'Pivot Studio', value: '$22,500', owner: 'SC', ownerColor: '#3b82f6', tag: 'Proposal sent', tagBg: 'bg-amber-500/15', tagFg: 'text-amber-300', age: '3d', score: 'warm' },
  { id: 5, company: 'Atlas Consult', value: '$18,000', owner: 'MR', ownerColor: '#f59e0b', tag: 'Demo done', tagBg: 'bg-brand-500/15', tagFg: 'text-brand-300', age: '4d', score: 'warm' }]
},
{ key: 'proposal', name: 'Proposal', color: '#a78bfa', count: 4, value: '$67k',
  deals: [
  { id: 6, company: 'Summit Digital', value: '$31,000', owner: 'JK', ownerColor: '#8b5cf6', tag: 'Negotiating', tagBg: 'bg-orange-500/15', tagFg: 'text-orange-300', age: '1d', score: 'hot' },
  { id: 7, company: 'Nova Growth', value: '$15,500', owner: 'RL', ownerColor: '#10b981', tag: 'Review', tagBg: 'bg-pink-500/15', tagFg: 'text-pink-300', age: '2d', score: 'warm' }]
},
{ key: 'negotiation', name: 'Negotiation', color: '#fbbf24', count: 3, value: '$58k',
  deals: [
  { id: 8, company: 'Kapoor & Assoc', value: '$28,000', owner: 'MR', ownerColor: '#f59e0b', tag: 'Contract sent', tagBg: 'bg-amber-500/15', tagFg: 'text-amber-300', age: 'today', score: 'hot' }]
},
{ key: 'won', name: 'Won', color: '#34d399', count: 11, value: '$134k',
  deals: [
  { id: 9, company: 'Forge & Co', value: '$44,000', owner: 'SC', ownerColor: '#3b82f6', tag: 'Won 🎉', tagBg: 'bg-emerald-500/15', tagFg: 'text-emerald-300', age: '2h', score: 'won' },
  { id: 10, company: 'Barrett Digital', value: '$22,000', owner: 'JK', ownerColor: '#8b5cf6', tag: 'Won 🎉', tagBg: 'bg-emerald-500/15', tagFg: 'text-emerald-300', age: '1d', score: 'won' }]
}];


// ── Pipeline Page (real content) ─────────────────────────────────────────────
function PipelinePageInner({ goTo }) {
  const METRICS = [
  { label: 'Pipeline', value: '$324k', delta: '+12%', up: true, Icon: I.GitBranch, colors: 'bg-brand-500/10 border-brand-500/20 text-brand-300' },
  { label: 'Won', value: '$134k', delta: '+31%', up: true, Icon: I.TrendUp, colors: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
  { label: 'Avg deal', value: '$11.5k', delta: '+4%', up: true, Icon: I.BarChart, colors: 'bg-violet-500/10 border-violet-500/20 text-violet-300' },
  { label: 'Win rate', value: '68%', delta: '-2%', up: false, Icon: I.Target, colors: 'bg-amber-500/10 border-amber-500/20 text-amber-300' }];


  return (
    <div className="h-full flex" style={{ background: '#09091a' }}>
      <AppSidebar active="pipeline" goTo={goTo} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Sales Pipeline" subtitle="Q2 2026 · 28 open deals · $324k total"
        rightSlot={<>
            <div className="hidden md:inline-flex items-center gap-2 rounded-xl bg-brand-500/[0.08] border border-brand-500/20 px-3 py-1.5">
              <I.Target size={13} className="text-brand-300" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-[0.14em] text-brand-300/70 font-semibold">Forecast</span>
                <span className="text-[13px] font-bold text-white tabular-nums">$218k <span className="text-brand-300/80 font-medium text-[11px]">weighted</span></span>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-white/70 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] transition-all"><I.Filter size={13} />Filter</button>
            <button onClick={() => goTo('add-deal')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all"><I.Plus size={14} stroke={2.4} />New Deal</button>
          </>} />
        

        {/* Metric strip */}
        <div className="shrink-0 border-b border-white/[0.05] px-7 py-3 flex items-center gap-3 overflow-x-auto scroll-area" style={{ background: '#09091a' }}>
          {METRICS.map((m) =>
          <div key={m.label} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-all shrink-0">
              <div className={['w-7 h-7 rounded-lg flex items-center justify-center border', m.colors].join(' ')}><m.Icon size={13} /></div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-semibold">{m.label}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[16px] font-bold text-white tabular-nums">{m.value}</span>
                  <span className={['text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5', m.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'].join(' ')}>
                    {m.up ? <I.TrendUp size={8} stroke={2.6} /> : <I.TrendDown size={8} stroke={2.6} />}{m.delta}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden scroll-area">
          <div className="h-full p-6 flex gap-4 min-w-max">
            {STAGES_DATA.map((stage) =>
            <div key={stage.key} className="w-[290px] shrink-0 flex flex-col rounded-2xl bg-white/[0.018] border border-white/[0.05] overflow-hidden">
                {/* Column header */}
                <div className="px-4 py-3.5 border-b border-white/[0.05] sticky top-0 z-10" style={{ background: 'rgba(11,11,24,0.80)', backdropFilter: 'blur(12px)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: stage.color, boxShadow: `0 0 12px ${stage.color}80` }} />
                      <span className="text-[13px] font-semibold text-white" style={{ fontFamily: "Roboto" }}>{stage.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/55 font-mono">{stage.count}</span>
                    </div>
                    <button className="w-6 h-6 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all"><I.More size={13} /></button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[12px] font-bold text-white tabular-nums">{stage.value}</span>
                    {stage.key === 'won' && <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1"><I.Sparkles size={10} />+31% MoM</span>}
                  </div>
                </div>
                {/* Cards */}
                <div className="flex-1 overflow-y-auto scroll-area p-3 flex flex-col gap-2.5 min-h-[120px]">
                  {stage.deals.map((d) =>
                <button key={d.id} onClick={() => goTo('deal-detail')}
                className="deal-card w-full rounded-xl bg-white/[0.035] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] p-3.5 text-left group cursor-grab">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[13px] font-semibold text-white leading-tight">{d.company}</p>
                        <span className="text-[14px] font-bold text-white tabular-nums">{d.value}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium', d.tagBg, d.tagFg].join(' ')}>{d.tag}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.score === 'hot' ? '#f87171' : d.score === 'warm' ? '#fbbf24' : d.score === 'won' ? '#34d399' : '#94a3b8' }} />
                          {d.age}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: d.ownerColor }}>{d.owner}</div>
                          <span className="text-[10px] text-white/50">{d.owner}</span>
                        </div>
                        <I.ArrowRight size={10} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                )}
                  <button onClick={() => goTo('add-deal')} className="border border-dashed border-white/[0.10] hover:border-white/[0.22] hover:bg-white/[0.02] rounded-xl py-3 text-[11px] text-white/35 hover:text-white/65 transition-all flex items-center justify-center gap-1.5">
                    <I.Plus size={11} stroke={2.4} />Add deal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <AppFooter note="Drag deals between stages to move them" />
      </div>
    </div>);

}

// ── Deal Detail ───────────────────────────────────────────────────────────────
const DEAL_STAGE_ORDER = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
const DEAL_STAGE_COLOR = { Prospecting: '#94a3b8', Qualified: '#818cf8', Proposal: '#a78bfa', Negotiation: '#fbbf24', Won: '#34d399' };

function DealDetailPage({ goTo }) {
  const [stage, setStage] = React.useState('Proposal');
  const stageIdx = DEAL_STAGE_ORDER.indexOf(stage);
  const nextStage = DEAL_STAGE_ORDER[stageIdx + 1];
  const color = DEAL_STAGE_COLOR[stage];

  return (
    <div className="h-full flex" style={{ background: '#07070f' }}>
      <AppSidebar active="pipeline" goTo={goTo} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 border-b border-white/[0.05] px-7 py-3.5 flex items-center justify-between" style={{ background: '#09091a' }}>
          <div className="flex items-center gap-2 text-[13px]">
            <button onClick={() => goTo('pipeline')} className="text-white/45 hover:text-white transition-colors flex items-center gap-1.5"><I.ChevronLeft size={12} />Pipeline</button>
            <I.ChevronRight size={12} className="text-white/25" />
            <span className="text-white font-semibold">Summit Digital</span>
          </div>
          <div className="flex items-center gap-2">
            {nextStage &&
            <button onClick={() => setStage(nextStage)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">
                Move to {nextStage}<I.ArrowRight size={13} stroke={2.4} />
              </button>
            }
            <button className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all"><I.More size={14} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 items-start">

            {/* Deal info */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-white text-[24px] font-black">Summit Digital</h2>
                    <p className="text-white text-[32px] font-black tabular-nums mt-1">$31,000</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ring-1" style={{ background: `${color}18`, color, boxShadow: `0 0 0 1px ${color}40` }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />{stage}
                  </span>
                </div>

                {/* Stage progress */}
                <div className="flex items-center gap-2 mb-6">
                  {DEAL_STAGE_ORDER.map((s, i) => {
                    const done = i <= stageIdx;
                    return (
                      <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={['w-2 h-2 rounded-full transition-all', done ? '' : 'bg-white/[0.08]'].join(' ')} style={done ? { background: DEAL_STAGE_COLOR[s], boxShadow: `0 0 8px ${DEAL_STAGE_COLOR[s]}80` } : {}} />
                          <span className={['text-[9px] font-semibold whitespace-nowrap', done ? 'text-white/70' : 'text-white/25'].join(' ')}>{s}</span>
                        </div>
                        {i < 4 && <div className={['flex-1 h-px transition-all mb-3', done && i < stageIdx ? 'bg-brand-500' : 'bg-white/[0.06]'].join(' ')} />}
                      </React.Fragment>);

                  })}
                </div>

                {[
                { l: 'Close date', v: 'Jun 28, 2026' },
                { l: 'Probability', v: '80%' },
                { l: 'Owner', v: 'Jamie Kim' },
                { l: 'Source', v: 'Inbound' }].
                map((r) =>
                <div key={r.l} className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <span className="text-[12px] text-white/50">{r.l}</span>
                    <span className="text-[13px] font-semibold text-white">{r.v}</span>
                  </div>
                )}
              </div>

              {/* Linked contact */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.14em] mb-3">Linked Contact</p>
                <button onClick={() => goTo('contact-detail')} className="flex items-center gap-3 hover:bg-white/[0.03] rounded-xl p-2 -mx-2 transition-colors w-full text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#8b5cf6' }}>JR</div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">James Rivera</p>
                    <p className="text-[11px] text-white/50">CEO · Summit Digital</p>
                  </div>
                  <I.ArrowRight size={12} className="text-white/25 ml-auto" />
                </button>
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <p className="text-white font-semibold mb-5">Deal Activity</p>
              {[
              { label: 'EMAIL SENT', title: 'Proposal sent to James', time: '1d ago', body: 'Attached the 3-page proposal PDF. Proposal includes Q3 scope, pricing, and 90-day roadmap.', chipBg: 'bg-brand-500/15 ring-brand-500/25 text-brand-300', Icon: I.Send, ic: '#818cf8' },
              { label: 'NOTE', title: 'Called James, positive signals', time: '3d ago', body: 'He mentioned budget is approved and team is comparing two vendors. Decision by Jun 28.', chipBg: 'bg-amber-500/15 ring-amber-500/25 text-amber-300', Icon: I.Note, ic: '#fbbf24' },
              { label: 'PIPELINE', title: 'Deal moved to Proposal', time: '5d ago', body: 'Moved from Qualified after demo call.', chipBg: 'bg-violet-500/15 ring-violet-500/25 text-violet-300', Icon: I.GitBranch, ic: '#a78bfa' }].
              map((e, i, arr) =>
              <div key={i} className="relative pl-11 pb-5">
                  {i < arr.length - 1 && <div className="absolute left-[18px] top-9 bottom-0 w-px bg-white/[0.06]" />}
                  <div className="absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(15,15,28,0.85)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' }}>
                    <span style={{ color: e.ic }}><e.Icon size={14} /></span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={['text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ring-1', e.chipBg].join(' ')}>{e.label}</span>
                    <span className="text-[11px] text-white/35">{e.time}</span>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <p className="text-[13px] font-semibold text-white">{e.title}</p>
                    <p className="text-[12px] text-white/55 mt-1.5 leading-relaxed">{e.body}</p>
                  </div>
                </div>
              )}

              {/* Quick note */}
              <div className="mt-2 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                <textarea rows={2} placeholder="Add a deal note…" className="w-full bg-transparent outline-none resize-none text-[12px] text-white placeholder:text-white/30" />
                <div className="flex justify-end mt-1.5">
                  <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Add note</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>);

}

// ── Add Deal ──────────────────────────────────────────────────────────────────
function AddDealPage({ goTo }) {
  return (
    <div className="h-full flex" style={{ background: '#07070f' }}>
      <AppSidebar active="pipeline" goTo={goTo} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 border-b border-white/[0.05] px-7 py-3.5 flex items-center justify-between" style={{ background: '#09091a' }}>
          <div className="flex items-center gap-2 text-[13px]">
            <button onClick={() => goTo('pipeline')} className="text-white/45 hover:text-white transition-colors">Pipeline</button>
            <I.ChevronRight size={12} className="text-white/25" />
            <span className="text-white font-semibold">New deal</span>
          </div>
          <button onClick={() => goTo('pipeline')} className="text-white/40 hover:text-white"><I.X size={16} /></button>
        </header>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-lg mx-auto">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-7">
              <h2 className="text-white text-[22px] font-bold mb-6">New deal</h2>
              <div className="flex flex-col gap-4 mb-6">
                {[['Deal name', 'text', 'e.g. Q3 Retainer — Bloom Creative'], ['Company', 'text', 'Search or add…'], ['Deal value', 'number', '$0'], ['Close date', 'date', '']].map(([l, t, pl]) =>
                <div key={l}><label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{l}</label>
                    <input type={t} placeholder={pl} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40" />
                  </div>
                )}
                <div><label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Stage</label>
                  <select className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40 appearance-none">
                    {DEAL_STAGE_ORDER.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => goTo('pipeline')} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
                <button onClick={() => goTo('deal-detail')} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Create deal</button>
              </div>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>);

}

Object.assign(window, { PipelinePage, DealDetailPage, AddDealPage, STAGES_DATA });