// ─── shared.jsx ── icons, sidebar, topbar, overlays, skeletons, dev nav ───────

// Inject shimmer keyframes once
(function(){
  if(document.getElementById('nrtur-shimmer'))return;
  const s=document.createElement('style');s.id='nrtur-shimmer';
  s.textContent='@keyframes nrturShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}';
  document.head.appendChild(s);
})();

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = ({ d, size=16, stroke=2, className='', fill, style:sx }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill||'none'}
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={sx}>{d}</svg>;

const I = {
  LayoutDash: (p)=><Ico {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>}/>,
  Users:      (p)=><Ico {...p} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}/>,
  GitBranch:  (p)=><Ico {...p} d={<><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></>}/>,
  Mail:       (p)=><Ico {...p} d={<><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></>}/>,
  Zap:        (p)=><Ico {...p} d={<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}/>,
  BarChart:   (p)=><Ico {...p} d={<><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>}/>,
  Settings:   (p)=><Ico {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>}/>,
  Plus:       (p)=><Ico {...p} d={<><path d="M5 12h14"/><path d="M12 5v14"/></>}/>,
  X:          (p)=><Ico {...p} d={<><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></>}/>,
  Check:      (p)=><Ico {...p} d={<path d="M20 6 9 17l-5-5"/>}/>,
  ArrowRight: (p)=><Ico {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>}/>,
  ChevronLeft:(p)=><Ico {...p} d={<polyline points="15 18 9 12 15 6"/>}/>,
  ChevronRight:(p)=><Ico {...p} d={<polyline points="9 18 15 12 9 6"/>}/>,
  ChevronDown:(p)=><Ico {...p} d={<polyline points="6 9 12 15 18 9"/>}/>,
  Bell:       (p)=><Ico {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>}/>,
  Search:     (p)=><Ico {...p} d={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>}/>,
  More:       (p)=><Ico {...p} d={<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>}/>,
  Phone:      (p)=><Ico {...p} d={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>}/>,
  MapPin:     (p)=><Ico {...p} d={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>}/>,
  Building:   (p)=><Ico {...p} d={<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></>}/>,
  Clock:      (p)=><Ico {...p} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>,
  UserCog:    (p)=><Ico {...p} d={<><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="18" cy="15" r="3"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/></>}/>,
  UserPlus:   (p)=><Ico {...p} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>}/>,
  Send:       (p)=><Ico {...p} d={<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>}/>,
  CheckSquare:(p)=><Ico {...p} d={<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}/>,
  Hash:       (p)=><Ico {...p} d={<><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></>}/>,
  Flag:       (p)=><Ico {...p} d={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></>}/>,
  Note:       (p)=><Ico {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></>}/>,
  Download:   (p)=><Ico {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>}/>,
  Dollar:     (p)=><Ico {...p} d={<><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}/>,
  Target:     (p)=><Ico {...p} d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>}/>,
  Calendar:   (p)=><Ico {...p} d={<><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></>}/>,
  TrendUp:    (p)=><Ico {...p} d={<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>}/>,
  TrendDown:  (p)=><Ico {...p} d={<><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>}/>,
  Sparkles:   (p)=><Ico {...p} d={<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>}/>,
  CreditCard: (p)=><Ico {...p} d={<><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></>}/>,
  ShieldCheck:(p)=><Ico {...p} d={<><path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/></>}/>,
  Lock:       (p)=><Ico {...p} d={<><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>,
  LifeBuoy:   (p)=><Ico {...p} d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></>}/>,
  Trophy:     (p)=><Ico {...p} d={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>}/>,
  Star:       (p)=><Ico {...p} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}/>,
  Eye:        (p)=><Ico {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>,
  Grip:       (p)=><Ico {...p} d={<><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></>}/>,
  Filter:     (p)=><Ico {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>}/>,
  Upload:     (p)=><Ico {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></>}/>,
  Edit:       (p)=><Ico {...p} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>,
  Play:       (p)=><Ico {...p} d={<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/>}/>,
  Inbox:      (p)=><Ico {...p} d={<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>}/>,
  Reply:      (p)=><Ico {...p} d={<><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></>}/>,
  Plug:       (p)=><Ico {...p} d={<><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z"/><path d="M12 17a3 3 0 0 1-3-3v-2h6v2a3 3 0 0 1-3 3z"/></>}/>,
  Globe:      (p)=><Ico {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}/>,
  Home:       (p)=><Ico {...p} d={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>,
  Trash:      (p)=><Ico {...p} d={<><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>}/>,
  Layers:     (p)=><Ico {...p} d={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>}/>,
  SliderH:    (p)=><Ico {...p} d={<><line x1="21" y1="6" x2="3" y2="6"/><path d="M17 12H3"/><line x1="15" y1="18" x2="3" y2="18"/><circle cx="17" cy="6" r="2" fill="currentColor"/><circle cx="9" cy="12" r="2" fill="currentColor"/><circle cx="21" cy="18" r="2" fill="currentColor"/></>}/>,
  Ban:        (p)=><Ico {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>}/>,
};

// ── Skeleton primitive ─────────────────────────────────────────────────────────
function Skel({ w, h='11px', r='5px', s={} }) {
  return <div style={{
    width:w, height:h, borderRadius:r, flexShrink:0,
    background:'linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.09) 40%,rgba(255,255,255,0.04) 80%)',
    backgroundSize:'200% 100%',
    animation:'nrturShimmer 1.7s ease-in-out infinite',
    ...s
  }}/>;
}

function useSkeleton(delay=1100) {
  const [loading,setLoading]=React.useState(true);
  React.useEffect(()=>{const t=setTimeout(()=>setLoading(false),delay);return()=>clearTimeout(t);},[]);
  return loading;
}

// ── Confirm modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ title, body, confirmLabel='Delete', danger=true, onConfirm, onCancel }) {
  React.useEffect(()=>{
    const fn=(e)=>{if(e.key==='Escape')onCancel();};
    document.addEventListener('keydown',fn);
    return()=>document.removeEventListener('keydown',fn);
  },[onCancel]);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center"
         style={{background:'rgba(0,0,0,0.72)',backdropFilter:'blur(8px)'}}>
      <div style={{width:400,background:'rgba(13,13,26,0.97)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,backdropFilter:'blur(24px)',boxShadow:'0 0 0 1px rgba(255,255,255,0.04),0 32px 80px rgba(0,0,0,0.65)',padding:24}}>
        <div className="flex items-start gap-4 mb-6">
          <div className={['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1',
            danger?'bg-red-500/10 ring-red-500/25':'bg-brand-500/10 ring-brand-500/25'].join(' ')}>
            {danger
              ? <I.Trash size={17} sx={{color:'#f87171'}}/>
              : <I.Sparkles size={17} sx={{color:'#818cf8'}}/>}
          </div>
          <div>
            <p className="text-white text-[15px] font-bold leading-snug">{title}</p>
            <p className="text-white/55 text-[13px] mt-2 leading-relaxed">{body}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
          {danger
            ? <button onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white border-none cursor-pointer transition-all"
                style={{background:'#dc2626'}}
                onMouseOver={e=>e.currentTarget.style.background='#b91c1c'}
                onMouseOut={e=>e.currentTarget.style.background='#dc2626'}>{confirmLabel}</button>
            : <button onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 border-none cursor-pointer transition-all">{confirmLabel}</button>
          }
        </div>
      </div>
    </div>
  );
}

function useConfirm() {
  const [cfg,setCfg]=React.useState(null);
  const openConfirm=React.useCallback((opts)=>setCfg(opts),[]);
  const close=React.useCallback(()=>setCfg(null),[]);
  const confirmNode=cfg?(
    <ConfirmModal {...cfg}
      onCancel={close}
      onConfirm={()=>{cfg.onConfirm?.();close();}}
    />
  ):null;
  return {confirmNode,openConfirm};
}

// ── Global Search Overlay ──────────────────────────────────────────────────────
function GlobalSearchOverlay({ close, goTo }) {
  const [query,setQuery]=React.useState('');
  const inputRef=React.useRef(null);
  React.useEffect(()=>{setTimeout(()=>inputRef.current?.focus(),60);},[]);
  React.useEffect(()=>{
    const fn=(e)=>{if(e.key==='Escape')close();};
    document.addEventListener('keydown',fn);
    return()=>document.removeEventListener('keydown',fn);
  },[close]);

  const CONTACTS=[
    {name:'Marcus Chen',    role:'CTO · Forge & Co',            color:'#3b82f6'},
    {name:'Maya Rodriguez', role:'Head of Sales · Pivot Studio', color:'#10b981'},
    {name:'Martin Liu',     role:'Founder · Loop Labs',          color:'#f59e0b'},
  ];
  const DEALS=[
    {name:'Managed CRM rollout',   val:'$24,000', page:'deal-detail'},
    {name:'Marketing automation',  val:'$11,500', page:'deal-detail'},
  ];
  const PAGES=[
    {label:'Dashboard',page:'dashboard'},
    {label:'Pipeline', page:'pipeline'},
    {label:'Reports',  page:'reports'},
    {label:'Settings', page:'settings-general'},
  ];

  const row={display:'flex',alignItems:'center',gap:12,padding:'9px 10px',borderRadius:8,cursor:'pointer',border:'none',textAlign:'left',fontFamily:'inherit',background:'transparent',transition:'background .1s',width:'100%'};

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center"
         style={{background:'rgba(7,7,15,0.92)',backdropFilter:'blur(10px)'}}
         onClick={e=>{if(e.target===e.currentTarget)close();}}>
      <div style={{position:'absolute',bottom:24,right:28,fontSize:11,color:'rgba(255,255,255,0.28)',fontFamily:'monospace'}}>ESC to close</div>
      <div style={{width:'100%',maxWidth:620,marginTop:96,padding:'0 20px',display:'flex',flexDirection:'column',gap:16}}>
        {/* Input */}
        <div style={{position:'relative'}}>
          <div style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',pointerEvents:'none'}}>
            <I.Search size={16}/>
          </div>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search contacts, deals, automations…"
            style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(99,102,241,0.40)',borderRadius:12,padding:'15px 52px 15px 46px',fontSize:15,color:'#fff',fontFamily:'inherit',outline:'none',boxShadow:'0 0 0 3px rgba(99,102,241,0.12)',boxSizing:'border-box'}}/>
          <button onClick={e=>{e.stopPropagation();close();window.__nrturOpenCmd?.();}}
            style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.35)',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:5,padding:'2px 7px',cursor:'pointer'}}>⌘K</button>
        </div>

        {/* Results panel */}
        <div style={{background:'rgba(11,11,24,0.97)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.5)'}}>
          {/* Contacts */}
          <div style={{padding:'7px 12px 3px',fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.32)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>Contacts</div>
          <div style={{padding:'5px 8px'}}>
            {CONTACTS.map((c,i)=>(
              <button key={c.name} onClick={()=>{goTo('contact-detail');close();}}
                style={{...row,background:i===0?'rgba(99,102,241,0.10)':'transparent'}}
                onMouseOver={e=>{if(i!==0)e.currentTarget.style.background='rgba(255,255,255,0.04)';}}
                onMouseOut={e=>{if(i!==0)e.currentTarget.style.background='transparent';}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'white',flexShrink:0}}>{c.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.95)'}}>{c.name}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{c.role}</div>
                </div>
                {i===0&&<span style={{fontSize:11,color:'rgba(255,255,255,0.28)',fontFamily:'monospace'}}>↵</span>}
              </button>
            ))}
          </div>
          {/* Deals */}
          <div style={{padding:'7px 12px 3px',fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.32)',borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>Deals</div>
          <div style={{padding:'5px 8px'}}>
            {DEALS.map(d=>(
              <button key={d.name} onClick={()=>{goTo(d.page);close();}}
                style={row}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:32,height:32,borderRadius:8,background:'rgba(99,102,241,0.10)',border:'1px solid rgba(99,102,241,0.20)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <I.GitBranch size={13} sx={{color:'#818cf8'}}/>
                </div>
                <div style={{flex:1,fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.9)'}}>{d.name}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:500}}>{d.val}</div>
              </button>
            ))}
          </div>
          {/* Pages */}
          <div style={{padding:'7px 12px 3px',fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.32)',borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>Pages</div>
          <div style={{padding:'5px 8px'}}>
            {PAGES.map(p=>(
              <button key={p.label} onClick={()=>{goTo(p.page);close();}}
                style={row}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <I.LayoutDash size={12} sx={{color:'rgba(255,255,255,0.4)'}}/>
                </div>
                <div style={{flex:1,fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.72)'}}>{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent searches */}
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <I.Clock size={12} sx={{color:'rgba(255,255,255,0.32)',flexShrink:0}}/>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.32)'}}>Recent:</span>
          {['Forge & Co','Pipeline','Sarah K.'].map(s=>(
            <span key={s} onClick={()=>setQuery(s)}
              style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:6,padding:'3px 10px',fontSize:12,color:'rgba(255,255,255,0.5)',cursor:'pointer'}}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Command Palette ────────────────────────────────────────────────────────────
const CMD_ITEMS = [
  {group:'Navigate', label:'Dashboard',            page:'dashboard',          kbd:'⌘1'},
  {group:'Navigate', label:'Contacts',             page:'contacts',           kbd:'⌘2'},
  {group:'Navigate', label:'Pipeline',             page:'pipeline',           kbd:'⌘3'},
  {group:'Navigate', label:'Reports',              page:'reports',            kbd:'⌘4'},
  {group:'Navigate', label:'Settings',             page:'settings-general',   kbd:'⌘,'},
  {group:'Create',   label:'New Contact',          page:'add-contact',        kbd:'N C', accent:true},
  {group:'Create',   label:'New Deal',             page:'add-deal',           kbd:'N D', accent:true},
  {group:'Create',   label:'New Automation',       page:'automation-builder', kbd:'N A', accent:true},
  {group:'Recent',   label:'Forge & Co',           page:'contact-detail',     sub:'Contact'},
  {group:'Recent',   label:'Q3 Outbound campaign', page:'automation-builder', sub:'Automation'},
  {group:'Recent',   label:'Settings',             page:'settings-general',   sub:'Page'},
];

function CommandPalette({ close, goTo }) {
  const [query,setQuery]=React.useState('');
  const [sel,setSel]=React.useState(0);
  const inputRef=React.useRef(null);
  React.useEffect(()=>{setTimeout(()=>inputRef.current?.focus(),60);},[]);

  const filtered=React.useMemo(()=>
    query?CMD_ITEMS.filter(x=>x.label.toLowerCase().includes(query.toLowerCase())):CMD_ITEMS
  ,[query]);

  React.useEffect(()=>{setSel(0);},[query]);

  React.useEffect(()=>{
    const fn=(e)=>{
      if(e.key==='Escape'){close();return;}
      if(e.key==='ArrowDown'){e.preventDefault();setSel(s=>Math.min(s+1,filtered.length-1));}
      if(e.key==='ArrowUp'){e.preventDefault();setSel(s=>Math.max(s-1,0));}
      if(e.key==='Enter'){const item=filtered[sel];if(item){goTo(item.page);close();}}
    };
    document.addEventListener('keydown',fn);
    return()=>document.removeEventListener('keydown',fn);
  },[close,sel,filtered,goTo]);

  const GROUPS=['Navigate','Create','Recent'];

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center"
         style={{background:'rgba(7,7,15,0.85)',backdropFilter:'blur(10px)',paddingTop:100}}
         onClick={e=>{if(e.target===e.currentTarget)close();}}>
      <div style={{width:560,background:'rgba(11,11,24,0.98)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,boxShadow:'0 0 0 1px rgba(99,102,241,0.14),0 32px 80px rgba(0,0,0,0.75)',overflow:'hidden'}}>
        {/* Search bar */}
        <div style={{padding:'13px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <I.Search size={15} sx={{color:'rgba(255,255,255,0.38)',flexShrink:0}}/>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Type a command or search…"
            style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:14,color:'white',fontFamily:'inherit'}}/>
          <span style={{fontFamily:'monospace',fontSize:10,color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:4,padding:'2px 6px'}}>ESC</span>
        </div>

        {/* Results */}
        <div style={{padding:8,maxHeight:340,overflowY:'auto'}}>
          {GROUPS.map(group=>{
            const items=filtered.filter(x=>x.group===group);
            if(!items.length)return null;
            return (
              <React.Fragment key={group}>
                <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.32)',padding:'8px 12px 4px'}}>{group}</div>
                {items.map(item=>{
                  const globalIdx=filtered.indexOf(item);
                  const isSel=globalIdx===sel;
                  return (
                    <button key={item.label}
                      onClick={()=>{goTo(item.page);close();}}
                      onMouseEnter={()=>setSel(globalIdx)}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'9px 12px',borderRadius:8,cursor:'pointer',border:'none',textAlign:'left',fontFamily:'inherit',background:isSel?'rgba(99,102,241,0.12)':'transparent',transition:'background .1s'}}>
                      <div style={{width:28,height:28,borderRadius:7,background:item.accent?'rgba(99,102,241,0.10)':'rgba(255,255,255,0.04)',border:item.accent?'1px solid rgba(99,102,241,0.20)':'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',color:item.accent?'#818cf8':'rgba(255,255,255,0.4)',flexShrink:0}}>
                        {item.group==='Create'&&<I.Plus size={11} stroke={2.5}/>}
                        {item.group==='Navigate'&&<I.ArrowRight size={11} stroke={2}/>}
                        {item.group==='Recent'&&<I.Clock size={11} stroke={2}/>}
                      </div>
                      <span style={{flex:1,fontSize:13,color:isSel?'#fff':'rgba(255,255,255,0.75)'}}>{item.label}</span>
                      {item.sub&&<span style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>{item.sub}</span>}
                      {item.kbd&&<span style={{fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.35)',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:4,padding:'2px 6px'}}>{item.kbd}</span>}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer hints */}
        <div style={{padding:'8px 16px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:16,background:'rgba(255,255,255,0.01)'}}>
          {['↑↓ navigate','↵ select','ESC close'].map(h=>(
            <span key={h} style={{fontSize:11,color:'rgba(255,255,255,0.28)',fontFamily:'monospace'}}>{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AppSidebar({ active, goTo }) {
  const items = [
    { key:'dashboard',   Icon:I.LayoutDash, label:'Dashboard' },
    { key:'contacts',    Icon:I.Users,      label:'Contacts' },
    { key:'pipeline',    Icon:I.GitBranch,  label:'Pipeline' },
    { key:'email-inbox', Icon:I.Mail,       label:'Email' },
    { key:'automations', Icon:I.Zap,        label:'Automations' },
    { key:'reports',     Icon:I.BarChart,   label:'Reports' },
  ];
  const inAutoSection = active==='automations'||active==='automation-builder'||active==='sms-sequences';
  const settActive = active&&active.startsWith('settings');
  return (
    <aside className="w-14 shrink-0 flex flex-col items-center py-5 gap-1.5 border-r border-white/[0.05]" style={{background:'#07070f'}}>
      <button onClick={()=>goTo('dashboard')} className="mb-4 w-8 h-8 rounded-lg overflow-hidden shadow-brand shrink-0">
        <img src="assets/nrtur-mark.svg" width="32" height="32" alt="nrtur"/>
      </button>
      {items.map(({key,Icon,label})=>{
        const a = active===key||(key==='automations'&&inAutoSection);
        return (
          <React.Fragment key={key}>
            <button onClick={()=>goTo(key)} title={label}
              className={['w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150',
                a?'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/25 shadow-[0_0_18px_rgba(99,102,241,0.35)]':
                  'text-white/30 hover:text-white/70 hover:bg-white/[0.04]'].join(' ')}>
              <Icon size={16}/>
            </button>
            {/* Sequences sub-link under Automations */}
            {key==='automations'&&inAutoSection&&(
              <button onClick={()=>goTo('sms-sequences')} title="Sequences"
                className={['w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150',
                  active==='sms-sequences'?'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/25':
                    'text-white/25 hover:text-white/60 hover:bg-white/[0.04]'].join(' ')}
                style={{marginLeft:2}}>
                <I.Layers size={11}/>
              </button>
            )}
          </React.Fragment>
        );
      })}
      <div className="mt-auto flex flex-col items-center gap-3">
        <button onClick={()=>goTo('settings-general')} title="Settings"
          className={['w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150',
            settActive?'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/25 shadow-[0_0_18px_rgba(99,102,241,0.35)]':
              'text-white/30 hover:text-white/70 hover:bg-white/[0.04]'].join(' ')}>
          <I.Settings size={16}/>
        </button>
        <button onClick={()=>goTo('profile')} title="Profile"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/[0.06] hover:ring-white/20 transition-all" style={{background:'#3b82f6'}}>
          AM
        </button>
      </div>
    </aside>
  );
}

// ── Notification dropdown ──────────────────────────────────────────────────────
function NotifDropdown({ close, goTo }) {
  const [tab,setTab]=React.useState('all');
  const notifs=[
    {id:1,title:'Sarah Chen accepted proposal',sub:'Q3 Engagement · $24k',   time:'5m ago',  unread:true,  avatar:'SC',color:'#3b82f6'},
    {id:2,title:'Pipeline updated: Q2 forecast +18%',sub:'12 deals moved',  time:'2h ago',  unread:true,  avatar:'JK',color:'#8b5cf6'},
    {id:3,title:'New contact: Summit Digital added',sub:'By Jamie Kim',      time:'1d ago',  unread:false, avatar:'JK',color:'#10b981'},
    {id:4,title:'Automation run: 284 contacts enrolled',sub:'Welcome Sequence',time:'2d ago',unread:false, avatar:'A', color:'#f59e0b'},
  ];
  const visible=tab==='unread'?notifs.filter(n=>n.unread):notifs;
  const unreadCount=notifs.filter(n=>n.unread).length;
  return (
    <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden" style={{background:'rgba(13,13,26,0.97)',backdropFilter:'blur(24px)'}}>
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
        <p className="text-[13px] font-semibold text-white">Notifications</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-brand-300 font-medium cursor-pointer hover:text-brand-200">Mark all read</span>
          <button onClick={close} className="text-white/40 hover:text-white transition-colors"><I.X size={13}/></button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-white/[0.05] px-2 gap-0">
        {[{k:'all',l:'All'},{k:'unread',l:'Unread',count:unreadCount}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            className={['px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors flex items-center gap-1.5',
              tab===t.k?'border-brand-500 text-white':'border-transparent text-white/45 hover:text-white/75'].join(' ')}>
            {t.l}
            {t.count>0&&<span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{background:tab===t.k?'#6366f1':'rgba(255,255,255,0.08)',color:'white'}}>{t.count}</span>}
          </button>
        ))}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {visible.length===0?(
          <div className="py-12 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 mx-auto"><I.Bell size={16}/></div>
            <p className="text-[13px] font-medium text-white/50">All caught up</p>
            <p className="text-[11px] text-white/30">No notifications here.</p>
          </div>
        ):visible.map(n=>(
          <button key={n.id} className="w-full text-left px-4 py-3 hover:bg-white/[0.04] border-b border-white/[0.03] last:border-b-0 transition-colors">
            <div className="flex items-start gap-2.5">
              {n.unread?<span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0"/>:<span className="w-1.5 h-1.5 shrink-0"/>}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:n.color}}>{n.avatar}</div>
              <div className="min-w-0 flex-1">
                <p className={['text-[12px] leading-snug',n.unread?'text-white font-medium':'text-white/60'].join(' ')}>{n.title}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{n.sub}</p>
                <p className="text-[10px] text-white/30 mt-1">{n.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function AppTopbar({ goTo, title, subtitle, rightSlot, noSearch }) {
  const [notifOpen,setNotifOpen]=React.useState(false);
  const notifRef=React.useRef(null);
  React.useEffect(()=>{
    const fn=(e)=>{if(notifRef.current&&!notifRef.current.contains(e.target))setNotifOpen(false);};
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);
  return (
    <header className="shrink-0 border-b border-white/[0.05] px-7 py-3.5 flex items-center justify-between gap-6" style={{background:'#09091a'}}>
      <div className="min-w-0">
        {title&&<h1 className="text-white text-[22px] font-bold tracking-tight leading-tight">{title}</h1>}
        {subtitle&&<p className="text-white/50 text-[13px] mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        {rightSlot}
        {!noSearch&&(
          <button onClick={()=>window.__nrturOpenSearch?.()}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 border border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] hover:bg-white/[0.06] transition-all cursor-pointer"
            style={{width:152}}>
            <I.Search size={12} className="text-white/40 shrink-0"/>
            <span className="flex-1 text-[12px] text-white/30 text-left">Search…</span>
            <span onClick={e=>{e.stopPropagation();window.__nrturOpenCmd?.();}}
              className="text-[10px] font-mono text-white/25 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 shrink-0 hover:text-brand-300 hover:bg-brand-500/10 hover:border-brand-500/20 transition-all">
              ⌘K
            </span>
          </button>
        )}
        <div ref={notifRef} className="relative">
          <button onClick={()=>setNotifOpen(!notifOpen)}
            className={['w-9 h-9 rounded-xl flex items-center justify-center transition-all relative',
              notifOpen?'bg-white/[0.08] text-brand-300':'text-white/45 hover:text-white hover:bg-white/[0.06]'].join(' ')}>
            <I.Bell size={14}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-400"/>
          </button>
          {notifOpen&&<NotifDropdown close={()=>setNotifOpen(false)} goTo={goTo}/>}
        </div>
        <button onClick={()=>goTo('profile')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold ring-1 ring-white/[0.06] hover:ring-white/20 transition-all" style={{background:'#3b82f6'}}>
          AM
        </button>
      </div>
    </header>
  );
}

// ── Status Footer ─────────────────────────────────────────────────────────────
function AppFooter({ note }) {
  return (
    <div className="shrink-0 border-t border-white/[0.05] px-7 py-2 flex items-center justify-between" style={{background:'#07070f'}}>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{animation:'glowPulse 3s ease-in-out infinite'}}/>
        <span className="text-[11px] text-white/40">All systems operational</span>
      </div>
      <div className="flex items-center gap-3">
        {note&&<span className="text-[11px] text-white/30">{note}</span>}
        <span className="text-[11px] text-white/30">3 team members online</span>
        <div className="flex">
          {['#3b82f6','#8b5cf6','#10b981'].map((c,i)=>(
            <span key={i} className="w-4 h-4 rounded-full" style={{background:c,marginLeft:i===0?0:-6,border:'2px solid #07070f'}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button onClick={()=>onChange(!on)} role="switch" aria-checked={on}
      className={['relative w-10 h-6 rounded-full transition-all duration-200 shrink-0',
        on?'bg-brand-500 shadow-[0_0_0_3px_rgba(99,102,241,0.18),0_0_20px_rgba(99,102,241,0.35)]':
           'bg-white/[0.08] ring-1 ring-white/[0.08]'].join(' ')}>
      <span className={['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200',
        on?'left-[18px]':'left-0.5 bg-white/80'].join(' ')}/>
    </button>
  );
}

// ── Toast system ──────────────────────────────────────────────────────────────
function useToast() {
  const [toasts,setToasts]=React.useState([]);
  const addToast=React.useCallback((msg,type='success')=>{
    const id=Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  },[]);
  return {toasts,addToast};
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map(t=>(
        <div key={t.id} className={['inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-medium shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm',
          t.type==='success'?'bg-emerald-500/12 text-emerald-200 border border-emerald-500/25':
                             'bg-brand-500/12 text-brand-200 border border-brand-500/25'].join(' ')}
          style={{animation:'fadeUp 300ms ease-out both'}}>
          {t.type==='success'?<I.Check size={14} stroke={2.4}/>:<I.Bell size={14}/>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Glow Background ───────────────────────────────────────────────────────────
function GlowBg({ c1='rgba(99,102,241,0.10)', c2='rgba(124,58,237,0.07)' }) {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute rounded-full" style={{width:600,height:600,background:c1,filter:'blur(140px)',top:-260,right:-160}}/>
      <div className="absolute rounded-full" style={{width:480,height:480,background:c2,filter:'blur(140px)',bottom:-200,left:200}}/>
    </div>
  );
}

// ── Settings sub-nav ──────────────────────────────────────────────────────────
function SettingsSubNav({ active, goTo }) {
  const tabs=[
    {label:'General',      page:'settings-general'},
    {label:'Team',         page:'settings-team'},
    {label:'Billing',      page:'settings-billing'},
    {label:'Pipeline',     page:'settings-pipeline'},
    {label:'Unsubscribes', page:'settings-unsubscribes'},
    {label:'Integrations', page:'settings-integrations'},
    {label:'API',          page:'settings-integrations'},
  ];
  return (
    <div className="shrink-0 border-b border-white/[0.05] px-7" style={{background:'#09091a'}}>
      <div className="flex items-center gap-1">
        {tabs.map(t=>{
          const a=active===t.page;
          return (
            <button key={t.label} onClick={()=>goTo(t.page)}
              className={['relative px-4 py-3 text-[13px] font-medium transition-colors',
                a?'text-white':'text-white/45 hover:text-white/75'].join(' ')}>
              {t.label}
              {a&&<span className="absolute left-3 right-3 -bottom-px h-px" style={{background:'linear-gradient(90deg,transparent,#818cf8,transparent)',boxShadow:'0 0 12px rgba(129,140,248,0.7)'}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Dev Nav ───────────────────────────────────────────────────────────────────
const ALL_PAGES = [
  'landing','signup','signin','forgot-password',
  'onboarding-1','onboarding-2','onboarding-3','onboarding-4',
  'dashboard','contacts','contact-detail','add-contact','edit-contact',
  'pipeline','deal-detail','add-deal',
  'email-inbox',
  'automations','automation-builder','sms-sequences',
  'reports',
  'settings-billing','settings-team','settings-general','settings-integrations',
  'settings-pipeline','settings-unsubscribes',
  'profile',
];

function DevNav({ goTo }) {
  const [open,setOpen]=React.useState(false);
  const ref=React.useRef(null);
  React.useEffect(()=>{
    const fn=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);
  return (
    <div ref={ref} style={{position:'fixed',bottom:28,right:28,zIndex:9999}}>
      <button onClick={()=>setOpen(!open)}
        className={['inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
          open?'bg-brand-500 text-white shadow-brand':
               'bg-white/[0.06] text-white/70 hover:bg-white/[0.10] hover:text-white'].join(' ')}>
        {open?<I.X size={11}/>:'🧭'}
        {!open&&<span>Pages ↑</span>}
      </button>
      {open&&(
        <div className="absolute bottom-12 right-0 w-52 rounded-xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden"
          style={{background:'rgba(11,11,22,0.98)',backdropFilter:'blur(16px)',maxHeight:420,overflowY:'auto'}}>
          <div className="px-3 py-2 border-b border-white/[0.05]">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]">Dev Nav — jump to page</p>
          </div>
          {ALL_PAGES.map(p=>(
            <button key={p} onClick={()=>{goTo(p);setOpen(false);}}
              className="w-full text-left px-3 py-2 text-[11px] font-mono text-white/65 hover:text-white hover:bg-brand-500/10 border-b border-white/[0.02] last:border-b-0 transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window,{
  Ico, I, Skel, useSkeleton,
  ConfirmModal, useConfirm,
  GlobalSearchOverlay, CommandPalette,
  AppSidebar, AppTopbar, AppFooter, NotifDropdown,
  Toggle, useToast, ToastContainer, GlowBg,
  DevNav, SettingsSubNav, ALL_PAGES,
});
