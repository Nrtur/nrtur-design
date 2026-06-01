// ─── pages-calls.jsx ── Calls list + Log Call modal ──────────────────────────

const CALLS_DATA = [
  {id:1, contact:'Sarah Chen',    company:'Meridian Agency', avatar:'SC', color:'#3b82f6', direction:'in',  duration:'14:32', date:'Today 2:14 PM',    outcome:'Left voicemail',        notes:''},
  {id:2, contact:'James Rivera',  company:'Summit Digital',  avatar:'JR', color:'#8b5cf6', direction:'out', duration:'8:07',  date:'Today 10:45 AM',   outcome:'Discussed contract',    notes:'Ready to sign pending legal review.'},
  {id:3, contact:'Priya Nair',    company:'Atlas Consult',   avatar:'PN', color:'#a855f7', direction:'in',  duration:'22:18', date:'Yesterday 4:32 PM',outcome:'Demo call',             notes:'Very interested, sending proposal EOD.'},
  {id:4, contact:'Marcus Rios',   company:'Kapoor & Assoc',  avatar:'MR', color:'#f59e0b', direction:'out', duration:'3:45',  date:'Yesterday 11:20 AM',outcome:'No answer',            notes:''},
  {id:5, contact:'Emily Tran',    company:'Forge & Co',      avatar:'ET', color:'#14b8a6', direction:'out', duration:'31:04', date:'May 29, 3:00 PM',  outcome:'Renewal discussion',    notes:'Happy customer, upgraded to Business.'},
  {id:6, contact:'Luca Bianchi',  company:'Nova Growth',     avatar:'LB', color:'#6366f1', direction:'in',  duration:'5:52',  date:'May 28, 1:15 PM',  outcome:'Introduction call',     notes:'Referred by Mateo. High potential.'},
  {id:7, contact:'Maria Lopez',   company:'Bloom Creative',  avatar:'ML', color:'#ec4899', direction:'out', duration:'11:40', date:'May 27, 9:00 AM',  outcome:'Reached — follow-up',   notes:'Send updated pricing deck.'},
  {id:8, contact:'Ravi Lee',      company:'Vertex Labs',     avatar:'RL', color:'#10b981', direction:'out', duration:'0:00',  date:'May 26, 4:05 PM',  outcome:'No answer',             notes:''},
];

