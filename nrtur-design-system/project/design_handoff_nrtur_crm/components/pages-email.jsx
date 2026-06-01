// ─── pages-email.jsx ── Email Inbox (split panel, thread inline) ──────────────

const EMAIL_THREADS = [
  {id:1, from:'Sarah Chen', company:'Meridian Agency', avatar:'SC', color:'#3b82f6', subject:'Re: Proposal for Q3 engagement', preview:"Love what you've shared — can we jump on a call Thursday after 2pm?", time:'2h ago', unread:true, starred:true, tag:'Proposal', tagBg:'bg-violet-500/15 text-violet-300 ring-violet-500/25',
    messages:[
      {from:'Sarah Chen', avatar:'SC', color:'#3b82f6', time:'2h ago', body:"Hi Alex,\n\nLove what you've shared in the proposal doc. The pricing structure makes sense and I think our team will be aligned.\n\nCan we jump on a call Thursday after 2pm PT to go through a few questions on the implementation timeline?\n\nLooking forward to it.\n\nBest,\nSarah"},
      {from:'Alex Morgan', avatar:'AM', color:'#3b82f6', time:'Yesterday 4:22 PM', me:true, body:"Hi Sarah,\n\nThank you for taking the time to review — really glad the proposal resonates.\n\nThursday 2pm PT works perfectly. I'll send a calendar invite with a Zoom link now.\n\nBest,\nAlex"},
    ]},
  {id:2, from:'James Rivera', company:'Summit Digital', avatar:'JR', color:'#8b5cf6', subject:'Contract questions', preview:'Quick questions on sections 3.2 and 4.1 of the contract before we sign…', time:'5h ago', unread:true, starred:false, tag:'Negotiation', tagBg:'bg-amber-500/15 text-amber-300 ring-amber-500/25',
    messages:[
      {from:'James Rivera', avatar:'JR', color:'#8b5cf6', time:'5h ago', body:"Hi Alex,\n\nThanks for sending over the contract. Quick questions on a couple of sections before we loop in legal:\n\n• Section 3.2 — can we request monthly billing instead of quarterly?\n• Section 4.1 — what's the SLA for critical issues?\n\nHappy to hop on a call if easier.\n\nJames"},
    ]},
  {id:3, from:'Priya Nair', company:'Atlas Consult', avatar:'PN', color:'#a855f7', subject:'Ready to move forward!', preview:'Our team unanimously voted yes. When can we schedule an onboarding call?', time:'1d ago', unread:false, starred:false, tag:'Qualified', tagBg:'bg-brand-500/15 text-brand-300 ring-brand-500/25',
    messages:[
      {from:'Priya Nair', avatar:'PN', color:'#a855f7', time:'1d ago', body:"Alex,\n\nGreat news — our team unanimously voted yes after the demo. The product is exactly what we've been looking for.\n\nCan we schedule an onboarding call for next week? We're ready to get started ASAP.\n\nExcited,\nPriya"},
    ]},
  {id:4, from:'Marcus Rios', company:'Kapoor & Assoc', avatar:'MR', color:'#f59e0b', subject:'Following up on our demo', preview:"Just checking in — has your team had a chance to review the demo recording?", time:'3d ago', unread:false, starred:false, tag:'Prospecting', tagBg:'bg-gray-500/15 text-gray-400 ring-gray-500/25',
    messages:[
      {from:'Alex Morgan', avatar:'AM', color:'#3b82f6', time:'3d ago', me:true, body:"Hi Marcus,\n\nJust following up on the demo we ran last Tuesday. Has your team had a chance to review the recording?\n\nHappy to answer any questions or schedule a follow-up.\n\nBest,\nAlex"},
    ]},
  {id:5, from:'Luca Bianchi', company:'Nova Growth', avatar:'LB', color:'#6366f1', subject:'Introduction from Mateo', preview:"Mateo mentioned you might be a good fit for what we're building here at Nova…", time:'1w ago', unread:false, starred:false, tag:'New Lead', tagBg:'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
    messages:[
      {from:'Luca Bianchi', avatar:'LB', color:'#6366f1', time:'1w ago', body:"Hi Alex,\n\nMateo over at Bloom mentioned you might be a good fit for what we're building at Nova Growth.\n\nWe're a 12-person growth agency and we've been looking for a CRM that doesn't require a 6-month implementation.\n\nWould love to grab 20 minutes this week.\n\nLuca"},
    ]},
];

