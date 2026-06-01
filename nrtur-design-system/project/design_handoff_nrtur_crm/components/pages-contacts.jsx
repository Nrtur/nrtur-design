// ─── pages-contacts.jsx ─── Contacts List + Contact Detail + Add Contact ──────

const CONTACTS_DATA = [
  {id:1, name:'Sarah Chen',    co:'Meridian Agency',  email:'sarah@meridian.co',  phone:'+1 555-234-8901', avatar:'SC', color:'#3b82f6', status:'Active',     owner:'AM', ownerColor:'#3b82f6', last:'2h ago',   deal:'$24k', tag:'top-lead',  loc:'San Francisco, CA'},
  {id:2, name:'James Rivera',  co:'Summit Digital',   email:'james@summit.co',    phone:'+1 555-312-4400', avatar:'JR', color:'#8b5cf6', status:'Hot',        owner:'JK', ownerColor:'#8b5cf6', last:'5h ago',   deal:'$31k', tag:'agency',    loc:'New York, NY'},
  {id:3, name:'Maria Lopez',   co:'Bloom Creative',   email:'maria@bloom.co',     phone:'+1 555-198-7730', avatar:'ML', color:'#ec4899', status:'Warm',       owner:'SC', ownerColor:'#ec4899', last:'1d ago',   deal:'$18k', tag:'q2-focus', loc:'Austin, TX'},
  {id:4, name:'Ravi Lee',      co:'Vertex Labs',      email:'ravi@vertex.co',     phone:'+1 555-441-6623', avatar:'RL', color:'#10b981', status:'New',        owner:'RL', ownerColor:'#10b981', last:'2d ago',   deal:'$6.2k',tag:'new-lead', loc:'Los Angeles, CA'},
  {id:5, name:'Marcus Rios',   co:'Kapoor & Assoc',   email:'marcus@kapoor.co',   phone:'+1 555-887-2211', avatar:'MR', color:'#f59e0b', status:'Warm',       owner:'MR', ownerColor:'#f59e0b', last:'3d ago',   deal:'$28k', tag:'agency',   loc:'Chicago, IL'},
  {id:6, name:'Emily Tran',    co:'Forge & Co',       email:'emily@forge.co',     phone:'+1 555-223-9004', avatar:'ET', color:'#14b8a6', status:'Active',     owner:'AM', ownerColor:'#3b82f6', last:'4d ago',   deal:'$44k', tag:'won',      loc:'Seattle, WA'},
  {id:7, name:'Luca Bianchi',  co:'Nova Growth',      email:'luca@nova.co',       phone:'+1 555-567-4312', avatar:'LB', color:'#6366f1', status:'Lead',       owner:'JK', ownerColor:'#8b5cf6', last:'5d ago',   deal:'$15.5k',tag:'new-lead',loc:'Miami, FL'},
  {id:8, name:'Priya Nair',    co:'Atlas Consult',    email:'priya@atlas.co',     phone:'+1 555-334-7788', avatar:'PN', color:'#a855f7', status:'Qualified',  owner:'SC', ownerColor:'#ec4899', last:'1w ago',   deal:'$18k', tag:'qualified',loc:'Boston, MA'},
];

const STATUS_CHIP = {
  Active:   'bg-emerald-500/12 text-emerald-300 ring-emerald-500/25',
  Hot:      'bg-red-500/12 text-red-300 ring-red-500/25',
  Warm:     'bg-amber-500/12 text-amber-300 ring-amber-500/25',
  New:      'bg-blue-500/12 text-blue-300 ring-blue-500/25',
  Lead:     'bg-white/[0.06] text-white/55 ring-white/[0.08]',
  Qualified:'bg-brand-500/12 text-brand-300 ring-brand-500/25',
};