// ── Log Call Modal ────────────────────────────────────────────────────────────
function LogCallModal({ close }) {
  const [direction, setDirection] = React.useState('out');
  const [contact,   setContact]   = React.useState('');
  const [duration,  setDuration]  = React.useState('');
  const [outcome,   setOutcome]   = React.useState('');
  const [notes,     setNotes]     = React.useState('');

  React.useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [close]);

  const CONTACT_LIST = ['Sarah Chen','James Rivera','Maria Lopez','Ravi Lee','Marcus Rios','Emily Tran','Luca Bianchi','Priya Nair'];
  const OUTCOMES     = ['Reached — positive','Reached — follow-up needed','Left voicemail','No answer','Wrong number','Demo call','Contract discussion','Renewal discussion'];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center"
         style={{background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)'}}>
      <div style={{width:460, background:'rgba(13,13,26,0.97)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(24px)', boxShadow:'0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.65)', padding:24}}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/25 flex items-center justify-center text-brand-300">
              <I.Phone size={16}/>
            </div>
            <div>
              <p className="text-white text-[15px] font-bold">Log a call</p>
              <p className="text-white/45 text-[12px]">Record call details for a contact.</p>
            </div>
          </div>
          <button onClick={close} className="text-white/40 hover:text-white transition-colors"><I.X size={16}/></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Contact */}
          <div>
            <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Contact</label>
            <select value={contact} onChange={e=>setContact(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white/80 outline-none focus:border-brand-500/40 appearance-none">
              <option value="">Select a contact…</option>
              {CONTACT_LIST.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Direction</label>
            <div className="flex gap-2">
              {[{v:'out',l:'↗ Outbound'},{v:'in',l:'↙ Inbound'}].map(({v,l})=>(
                <button key={v} onClick={()=>setDirection(v)}
                  className={['flex-1 py-2.5 rounded-xl text-[13px] font-medium border transition-all',
                    direction===v?'bg-brand-500/15 text-brand-200 border-brand-500/30':'bg-white/[0.04] text-white/55 border-white/[0.08] hover:border-white/[0.18]'].join(' ')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Duration + Outcome */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Duration</label>
              <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="e.g. 12:30"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40 font-mono placeholder:text-white/25"/>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Outcome</label>
              <select value={outcome} onChange={e=>setOutcome(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white/80 outline-none focus:border-brand-500/40 appearance-none">
                <option value="">Select…</option>
                {OUTCOMES.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
              placeholder="What was discussed?"
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/25 outline-none focus:border-brand-500/40 resize-none"/>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={close} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
          <button onClick={close} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand border-none transition-all">Save call</button>
        </div>
      </div>
    </div>
  );
}

// ── Calls Page ────────────────────────────────────────────────────────────────
function CallsPage({ goTo }) {
  const [logModal, setLogModal] = React.useState(false);
  const COL = '1.6fr 1.3fr 80px 80px 150px 1fr 40px';

  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="calls" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Calls" subtitle={`${CALLS_DATA.length} logged · 2 today`}
          rightSlot={
            <button onClick={()=>setLogModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all">
              <I.Plus size={14} stroke={2.4}/>Log Call
            </button>
          }
          noSearch
        />

        {/* Stats strip */}
        <div className="shrink-0 px-7 py-3 border-b border-white/[0.05] flex items-center gap-6" style={{background:'#09091a'}}>
          {[
            {label:'Total',    val:'8',    color:'text-white'},
            {label:'Outbound', val:'5',    color:'text-violet-300'},
            {label:'Inbound',  val:'3',    color:'text-blue-300'},
            {label:'Avg duration', val:'12:08', color:'text-white'},
            {label:'No answer',    val:'2',     color:'text-amber-300'},
          ].map(s=>(
            <div key={s.label} className="flex items-center gap-2">
              <span className={['text-[15px] font-bold tabular-nums', s.color].join(' ')}>{s.val}</span>
              <span className="text-[11px] text-white/40">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scroll-area">
          {/* Table header */}
          <div className="sticky top-0 z-10 grid items-center gap-4 px-7 py-3 border-b border-white/[0.05] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
               style={{gridTemplateColumns:COL, background:'rgba(9,9,26,0.90)', backdropFilter:'blur(12px)'}}>
            <span>Contact</span><span>Company</span><span>Type</span><span>Duration</span><span>Date</span><span>Outcome</span><span/>
          </div>

          {CALLS_DATA.map((call, i) => (
            <div key={call.id}
                 className={['grid items-center gap-4 px-7 py-4 hover:bg-white/[0.025] transition-colors group cursor-pointer',
                   i < CALLS_DATA.length-1 ? 'border-b border-white/[0.03]' : ''].join(' ')}
                 style={{gridTemplateColumns:COL}}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:call.color}}>{call.avatar}</div>
                <p className="text-[13px] font-semibold text-white truncate">{call.contact}</p>
              </div>
              <p className="text-[12px] text-white/65 truncate">{call.company}</p>
              <span className={['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 w-fit',
                call.direction==='in'?'bg-blue-500/12 text-blue-300 ring-blue-500/25':'bg-violet-500/12 text-violet-300 ring-violet-500/25'].join(' ')}>
                {call.direction==='in'?'↙ In':'↗ Out'}
              </span>
              <p className={['text-[13px] font-mono tabular-nums', call.duration==='0:00'?'text-white/30':'text-white/80'].join(' ')}>{call.duration}</p>
              <p className="text-[12px] text-white/55">{call.date}</p>
              <p className="text-[12px] text-white/70 truncate">{call.outcome||<span className="text-white/25 italic">—</span>}</p>
              <button className="text-white/20 opacity-0 group-hover:opacity-100 hover:text-white/60 transition-all ml-auto">
                <I.More size={14}/>
              </button>
            </div>
          ))}
        </div>
        <AppFooter note="8 calls this week"/>
      </div>
      {logModal && <LogCallModal close={()=>setLogModal(false)}/>}
    </div>
  );
}

Object.assign(window, { CallsPage });
