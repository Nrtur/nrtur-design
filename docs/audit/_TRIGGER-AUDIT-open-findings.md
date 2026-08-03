# Trigger / failure / onboarding audit - CONFIRMED (32)

## [1] HIGH | trigparam | 14387-14388 (catalog), 15214-15215 (picker), 21395 (emitter), 21161 (seed), 21810 (regex)
**Claim:** "Tag added" / "Tag removed" have no tag parameter in the builder, so every such automation fires on ANY tag ? even though the engine and seed data already speak the parameterised form 'Tag added: <tag>'.
**Why:** The hint literally promises "a specific tag", but TriggerPicker only renders bare `t.name` from TRIGGER_CATS with no value field, so the user can only author the unparameterised 'Tag added'. Meanwhile fireRecordUpdate emits BOTH 'Tag added' and 'Tag added: '+x (21395), seed automation #6 ships with trigger:'Tag added: cold-lead' (21161), and the list page even regex-matches /^Tag (added|removed): 
**Fix:** Add a value control to the trigger drawer for tag triggers that writes trigger = 'Tag added: '+tag (the string form the runtime already matches), plus an "any tag" option that keeps the bare name.

## [2] HIGH | trigparam | 14409 (only Proposal in catalog), 10232 + 10247-10248 (modal instruction), 15214 (picker lists catalog only), 21535 (emitter), 14283 (no stage field in conditions)
**Claim:** Stage is baked into the trigger STRING and only ONE stage ('Proposal') is offered, while the Stage-automation modal instructs users to create 'Deal moved to <any stage>' ? an instruction the picker cannot fulfil.
**Why:** runDealAutomations emits 'Deal moved to '+toName for EVERY stage (21535), and StageAutomationModal ? reached from any stage on the pipeline board ? tells the user to create an automation with trigger 'Deal moved to <that stage>' then buttons them into the builder. But TRIGGER_CATS contains exactly one such entry, 'Deal moved to Proposal' (14409), and TriggerPicker renders only catalog entries. For
**Fix:** Replace the hardcoded 'Deal moved to Proposal' catalog row with a parameterised 'Deal moved to stage?' whose drawer offers a pipeline+stage picker (writing the stage id, not the name), and/or add 'Deal stage' to AUTO_COND_FIELDS.

## [3] HIGH | trigparam | 10366-10370 (renameStage), 10375 (delStage), 21168 (AUTO_ST.error), 21162 (only 'error' user)
**Claim:** Because the stage parameter lives inside the trigger string, the rename repair at 10369 is pipeline-blind and stage-deletion leaves a permanently dead automation that still reads "Active".
**Why:** The R9-7 repair matches on the stage NAME alone with no pipeline qualifier, but pipelines are user-created and a new pipeline is seeded with generic stage names (10360). Two pipelines can therefore both contain a stage called e.g. "Done" or "New": renaming it in pipeline A silently rewrites automations that were authored against pipeline B's identically-named stage, redirecting them to deals they 
**Fix:** Key the stage trigger off {pipelineId, stageId} instead of a display string; on stage delete, flag dependent automations status:'error' (the state already exists) and surface it in the list.

## [4] HIGH | trigparam | 21414 (only `a` passed), 21383 (entry evaluated on `record`), 21398/21403/21408 (change detection discards `b`)
**Claim:** No before-state ever reaches the trigger filter, so every "X changed" trigger is structurally incapable of expressing "from value A to value B".
**Why:** fireRecordUpdate receives both `before` and `after`, computes the diff, then throws `b` away and forwards only the after-record. fireEntityAutomationEvents evaluates the entry condition against that single record (21383). So the entry-condition workaround can at best express "?and the new value is Customer" ? never "?changed FROM Prospect TO Customer". This affects six catalog triggers at once: 'S
**Fix:** Pass the before-record through as event context and let the trigger drawer offer From/To selects that the condition evaluator can read as `_prev.<field>`.

## [5] HIGH | trigparam | 14396 (catalog), 14317 (scoreHotMin), 3478 + 21337 (only two fire sites), 21401-21405 (lead diff ignores score)
**Claim:** 'Lead score reached' has no threshold input ? it fires only at the workspace-global hot band (default 70) ? and the entry-condition workaround silently cannot compensate because a plain score edit fires nothing at all.
**Why:** The hint says "a lead crosses a score threshold", implying the automation owns that number. It does not: both fire sites compare against scoreHotMin(), one shared workspace setting, so two automations cannot watch two different thresholds. The obvious workaround ? set the entry condition to "Lead score greater than 85" (the field exists in AUTO_COND_FIELDS, 14283) ? produces something worse than u
**Fix:** Store a per-automation threshold on the trigger and evaluate the crossing against it inside fireRecordUpdate's lead branch (which must start diffing `score`).