// ── Contacts skeleton ─────────────────────────────────────────────────────────
function ContactsSkeleton({ goTo }) {
  const COL = '1.8fr 1.4fr 110px 110px 90px 110px 36px';
  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="contacts" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Contacts" noSearch/>
        <div className="flex-1 overflow-y-auto scroll-area">
          {/* header row */}
          <div className="sticky top-0 z-10 grid items-center gap-4 px-7 py-3 border-b border-white/[0.05] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
               style={{gridTemplateColumns:COL, background:'rgba(9,9,26,0.90)', backdropFilter:'blur(12px)'}}>
            <span>Name</span><span>Company</span><span>Status</span><span>Last seen</span><span>Owner</span><span>Deal value</span><span/>
          </div>
          {[...Array(8)].map((_,i)=>(
            <div key={i} className="grid items-center gap-4 px-7 py-4 border-b border-white/[0.03]" style={{gridTemplateColumns:COL}}>
              <div className="flex items-center gap-3">
                <Skel w="36px" h="36px" r="50%"/>
                <div className="flex flex-col gap-1.5"><Skel w={`${110+i*7}px`} h="12px"/><Skel w="90px" h="10px"/></div>
              </div>
              <Skel w="100px" h="12px"/>
              <Skel w="60px" h="20px" r="9999px"/>
              <Skel w="55px" h="11px"/>
              <Skel w="28px" h="28px" r="50%"/>
              <Skel w="50px" h="12px"/>
              <span/>
            </div>
          ))}
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

// ── Contacts List ─────────────────────────────────────────────────────────────
function ContactsPage({ goTo }) {
  const loading = useSkeleton(900);
  if (loading) return <ContactsSkeleton goTo={goTo}/>;

  const [search, setSearch] = React.useState('');
  const [filterTab, setFilterTab] = React.useState('All');
  const [importModal, setImportModal] = React.useState(false);
  const tabs = ['All','Leads','Qualified','Active'];

  const filtered = CONTACTS_DATA.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.co.toLowerCase().includes(q)) return false;
    if (filterTab === 'Leads') return c.status === 'Lead' || c.status === 'New';
    if (filterTab === 'Qualified') return c.status === 'Qualified' || c.status === 'Hot';
    if (filterTab === 'Active') return c.status === 'Active' || c.status === 'Warm';
    return true;
  });

  const COL = '1.8fr 1.4fr 110px 110px 90px 110px 36px';

  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="contacts" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Contacts" subtitle={`${CONTACTS_DATA.length.toLocaleString()} contacts`}
          rightSlot={<>
            <button onClick={()=>setImportModal(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.18] transition-all">
              <I.Upload size={13}/>Import
            </button>
            <button onClick={()=>goTo('add-contact')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-brand hover:-translate-y-0.5 transition-all">
              <I.Plus size={14} stroke={2.4}/>New Contact
            </button>
          </>}
          noSearch
        />

        {/* Filter bar */}
        <div className="shrink-0 border-b border-white/[0.05] px-7 py-3 flex items-center gap-3" style={{background:'#09091a'}}>
          <div className="flex items-center gap-1">
            {tabs.map(t=>(
              <button key={t} onClick={()=>setFilterTab(t)}
                className={['px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                  filterTab===t ? 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/25' : 'text-white/50 hover:text-white/85 hover:bg-white/[0.04]'].join(' ')}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 ml-2 focus-within:border-brand-500/40 transition-all">
            <I.Search size={12} className="text-white/40"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
              className="bg-transparent outline-none text-[12px] text-white placeholder:text-white/30 w-44"/>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-white/55 hover:text-white border border-white/[0.06] hover:border-white/[0.14] transition-all">
              <I.Filter size={11}/>Filter
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-area">
          {/* Table header */}
          <div className="sticky top-0 z-10 grid items-center gap-4 px-7 py-3 border-b border-white/[0.05] text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]"
               style={{gridTemplateColumns:COL, background:'rgba(9,9,26,0.90)', backdropFilter:'blur(12px)'}}>
            <span>Name</span><span>Company</span><span>Status</span><span>Last seen</span><span>Owner</span><span>Deal value</span><span/>
          </div>
          {/* Rows */}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/25"><I.Users size={22}/></div>
                <p className="text-[14px] font-semibold text-white/50">No contacts found</p>
                <p className="text-[12px] text-white/30 mt-1">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
          {filtered.map((c,i)=>(
            <button key={c.id} onClick={()=>goTo('contact-detail')}
              className={['w-full grid items-center gap-4 px-7 py-3.5 hover:bg-white/[0.025] transition-colors text-left group',
                i<filtered.length-1?'border-b border-white/[0.03]':''].join(' ')}
              style={{gridTemplateColumns:COL}}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:c.color}}>{c.avatar}</div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white leading-tight truncate">{c.name}</p>
                  <p className="text-[11px] text-white/45 truncate mt-0.5">{c.email}</p>
                </div>
              </div>
              <p className="text-[13px] text-white/75 truncate">{c.co}</p>
              <span className={['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 w-fit', STATUS_CHIP[c.status]||''].join(' ')}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"/>
                {c.status}
              </span>
              <p className="text-[12px] text-white/55">{c.last}</p>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{background:c.ownerColor}}>{c.owner}</div>
              <p className="text-[13px] font-bold text-white tabular-nums">{c.deal}</p>
              <I.ChevronRight size={12} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity"/>
            </button>
          ))}
        </div>

        {/* Import modal */}
        {importModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}}>
            <div className="w-full max-w-md rounded-2xl border border-white/[0.10] p-7" style={{background:'#0d0d1a'}}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-white text-[18px] font-bold">Import contacts</p>
                <button onClick={()=>setImportModal(false)} className="text-white/45 hover:text-white"><I.X size={16}/></button>
              </div>
              <div className="p-8 rounded-xl border border-dashed border-white/[0.14] hover:border-brand-500/35 transition-colors text-center cursor-pointer mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25 flex items-center justify-center mx-auto mb-3"><I.Upload size={16}/></div>
                <p className="text-[13px] font-semibold text-white">Drag CSV here</p>
                <p className="text-[11px] text-white/40 mt-1">or click to browse · max 10,000 rows</p>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setImportModal(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
                <button onClick={()=>setImportModal(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Import</button>
              </div>
            </div>
          </div>
        )}
        <AppFooter note="1,284 contacts synced"/>
      </div>
    </div>
  );
}