function EmailInboxPage({ goTo }) {
  const [selected, setSelected] = React.useState(EMAIL_THREADS[0]);
  const [filterTab, setFilterTab] = React.useState('All');
  const [replyText, setReplyText] = React.useState('');
  const tabs = ['All','Unread','Sent','Starred'];

  const filtered = EMAIL_THREADS.filter(t => {
    if (filterTab === 'Unread') return t.unread;
    if (filterTab === 'Starred') return t.starred;
    return true;
  });

  return (
    <div className="h-full flex" style={{background:'#09091a'}}>
      <AppSidebar active="email-inbox" goTo={goTo}/>
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar goTo={goTo} title="Email" subtitle="2 unread · 3 accounts connected"
          rightSlot={
            <button onClick={()=>goTo('settings-integrations')} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-white/70 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] transition-all">
              <I.Plug size={13}/>Connect email
            </button>
          }
        />

        {/* Split panel */}
        <div className="flex-1 flex min-h-0">
          {/* Thread list */}
          <div className="w-[340px] shrink-0 border-r border-white/[0.05] flex flex-col">
            {/* Filter tabs + search */}
            <div className="px-4 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 mb-3">
                {tabs.map(t=>(
                  <button key={t} onClick={()=>setFilterTab(t)}
                    className={['flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all text-center',
                      filterTab===t?'bg-brand-500/20 text-brand-200':'text-white/45 hover:text-white/75'].join(' ')}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5">
                <I.Search size={12} className="text-white/40"/>
                <input placeholder="Search threads…" className="flex-1 bg-transparent outline-none text-[12px] text-white placeholder:text-white/30"/>
              </div>
            </div>

            {/* Thread items */}
            <div className="flex-1 overflow-y-auto scroll-area">
              {filtered.map(t=>(
                <button key={t.id} onClick={()=>setSelected(t)}
                  className={['w-full text-left px-4 py-3.5 border-b border-white/[0.03] transition-all relative',
                    selected?.id===t.id ? 'bg-brand-500/[0.08] border-l-2 border-brand-500' : 'hover:bg-white/[0.02]'].join(' ')}>
                  {t.unread && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-400"/>}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:t.color}}>{t.avatar}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={['text-[13px] leading-tight truncate', t.unread?'font-bold text-white':'font-medium text-white/80'].join(' ')}>{t.from}</p>
                        <span className="text-[10px] text-white/35 shrink-0 ml-2">{t.time}</span>
                      </div>
                      <p className="text-[12px] font-medium text-white/65 truncate">{t.subject}</p>
                      <p className="text-[11px] text-white/40 truncate mt-0.5">{t.preview}</p>
                      <span className={['inline-flex items-center text-[9px] font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full ring-1 mt-2', t.tagBg].join(' ')}>{t.tag}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Thread view */}
          {selected ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Thread header */}
              <div className="shrink-0 border-b border-white/[0.05] px-6 py-4 flex items-start justify-between gap-4" style={{background:'#09091a'}}>
                <div className="min-w-0">
                  <h2 className="text-white text-[18px] font-bold leading-tight">{selected.subject}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{background:selected.color}}>{selected.avatar}</div>
                    <span className="text-[12px] text-white/55">{selected.from} · {selected.company}</span>
                    <span className={['text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1', selected.tagBg].join(' ')}>{selected.tag}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={()=>goTo('contact-detail')} className="text-[12px] text-brand-300 hover:text-brand-200 flex items-center gap-1">View contact<I.ArrowRight size={11} stroke={2.4}/></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scroll-area px-6 py-5 flex flex-col gap-5">
                {selected.messages.map((msg,i)=>(
                  <div key={i} className={['flex gap-4', msg.me ? 'flex-row-reverse' : ''].join(' ')}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:msg.color}}>{msg.avatar}</div>
                    <div className={['max-w-[70%] rounded-2xl p-4 text-[13px] leading-relaxed',
                      msg.me ? 'bg-brand-500/12 border border-brand-500/25 text-white/85 rounded-tr-sm'
                              : 'bg-white/[0.04] border border-white/[0.08] text-white/85 rounded-tl-sm'].join(' ')}>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-[12px] font-semibold text-white">{msg.from}</p>
                        <p className="text-[11px] text-white/35">{msg.time}</p>
                      </div>
                      <p style={{whiteSpace:'pre-line'}}>{msg.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="shrink-0 border-t border-white/[0.05] p-4" style={{background:'#09091a'}}>
                <div className="rounded-xl border border-white/[0.08] focus-within:border-brand-500/40 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all" style={{background:'rgba(15,15,28,0.6)'}}>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-[11px] text-white/35">To: </span>
                    <span className="text-[11px] text-white/70">{selected.from} &lt;{selected.from.toLowerCase().replace(' ','.')}@{selected.company.toLowerCase().replace(' ','')}.co&gt;</span>
                  </div>
                  <textarea rows={4} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your reply…"
                    className="w-full bg-transparent outline-none resize-none px-4 py-2 text-[13px] text-white placeholder:text-white/30"/>
                  <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1">
                      {['@','#','📎'].map((b,i)=>(
                        <button key={i} className="w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] flex items-center justify-center text-[13px] transition-colors">{b}</button>
                      ))}
                    </div>
                    <button disabled={!replyText.trim()} onClick={()=>setReplyText('')}
                      className={['inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all',
                        replyText.trim()?'bg-brand-500 hover:bg-brand-400 text-white shadow-brand':'bg-white/[0.06] text-white/30 cursor-not-allowed'].join(' ')}>
                      <I.Send size={12} stroke={2.4}/>Send reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/25"><I.Mail size={22}/></div>
                <p className="text-[14px] font-semibold text-white/50">Select a thread</p>
              </div>
            </div>
          )}
        </div>
        <AppFooter note="3 accounts synced · last updated 2m ago"/>
      </div>
    </div>
  );
}

Object.assign(window, { EmailInboxPage });