## [6] HIGH | runtime | 21168 (AUTO_INIT), 15395 (builder default), 26960 (ingestAdLead), 14466 (AUTO_LIVE_TRIGGERS)
**Claim:** Seeded ACTIVE automation 'Speed-to-lead' and the builder recipe both use a trigger nothing ever emits
**Why:** 'New ad lead received' is absent from AUTO_LIVE_TRIGGERS (14466) and no emitter produces it ? ingestAdLead, the single ad-lead choke point, creates the lead with setLeads and calls no fire* function at all. So the flagship demo automation is Active with 142 claimed runs but can never fire. The builder repeats the mistake: `_recipe==='speed-to-lead'` seeds the trigger to that same dead string (1539
**Fix:** Emit 'New ad lead received' from ingestAdLead and add it to AUTO_LIVE_TRIGGERS, or change the recipe default and the seed to 'Lead created'.

## [7] HIGH | runtime | 3478 (only emitter), 25394-25378 (runFunnelSubmit), 26960 (ingestAdLead)
**Claim:** 'Lead created'/'Contact created' fire only from the add-record drawer, not from funnels or ad-lead ingest
**Why:** Line 3478 is the sole emitter of the three '<Entity> created' events, and it lives inside the generic add-record drawer. runFunnelSubmit creates leads and contacts by calling crm.setLeads / crm.setContacts directly and emits nothing; ingestAdLead does the same. Both are the paths that matter for automation (inbound web form, paid-ad lead). So the trigger a user most likely picks first ? 'Lead crea
**Fix:** Route funnel and ad-lead record creation through the same deferred fireEntityAutomationEvents(object, rec, ['Lead created'/'Contact created']) call used at 3478.

## [8] HIGH | runtime | 21496, 21498, 21318, and addActivity in CrmDataContext
**Claim:** 'Invoice overdue' and 'Task overdue' fire against synthetic records whose id is not a contact id, orphaning every effect
**Why:** scanBreaches fires both events with ent='contact' but passes a fabricated record: for invoices, id is the invoice id ('inv_3' ? a string, invoices carry only a `contact` NAME, never a contactId); for tasks with no contactId, id is the string 'task-<id>'. autoCtx('contact') then hands autoRunNodes setContacts, and _patch matches `r.id===record.id` (21318), which can never hit. autoExecuteFired's ti
**Fix:** Resolve the invoice to a real contact (by contactId, else by matching inv.contact name) before firing, and skip tasks with no contactId rather than synthesising a 'task-N' id.

## [9] HIGH | failure | 15282 (simulateFlow) vs 21325 (autoRunNodes)
**Claim:** The 'Map webhook fields' step reports "lead created" in the test, but the live runtime never executes mapFields nodes at all
**Why:** mapFields presets carry kind:'mapFields' (L14258), and autoRunNodes handles only condition/branch/goal/wait before bailing on anything that is not kind==='action'. So the one node the preview blesses with a green 'Done ? lead created' chip is a guaranteed no-op live: no lead, no form record, nothing. This is the last surviving place where the test says a step succeeded when the runtime does not ru
**Fix:** Either give autoRunNodes a mapFields handler that actually creates the lead/form record, or make simulateFlow report it as status:'fail' with reason 'webhook mapping is not executed by the engine yet' ? and extend the gate to cover non-action kinds.

## [10] HIGH | failure | 21426 (autoExecuteFired) vs 21168 (AUTO_ST.error) and 21162 (seeded errStep)
**Claim:** No run ? test or live ? can ever produce the 'error' automation state or a 'failed' log row; every execution logs success N/N even when the gate blocked every step
**Why:** Definitive answer to "can the test reproduce failure?": per-STEP failure is now previewable (autoStepGate returns 'blocked'/'fail', NODE_TEST_ST.fail renders label 'Error'), but the AUTOMATION-level failure the product models is unreachable. autoExecuteFired hardcodes status:'success', hardcodes steps as nStep+'/'+nStep (a.nodes.length ? the authored count, not the executed count), and L21425 keep
**Fix:** Have autoRunNodes return the gate outcomes, then in autoExecuteFired set status 'failed'/'warning' and steps '<ran>/<total>' from that, downgrade the automation to status:'error' with errStep on a hard 'fail', and recompute the success percentage.

## [11] HIGH | failure | 15438-15451 (save), and the Activate toggle in the header
**Claim:** Save and Activate validate nothing, even though autoStepGate already knows exactly which steps are misconfigured
**Why:** save() writes straight to the store: no check for an empty node list, no check that required config exists, no check that the trigger can fire. The app can already name every defect ? autoStepGate returns {status:'fail'} for 'no email template chosen', 'no text template chosen', 'no sequence chosen', 'no endpoint URL set', 'no tag chosen', 'no field chosen', 'the task has no title' (L15250-15268) 
**Fix:** Run autoStepGate over the flattened node tree on Save/Activate; block activation (or show a blocking confirm listing the failing steps) when any step returns status:'fail' or the flow has zero nodes.

## [12] HIGH | failure | 15395 (builder default) vs 14466 (AUTO_LIVE_TRIGGERS) and 21824 (list canFire)
**Claim:** The Speed-to-lead recipe pre-selects a trigger that is not wired to the engine, and it can be saved Active with no warning
**Why:** TriggerPicker correctly disables non-live triggers and badges them 'Coming soon' (L15254 area), but the recipe path and the edit-existing path both bypass the picker. 'New ad lead received' is absent from AUTO_LIVE_TRIGGERS, so an automation created from the headline recipe can never fire ? yet Save/Activate accept it silently. The automations LIST already computes canFire for exactly this reason,
**Fix:** Show a persistent 'this trigger isn't live yet' banner in the builder header/trigger drawer when !triggerIsLive(trigger), and refuse to set status:'active' on save for a non-live trigger.

## [13] HIGH | blank | 14573 (CTA), 15374-15380 (initial state)
**Claim:** The one CTA that promises a blank canvas actually loads a 6-node demo flow the user must delete.
**Why:** Clicking "New Automation" with no recipe seeds `[Assign to rep, Send email, If Deal value > 10 {Send email, Notify Slack} else {Create task}]` ? 6 nodes across 2 branches. The from-scratch user's first job is demolition, not construction: each node must be hovered to reveal its X and removed one at a time (branch children included), and nothing on screen says these are examples. Worse, Save (15426
**Fix:** Make the no-recipe default `return []` so FlowList renders the FlowInserter variant='first' state; move the current 6-node flow behind an explicit `recipe:'demo'` (or a 'Show me an example' link in the sidebar).

## [14] HIGH | blank | 21764 (useTemplate), 21712-21726 (AUTO_TEMPLATES), 14571 (TEMPLATES_A cards)
**Claim:** 13 of 14 automation templates have no `recipe`, so "Use template" loads the generic demo flow while toasting success.
**Why:** Only 'Speed-to-lead' carries a `recipe`. Choosing 'Payment failed ? Dunning' or 'No-show recovery' toasts `Template "X" loaded` and then drops the user into the identical Assign/Email/Deal-value demo flow with trigger 'Contact created' ? the template's own `trigger` and `steps` strings are discarded at the call site. The 4 template cards on the Automations page (14571) are worse: they pass nothing
**Fix:** Pass the template through: `goTo('automation-builder',{trigger:t.trigger,steps:t.steps})` and have the builder seed `nodes` from `t.steps` (mapping to STEP_PRESETS_A keys). Until then, visually mark unwired templates as previews rather than claiming they loaded.

## [15] HIGH | blank | 15382, 14466 (AUTO_LIVE_TRIGGERS), 15217-15219 (picker disable)
**Claim:** The only working recipe preselects a trigger the trigger picker itself refuses to let you choose.
**Why:** 'New ad lead received' is not in AUTO_LIVE_TRIGGERS, so TriggerPicker renders it `disabled` with a "Coming soon" badge. A user who loads Speed-to-lead therefore starts from a flow whose trigger will never fire, and if they open the picker to verify it, they find their own current trigger greyed out and unselectable ? a dead end with no explanation. (A seeded 'active' automation at 21155 uses the s
**Fix:** Either add 'New ad lead received' to AUTO_LIVE_TRIGGERS (the ad-lead intake path exists) or point the recipe at 'Lead created'. Also always render the currently-selected trigger as selectable in the picker even if it is not live.

## [16] HIGH | blank | 15380 (seed), 14486 (makeNode), 15466 (ent='contact'), 21292 (evaluator)
**Claim:** Every condition ? seeded and user-added ? defaults to a Deal field even when the trigger is a Contact, so it silently always takes the No path.
**Why:** The default trigger is 'Contact created', so FlowCfgProvider passes ent='contact', yet both the demo condition and every If/then the user adds start on 'Deal value'. On a contact record autoEvalCond falls back to `parseMoney(record.value||'')` ? 0, so `0 > 10` is false and the branch always routes to No ? with no warning anywhere. CondRow (14600) offers the same 12 fields for every entity, so the 
**Fix:** Derive the default condition field from the trigger entity (Status for contact/lead, Company type for company, Deal value for deal) and filter AUTO_COND_FIELDS by the FlowCfgCtx entity so out-of-scope fields are not offered.

## [17] HIGH | blank | 15465 (trigger tile), 14687 (NodeTile root)
**Claim:** The trigger tile is a plain div ? not keyboard-reachable, and shows no affordance that it opens anything.
**Why:** Choosing the trigger is the first thing a from-scratch user must do, but NodeTile's clickable root is a `div` with no `tabIndex`, `role`, or `aria-*` ? keyboard and screen-reader users cannot reach the trigger at all. Visually it reads as a static header: eyebrow "Trigger", title "Contact created", subtitle "Fires when a new person is added". There is no chevron, no "Change" chip, and no hover con
**Fix:** Render the tile as `<button type="button">`, and on the trigger tile add a trailing 'Change' chip or ChevronRight (mirroring the drawer's own 'Change' affordance at 15496).

## [18] MEDIUM | trigparam | 14413 (catalog name), 21440 (engine), 14283 (no age field)
**Claim:** 'Deal inactive 7 days' hardcodes 7 in both the user-visible trigger NAME and the engine, with no configurable window and no condition field able to substitute.
**Why:** Putting the interval in the trigger's name is the same modelling smell as 'Deal moved to Proposal' ? the parameter has escaped into the identifier. A team whose sales cycle warrants a 14-day or 30-day dormancy alert cannot express it: there is no second catalog entry, no numeric input, and AUTO_COND_FIELDS (14283) exposes 'Last contacted' but nothing that reads the deal's time-in-stage that scanBr
**Fix:** Rename to 'Deal inactive for?' with a days input read by scanBreaches, and do the same for 'No reply in N days'.

## [19] MEDIUM | trigparam | 15467-15468 (single CondRow), 14283 (AUTO_COND_FIELDS), 15346 (legacy field/op/value shape), 21249 (multi-cond path unreachable)
**Claim:** The "Only continue if?" escape hatch is a SINGLE legacy condition row limited to 12 fields, so it cannot stand in for a trigger parameter that needs more than one clause.
**Why:** Condition NODES inside the flow get the full AND/OR builder that routes through omApplyFilter with the complete object schema (21249), but the trigger's entry filter renders exactly one CondRow with no add-row control, and `entry` is initialised in the legacy {field,op,value} shape (15346) which autoEvalCond resolves through a hand-written ladder covering nine fields (21252-21259). So the entry fi
**Fix:** Reuse the flow's AND/OR condition builder for the entry filter (write `entry.cond`), which autoEvalCond already supports, and widen it to the full object schema.

## [20] MEDIUM | trigparam | 15459-15465 (webhook block), 14443 (catalog entry), 14466 (AUTO_LIVE_TRIGGERS omits it), 15215 (disabled render)
**Claim:** The only per-trigger parameter UI that exists in the entire drawer ? the webhook block ? belongs to a trigger the picker refuses to let you select.
**Why:** The drawer contains a genuinely well-built trigger-scoped config panel: webhook URL, copy button, sample-field capture, editable incoming-field chips. It is gated on the trigger name containing 'webhook'. But 'Webhook / Zapier' is not in AUTO_LIVE_TRIGGERS (14466), so TriggerPicker renders it `disabled` with a "Coming soon" badge (15215) and no seed automation uses it ? meaning no user starting a 
**Fix:** Either mark the webhook trigger live so its config is reachable, or generalise the same conditional-panel pattern into a per-trigger params registry keyed off the trigger name.

## [21] MEDIUM | trigparam | 15388 (save shape), 21383 + 21484 (matcher), 21768/21810 (string regexes)
**Claim:** The saved automation record has no field for trigger parameters at all ? the data model itself is the root cause, and it forces parameters to be smuggled into the trigger string.
**Why:** save() persists {name, trigger, status, steps, nodes, entry} and nothing else, and both matchers compare `events.indexOf(a.trigger)>=0` ? exact string equality against an emitted event name. There is nowhere to put "which tag", "which stage", "what threshold", so the codebase has been forced to encode parameters INTO the identifier ('Tag added: cold-lead', 'Deal moved to Won', 'Every Monday 8am', 
**Fix:** Add `triggerParams:{}` to the saved record and match on (eventName, params) instead of a concatenated string; migrate the existing colon/`moved to` forms on read.

## [22] MEDIUM | runtime | 21549 (emitter), 14383-14413 (TRIGGER_CATS Deal cat), 14466, 11024-11029 (Customer Onboarding stages)
**Claim:** Only 'Deal moved to Proposal' is subscribable; every other stage move emits an event no trigger exposes
**Why:** The emitter is fully parameterized on the stage display name, but TRIGGER_CATS exposes exactly one instance of that family. Sales Pipeline emits 'Deal moved to Qualified/Proposal/Negotiation/Won/?' and the second seeded pipeline, Customer Onboarding, emits only 'Deal moved to Kickoff/In setup/Training/Live' (CO_STAGE_DEFS, 11024-11029) ? it has no Proposal stage at all, so the one stage trigger th
**Fix:** Replace the hard-coded 'Deal moved to Proposal' entry with a 'Deal moved to?' trigger plus a stage picker sourced from the live pipeline definitions.

## [23] MEDIUM | runtime | 15410
**Claim:** The builder's test run uses the wrong entity for 5 of the 26 live triggers
**Why:** _runEnt maps only the Contact/Lead/Company/Deal categories; everything else falls back to 'deal'. 'Email received', 'SMS reply received', 'Call logged' (Activity/Messaging cats) and 'Task overdue', 'Invoice overdue' (Activity/Payments cats) therefore run the whole simulateFlow trace against a DEAL sample record ? while the runtime fires all five with ent='contact' or 'lead'. Condition rows on Stat
**Fix:** Derive the test entity from the same source the runtime uses (autoTriggerEntity plus the emitter's ent), not from the display category.

## [24] MEDIUM | runtime | 15508, 14468-14481
**Claim:** Any parameterized trigger renders as 'Fires when .' in the trigger drawer and is mis-categorized
**Why:** TRIGGER_META falls through to keyword inference for names not in TRIGGER_CATS, and the fallback TRIGGER_BY_CAT always returns hint:'' (14468). So opening 'Cold Lead Nurture' (trigger 'Tag added: cold-lead') or 'Deal Won Celebration' (trigger 'Deal moved to Won') shows the literal sentence 'Fires when .' ? a visible broken string on exactly the automations that DO work. The inference also misroutes
**Fix:** When TRIGGER_META falls back, derive the hint from the base trigger (strip after ': ' / after 'Deal moved to ') instead of returning an empty hint.

## [25] MEDIUM | failure | 15410 (_runEnt) and 15479 (FlowCfgProvider ent) vs 21498 / 21496 (runtime fire calls)
**Claim:** Five live triggers can only be tested against DEAL records, while the runtime fires them on contacts/leads ? so the preview evaluates the wrong schema
**Why:** The entity map only covers cats Contact/Lead/Company/Deal. 'Email received' and 'SMS reply received' (cat Messaging, L14418), 'Call logged' and 'Task overdue' (cat Activity, L14424), and 'Invoice overdue' (cat Payments, L14451) are all in AUTO_LIVE_TRIGGERS, so all five fall through to 'deal'. The test bar then offers deal records and simulateFlow evaluates conditions on the deal schema ? while th
**Fix:** Extend the cat?entity map to cover Messaging/Activity/Payments (all ? 'contact'), or derive the entity from autoTriggerEntity/the actual fire call sites instead of defaulting to 'deal'.

## [26] MEDIUM | failure | 15279 (simulateFlow) vs 21324 (autoRunNodes)
**Claim:** The preview walks straight through a Wait and marks every downstream step 'Done'; the runtime halts there and queues the rest
**Why:** At runtime a top-level wait pushes the remaining nodes onto _autoWaitQueue and stops the run ? those steps do not execute until the simulated clock is advanced, and never if it isn't. The preview keeps iterating, so every step after a Wait gets a green 'Done' chip and the bar reports 'finished cleanly'. A user testing a 'wait 3 days then email' flow sees the email as sent. The bar's own copy claim
**Fix:** Stop the trace at a top-level wait and mark the remaining steps with a distinct 'pending ? resumes after the wait' status rather than 'ok'.

## [27] MEDIUM | failure | 15240-15241 (autoStepGate _ct)
**Claim:** Email suppression is invisible to the gate for lead- and company-triggered flows: only record.dnc is checked
**Why:** _ct() can only resolve a contact for ent 'contact' (own id), 'deal' (primaryContactId), or an already-converted lead. For an unconverted lead or a company, tc is null, so contactEmailSuppressed() and supChannelOff() never run and the gate returns ok. A lead whose email address is on the suppression list is reported 'Email sent ? template' by both the preview and the live run ? the preview is hones
**Fix:** In _mktBlocked, fall back to the record's own email/phone (contactEmailSuppressed(record.email), supPhoneBlocked(record.phone,'sms')) when no linked contact resolves.

## [28] MEDIUM | blank | 15465 (tile) ? 15487-15493 (drawer) ? 15516 (picker)
**Claim:** Setting the trigger takes three clicks through two stacked overlays, the first of which adds nothing on a new automation.
**Why:** Tile opens a side drawer that mostly restates the trigger, then a 'Change' row opens the full-screen TriggerPicker. On a brand-new automation the drawer's other content is inert: the webhook panel only renders for webhook triggers (15499) and 'Only continue if?' is an advanced entry filter a first-timer has no basis to set. So the mandatory first task is buried two overlays deep behind a tile that
**Fix:** When the trigger is still the untouched default (or nodes are empty), have the tile open TriggerPicker directly and keep the drawer for the entry filter / webhook config afterwards.

## [29] MEDIUM | blank | 15212 (return null), contrast 14646
**Claim:** TriggerPicker search has no empty state ? a query matching nothing renders a completely blank panel.
**Why:** Each category returns null when it has no match, so a typo or a term like 'churn' empties the whole scroll area with no message, no result count, and no way to tell a failed search from a broken screen. The sibling step picker gets this right ? FlowInserter renders `No actions match ?{q}?` at 14646 ? so the inconsistency is within the same builder.
**Fix:** Compute a total match count and render the same 'No triggers match ?q?' line plus a clear-search affordance, matching FlowInserter.

## [30] MEDIUM | blank | 14383-14462 (66 triggers), 14466 (26 live), 15214-15219 (disabled rendering)
**Claim:** 40 of the 66 catalogued triggers are unselectable, and 5 of 12 categories are 100% dead, with no filter to hide them.
**Why:** The 'Coming soon' badge is visible before clicking, which is good. But Smart Lists (0/3), Scheduling (0/7), Time & System (0/3), Behavioral (0/6) and Custom objects (0/3) ? 22 triggers ? render as full colour-coded sections in which nothing is clickable; Activity is 2/7 and Payments 1/6. A first-timer searching 'appointment' gets 7 results, all greyed. There is no 'Available now' filter and no per
**Fix:** Add a default-on 'Available now' filter chip beside the search input, show 'n of m available' in each category header, and sort live triggers above coming-soon ones inside each group.

## [31] MEDIUM | blank | 15367 (readOnly), 15466 (FlowList rendered unguarded)
**Claim:** A non-admin is dropped into the same demo flow and can edit it freely, but has no Save button.
**Why:** readOnly only suppresses the header's Active toggle, Test, Save-as-draft and Save buttons. The canvas below still renders `<FlowList nodes={nodes} onChange={setFlow} ?>` with every '+' inserter and every node config drawer live, so a viewer can delete the demo flow, build a real one, and only then discover there is no way to keep it. For a first-time non-admin this is the entire from-scratch exper
**Fix:** Thread `readOnly` into FlowList/FlowInserter/FlowNode to hide the + buttons and delete controls, and surface the WorkspaceReadOnlyBanner above the canvas rather than only at the top of the page.

## [32] LOW | failure | 15279 (simulateFlow) vs 21324 (autoRunNodes, top===false path)
**Claim:** A Wait nested inside a condition or branch never pauses at runtime, but the preview shows it with the same amber 'Waits' chip as a real pause
**Why:** simulateFlow does not know about the top/nested distinction, so a 'wait 2 days' inside an If/Yes branch previews identically to a top-level one. Live, the nested wait is a no-op and the next step fires immediately. Users who put the delay inside a branch (a very common shape) get instant sends with no indication in the test that the delay was dropped.
**Fix:** Pass the nesting depth into simulateFlow and render nested waits with a 'not scheduled ? runs immediately' detail, matching the runtime's own effect string.