// ── Contact Detail ─────────────────────────────────────────────────────────────
const TIMELINE = [
  {kind:'email-in',time:'2h ago',  label:'EMAIL RECEIVED', chipBg:'bg-blue-500/15 ring-blue-500/25 text-blue-300',   Icon:I.Mail,   iconColor:'#60a5fa', title:'Re: Proposal for Q3 engagement', body:"Love what you've shared — can we jump on a call Thursday after 2pm PT?", meta:'From sarah@meridian.co'},
  {kind:'note',    time:'Yesterday',label:'NOTE',           chipBg:'bg-amber-500/15 ring-amber-500/25 text-amber-300', Icon:I.Note,   iconColor:'#fbbf24', title:'Called Sarah, very interested in annual plan', body:'She wants to move forward with the annual retainer. Needs a 2-page summary by EOW. Budget at $48k.', meta:'Added by Alex Morgan'},
  {kind:'deal',    time:'3d ago',   label:'PIPELINE',       chipBg:'bg-violet-500/15 ring-violet-500/25 text-violet-300',Icon:I.GitBranch,iconColor:'#a78bfa',title:'Deal moved · Q3 Engagement', body:'Qualified → Proposal', meta:'Moved by Alex Morgan'},
  {kind:'email-out',time:'1w ago',  label:'EMAIL SENT',     chipBg:'bg-brand-500/15 ring-brand-500/25 text-brand-300', Icon:I.Send,   iconColor:'#818cf8', title:'Initial outreach', body:'Hi Sarah — appreciated the intro from Mateo. Wanted to share how nrtur helps agencies like Meridian…', meta:'Sent by Alex Morgan'},
  {kind:'created', time:'2w ago',   label:'CONTACT CREATED',chipBg:'bg-emerald-500/15 ring-emerald-500/25 text-emerald-300',Icon:I.UserPlus,iconColor:'#34d399',title:'Contact created', body:'Imported from referral by Mateo Reyes.', meta:'By Alex Morgan'},
];

function ContactDetailPage({ goTo }) {
  const c = CONTACTS_DATA[0]; // always Sarah Chen
  const [tab, setTab] = React.useState('all');
  const [noteText, setNoteText] = React.useState('');
  const { confirmNode, openConfirm } = useConfirm();
  const filterTabs = [{k:'all',l:'All',n:5},{k:'emails',l:'Emails',n:2},{k:'notes',l:'Notes',n:1},{k:'deals',l:'Deals',n:1}];

  const filtered = TIMELINE.filter(e=>{
    if(tab==='emails') return e.kind.startsWith('email');
    if(tab==='notes')  return e.kind==='note';
    if(tab==='deals')  return e.kind==='deal';
    return true;
  });

  return (
    <div className="h-full flex" style={{background:'#07070f'}}>
      <AppSidebar active="contacts" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="shrink-0 border-b border-white/[0.05] px-7 py-3.5 flex items-center justify-between" style={{background:'#09091a'}}>
          <div className="flex items-center gap-2 text-[13px]">
            <button onClick={()=>goTo('contacts')} className="text-white/45 hover:text-white transition-colors">Contacts</button>
            <I.ChevronRight size={12} className="text-white/25"/>
            <span className="text-white font-semibold">{c.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>goTo('contacts')} className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 hover:text-white flex items-center justify-center transition-all"><I.ChevronLeft size={14}/></button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-white/70 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all"><I.Star size={13}/> Star</button>
            <button onClick={()=>goTo('edit-contact')} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-white/70 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all"><I.Edit size={13}/> Edit</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] gap-5 items-start">

            {/* Left panel */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md overflow-hidden">
              {/* Avatar + name */}
              <div className="relative p-6 pb-5 border-b border-white/[0.05]" style={{background:'radial-gradient(circle at top,rgba(59,130,246,0.10),transparent 70%)'}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[20px] font-bold ring-2 ring-white/[0.06]" style={{background:c.color}}>{c.avatar}</div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#0c0c1a]"/>
                  </div>
                  <div>
                    <h2 className="text-white text-[20px] font-bold">{c.name}</h2>
                    <p className="text-[13px] text-white/55 mt-1">CEO · {c.co}</p>
                    <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Active</span>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {Icon:I.Send,  l:'Send Email', fn:()=>goTo('email-inbox'), accent:true},
                    {Icon:I.Phone, l:'Log Call',   fn:()=>{}},
                    {Icon:I.Note,  l:'Add Note',   fn:()=>{}},
                    {Icon:I.Trash, l:'Delete',     fn:()=>openConfirm({
                      title:`Delete ${c.name}?`,
                      body:'This will archive the contact for 30 days. You can restore them from the archive.',
                      confirmLabel:'Delete contact',
                      danger:true,
                      onConfirm:()=>goTo('contacts'),
                    }), danger:true},
                  ].map((b,i)=>(
                    <button key={i} onClick={b.fn} className={['flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border transition-all text-[10px] font-medium',
                      b.accent ? 'bg-brand-500/10 hover:bg-brand-500/15 border-brand-500/20 hover:border-brand-500/40 text-brand-300' :
                      b.danger  ? 'bg-red-500/[0.07] hover:bg-red-500/12 border-red-500/15 hover:border-red-500/30 text-red-400/80 hover:text-red-300' :
                                  'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.16] text-white/65 hover:text-white'].join(' ')}>
                      <b.Icon size={14}/>{b.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info rows */}
              {[
                {Icon:I.Mail,    label:'Email',   val:c.email,   accent:true},
                {Icon:I.Phone,   label:'Phone',   val:c.phone,   accent:true},
                {Icon:I.Building,label:'Company', val:c.co,      accent:true},
                {Icon:I.MapPin,  label:'Location',val:c.loc},
                {Icon:I.Clock,   label:'Last seen',val:c.last},
                {Icon:I.UserCog, label:'Owner',   val:'Alex Morgan'},
              ].map(r=>(
                <div key={r.label} className="flex items-start gap-3 px-5 py-2.5 border-b border-white/[0.025]">
                  <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/45 shrink-0 mt-0.5"><r.Icon size={11}/></div>
                  <div><p className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.14em]">{r.label}</p><p className={['text-[12px] mt-0.5', r.accent?'text-brand-300 cursor-pointer':'text-white/80'].join(' ')}>{r.val}</p></div>
                </div>
              ))}

              {/* Tags */}
              <div className="px-5 py-4 border-b border-white/[0.05]">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em] mb-3">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {['agency','top-lead','q2-focus'].map(t=>(
                    <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/20 hover:bg-brand-500/20 cursor-pointer transition-colors">{t}</span>
                  ))}
                </div>
              </div>

              {/* Associated deals */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]">Deals · 2</p>
                  <button onClick={()=>goTo('add-deal')} className="text-[11px] text-white/45 hover:text-brand-300 flex items-center gap-1"><I.Plus size={10} stroke={2.4}/>New deal</button>
                </div>
                {[{name:'Q3 Engagement',$:'$24k',stage:'Proposal',stageColor:'#a78bfa',p:65},{name:'Annual Retainer',$:'$48k',stage:'Qualified',stageColor:'#818cf8',p:40}].map(d=>(
                  <button key={d.name} onClick={()=>goTo('deal-detail')} className="w-full rounded-xl bg-white/[0.025] border border-white/[0.05] p-3.5 mb-2 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all text-left">
                    <div className="flex justify-between mb-1.5"><p className="text-[13px] font-semibold text-white">{d.name}</p><span className="text-[14px] font-bold text-white">{d.$}</span></div>
                    <div className="flex items-center gap-2 mb-2"><span className="w-1.5 h-1.5 rounded-full" style={{background:d.stageColor}}/><span className="text-[11px] text-white/55">{d.stage}</span></div>
                    <div className="h-1 rounded-full bg-white/[0.05]"><div className="h-full rounded-full" style={{width:`${d.p}%`,background:d.stageColor}}/></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: activity */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md flex flex-col">
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">Activity</p>
                  <p className="text-[11px] text-white/45 mt-0.5">5 events · oldest 2 weeks ago</p>
                </div>
                <div className="flex items-center gap-1">
                  {filterTabs.map(t=>(
                    <button key={t.k} onClick={()=>setTab(t.k)}
                      className={['inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                        tab===t.k?'bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/25':'text-white/50 hover:text-white/85 hover:bg-white/[0.04]'].join(' ')}>
                      {t.l}<span className={['text-[10px] font-mono px-1 py-0.5 rounded-full',tab===t.k?'bg-brand-500/25 text-brand-200':'bg-white/[0.05] text-white/40'].join(' ')}>{t.n}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                {filtered.map((e,i)=>(
                  <div key={i} className="relative pl-11 pb-5">
                    {i<filtered.length-1 && <div className="absolute left-[18px] top-9 bottom-0 w-px bg-white/[0.06]"/>}
                    <div className="absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center" style={{background:'rgba(15,15,28,0.85)',boxShadow:'0 0 0 1px rgba(255,255,255,0.06)'}}>
                      <span style={{color:e.iconColor}}><e.Icon size={14}/></span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={['inline-flex items-center text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ring-1', e.chipBg].join(' ')}>{e.label}</span>
                      <span className="text-[11px] text-white/35">{e.time}</span>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/[0.10] hover:bg-white/[0.04] transition-all">
                      <p className="text-[14px] font-semibold text-white">{e.title}</p>
                      <p className="text-[13px] text-white/55 mt-1.5 leading-relaxed">{e.body}</p>
                      <p className="text-[11px] text-white/35 mt-2 pt-2 border-t border-white/[0.04]">{e.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add note */}
              <div className="border-t border-white/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5" style={{background:'#3b82f6'}}>AM</div>
                  <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-brand-500/40 transition-all">
                    <textarea rows={2} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add a note about Sarah…" className="w-full bg-transparent outline-none resize-none px-4 py-3 text-[13px] text-white placeholder:text-white/30"/>
                    <div className="flex justify-end px-3 pb-2.5">
                      <button disabled={!noteText.trim()} onClick={()=>setNoteText('')}
                        className={['inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
                          noteText.trim()?'bg-brand-500 hover:bg-brand-400 text-white shadow-brand':'bg-white/[0.06] text-white/30 cursor-not-allowed'].join(' ')}>
                        <I.Send size={11} stroke={2.4}/>Add note
                      </button>
                    </div>
                  </div>
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

// ── Add Contact ───────────────────────────────────────────────────────────────
function AddContactPage({ goTo }) {
  return (
    <div className="h-full flex" style={{background:'#07070f'}}>
      <AppSidebar active="contacts" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 border-b border-white/[0.05] px-7 py-3.5 flex items-center justify-between" style={{background:'#09091a'}}>
          <div className="flex items-center gap-2 text-[13px]">
            <button onClick={()=>goTo('contacts')} className="text-white/45 hover:text-white transition-colors">Contacts</button>
            <I.ChevronRight size={12} className="text-white/25"/>
            <span className="text-white font-semibold">New contact</span>
          </div>
          <button onClick={()=>goTo('contacts')} className="text-white/40 hover:text-white transition-colors"><I.X size={16}/></button>
        </header>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-7">
              <h2 className="text-white text-[22px] font-bold mb-6">Add new contact</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[['First name','text'],['Last name','text'],['Work email','email'],['Phone','tel'],['Company','text'],['Job title','text']].map(([pl,t])=>(
                  <div key={pl}><label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{pl}</label>
                    <input type={t} placeholder={pl} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40"/>
                  </div>
                ))}
              </div>
              <div className="mb-6">
                <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">Notes</label>
                <textarea rows={3} placeholder="Add any notes…" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 outline-none focus:border-brand-500/40 resize-none"/>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>goTo('contacts')} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
                <button onClick={()=>goTo('contact-detail')} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Create contact</button>
              </div>
            </div>
          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

// ── Edit Contact ──────────────────────────────────────────────────────────────
function EditContactPage({ goTo }) {
  return (
    <div className="h-full flex" style={{background:'#07070f'}}>
      <AppSidebar active="contacts" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 border-b border-white/[0.05] px-7 py-3.5 flex items-center justify-between" style={{background:'#09091a'}}>
          <div className="flex items-center gap-2 text-[13px]">
            <button onClick={()=>goTo('contact-detail')} className="text-white/45 hover:text-white transition-colors">Sarah Chen</button>
            <I.ChevronRight size={12} className="text-white/25"/>
            <span className="text-white font-semibold">Edit</span>
          </div>
          <button onClick={()=>goTo('contact-detail')} className="text-white/40 hover:text-white"><I.X size={16}/></button>
        </header>
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="px-7 py-6 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-7">
              <h2 className="text-white text-[22px] font-bold mb-6">Edit contact</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[['First name','Sarah'],['Last name','Chen'],['Work email','sarah@meridian.co'],['Phone','+1 555-234-8901'],['Company','Meridian Agency'],['Job title','CEO']].map(([l,v])=>(
                  <div key={l}><label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.14em] block mb-1.5">{l}</label>
                    <input type="text" defaultValue={v} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-[13px] text-white outline-none focus:border-brand-500/40"/>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={()=>goTo('contact-detail')} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white/65 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">Cancel</button>
                <button onClick={()=>goTo('contact-detail')} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-400 shadow-brand transition-all">Save changes</button>
              </div>
            </div>
          </div>
        </div>
        <AppFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { ContactsPage, ContactDetailPage, AddContactPage, EditContactPage, CONTACTS_DATA });
