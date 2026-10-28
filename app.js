import { OPEN_INVITATION, PLEDGE, STARTER_SETS, LENSES, THINKERS, RESEARCH_QUESTIONS, CATEGORIES } from './content/atlas-content.js';

const byId = id => document.getElementById(id);
const STORAGE_KEY = 'full-color-atlas-v1';
const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const initial = () => ({ version:1, threads:[], active:null, notes:[], highContrast:false, scale:'normal', welcomeSeen:false });
function load() {
  try { const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (raw && raw.version === 1 && Array.isArray(raw.threads) && Array.isArray(raw.notes)) return {...initial(),...raw}; } catch { /* Fall back without erasing corrupt data. */ }
  return initial();
}
const state = load();
let liveEnabled = false;
let busy = false;
let activeController = null;
let lastQuestion = '';
let drawerReturnFocus = null;
const $welcome = byId('welcome'), $conversation = byId('conversation'), $input = byId('chat-input');
const $overlay = byId('overlay'), $body = byId('drawer-body');
function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { byId('reply-status').textContent='This browser could not save your work. You may export your record.'; } }
function activeThread() { return state.threads.find(t=>t.id===state.active)||null; }
function ensureThread() { let t=activeThread(); if(!t){t={id:id(),title:'A fresh question',messages:[],updated:Date.now()};state.threads.push(t);state.active=t.id;persist();}return t; }
function setStatus(text='') { byId('reply-status').textContent=text; }
function syncSettings() { document.documentElement.dataset.contrast=state.highContrast?'high':'normal';document.documentElement.dataset.scale=state.scale; }
function renderThreads() {
  const node=byId('thread-list');node.replaceChildren();
  for(const t of [...state.threads].reverse().filter(t=>t.messages.length).slice(0,25)){
    const b=document.createElement('button');b.className=`thread-button${t.id===state.active?' current':''}`;b.type='button';b.textContent=t.title;b.title=t.title;
    b.addEventListener('click',()=>{if(busy)return;state.active=t.id;persist();render();closeRail();$input.focus();});node.appendChild(b);
  }
  byId('note-count').textContent=String(state.notes.length);
}
function render() {
  const t=activeThread();
  lastQuestion=t?.messages.findLast(m=>m.role==='user')?.text||'';
  $welcome.hidden=Boolean(t?.messages?.length);
  byId('visit-toolbar').hidden=!t?.messages?.length;
  $conversation.hidden=!t?.messages?.length;
  $conversation.replaceChildren();
  if(t?.messages?.length) for(const msg of t.messages) $conversation.appendChild(messageElement(msg));
  renderThreads();
  if(t?.messages?.length) byId('stage-inner').scrollTop=byId('stage-inner').scrollHeight;
}
function messageElement(msg){
  const article=document.createElement('article');article.className=`message ${msg.role==='user'?'user':'assistant'}`;article.dataset.messageId=msg.id;
  const avatar=document.createElement('div');avatar.className='message-avatar';avatar.setAttribute('aria-hidden','true');
  if(msg.role==='user')avatar.textContent='YOU';
  else {const portrait=document.createElement('img');portrait.src='/assets/exhibit-cart.webp';portrait.alt='';avatar.appendChild(portrait);}
  const body=document.createElement('div');body.className='message-body message-bubble';
  const head=document.createElement('div');head.className='message-head';
  const who=document.createElement('span');who.textContent=msg.role==='user'?'You':'Exhibit Cart';head.appendChild(who);
  if(msg.role==='assistant'){const badge=document.createElement('small');badge.textContent=msg.kind==='live'?'AI-GENERATED · UNVERIFIED':'SCRIPTED EXAMPLE';head.appendChild(badge);}
  const text=document.createElement('div');text.className='message-text';text.textContent=msg.text||'…';body.append(head,text);
  if(msg.text){const actions=document.createElement('div');actions.className='message-actions';const keep=document.createElement('button');keep.className='subtle-btn';keep.type='button';keep.textContent='Keep in notebook →';keep.addEventListener('click',()=>openPanel('notebook',msg.text));actions.appendChild(keep);if(msg.role==='assistant'){const cross=document.createElement('button');cross.type='button';cross.className='subtle-btn';cross.textContent='Cross-examine this';cross.addEventListener('click',()=>prefill(`Cross-examine your previous answer. What assumptions, missing evidence, and counterexamples matter?`));actions.appendChild(cross);}body.appendChild(actions);}
  if(msg.role==='assistant' && msg.text && msg.id===activeThread()?.messages.at(-1)?.id){
    const paths=document.createElement('div');paths.className='cart-paths';
    const label=document.createElement('span');label.textContent='Follow your curiosity · suggested prompts';
    const options=document.createElement('div');options.className='path-options';
    const choices=/\b(world|imagine|simulat|future)\b/i.test(lastQuestion)?[
      ['Test an assumption',()=>prefill('Which assumption in this imagined world is most important to test, and how could we test it?')],
      ['Invite a skeptic',()=>prefill('Invite a fictional Skeptic BB to challenge the assumptions in this possible world. Label the viewpoint fictional.')]
    ]:[
      ['Explain it directly',()=>prefill('Give me a direct explanation of my question, with one concrete example and the limits of what we know.')],
      ['Challenge the idea',()=>prefill('Cross-examine your previous answer. What assumptions, missing evidence, and counterexamples matter?')]
    ];
    choices.push(['Explore connections',()=>openPanel('connections')]);
    for(const [title,act] of choices){const button=document.createElement('button');button.type='button';button.textContent=title;button.addEventListener('click',act);options.appendChild(button);}
    paths.append(label,options);body.appendChild(paths);
  }
  article.append(avatar,body);return article;
}
function renderLenses(){
  const center=lastQuestion||activeThread()?.messages.findLast(m=>m.role==='user')?.text||'';
  byId('connections-title').textContent=center?`Many lenses. One question.`:'Your question becomes the center.';
  byId('connections-description').textContent=center?`“${center.slice(0,105)}${center.length>105?'…':''}” Choose a lens to explore; these are prompts, not verified conclusions.`:'We’ll explore it through different ways of knowing. A connection is an invitation, not a proof.';
  const lower=center.toLowerCase();
  const preferred=/(capital|bread|price|market|work|money|cost)/.test(lower)?['economics','history','law','ethics']:/\b(color|see|vision|perception|language|word|translation)\b/.test(lower)?['language','science','metacognition','ethics']:/\b(city|future|world|design|school|education)\b/.test(lower)?['imagination','economics','history','ethics']:['history','science','law','imagination'];
  const chosen=preferred.map(x=>LENSES.find(l=>l.id===x));
  const list=byId('lens-list');list.replaceChildren();
  for(const lens of chosen){const b=document.createElement('button');b.className='lens-button';b.type='button';b.innerHTML=`<span><strong>${escapeHTML(lens.title)}</strong><small>${escapeHTML(lens.subtitle)}</small></span><span class="arrow">→</span>`;b.addEventListener('click',()=>prefill(`${center || 'My question'}\n\n${lens.question}`));list.appendChild(b);}
}
function prefill(text){closeRail();closePanel();$input.value=text;$input.focus();$input.setSelectionRange($input.value.length,$input.value.length);}
function closeRail(restoreFocus=true){
  if(byId('navigation-overlay').hidden)return;
  byId('navigation-overlay').hidden=true;byId('menu-toggle').setAttribute('aria-expanded','false');
  byId('app-shell').inert=false;
  if(restoreFocus)byId('menu-toggle').focus();
}
function openRail(){
  closePanel();byId('navigation-overlay').hidden=false;byId('menu-toggle').setAttribute('aria-expanded','true');
  byId('app-shell').inert=true;byId('close-navigation').focus();
}
function newVisit(){if(busy)return;byId('research-offer').hidden=state.welcomeSeen;state.active=null;persist();lastQuestion='';render();setStatus('A fresh question. Your earlier explorations and notes remain here.');byId('stage-inner').scrollTop=0;closeRail();$input.focus();}
function demoReply(q){
 const text=q.toLowerCase();
 if(/\b(capitalism|market|economic system)\b/.test(text))return 'The economy has entered the courtroom.\n\nTHE HISTORIAN: Markets have taken many institutional forms. None appeared outside history.\nTHE ECONOMIST: Incentives coordinate decisions, but their benefits and burdens depend on rules and distribution.\nTHE TRIAL LAWYER: “Capitalism” is carrying several definitions into one witness chair. Which form, and which claim, are we testing?\n\nThese are fictional, scripted perspectives—not independent expert testimony. We could examine freedom, innovation, inequality, ecology, or alternatives. A useful verdict begins with a narrower charge.';
 if(/\b(bread|loaf|grocery|price)\b/.test(text))return 'A loaf of bread is a small economic system disguised as lunch.\n\nZOOM OUT: Wheat and fuel markets, labor, packaging, transport, retail rent, local competition, wages and household purchasing power all shape the possible story.\nZOOM IN: At a particular store, we would need actual cost and pricing records to know which factors set its $4 shelf price.\n\nTo put this claim on trial, I would ask: what proportion comes from ingredients, labor, overhead and markup? We do not have that evidence here.\n\nThis is a scripted illustration of the Atlas method, not a live price investigation.';
 if(/\b(color|vision|seeing|perception|language|word|meaning)\b/.test(text))return 'A sentence can describe a color, or warn you that a stair is difficult to see. It can change how someone prepares to act without giving them another person’s sensory experience.\n\nWittgenstein offers a route into meaning-in-use; Austin helps examine what speech does under real social conditions. Neither framework means words simply manufacture the physical world.\n\nOne question worth testing: where does useful translation end, and where does experience resist description?';
 if(/\b(simulat|world|imagine|fiction|what if)\b/.test(text))return 'Welcome to the Simulation Wing. We can change an imagined rule, but the results will be **hypothetical**, not forecasts.\n\nFirst identify the rule you changed. Next ask who adapts, what new incentives appear, and which unexpected tradeoffs might follow. Then work backward: what would have to be true to test this outside fiction?\n\nI am a scripted preview here. A live model would be needed to improvise the details of your own world.';
 if(/\b(banter|bbs|debate|argument|socratic)\b/.test(text))return 'The BBs have heard the summons.\n\nTHE PHILOSOPHER: “What do the words actually commit us to?”\nTHE TRIAL LAWYER: “And who has produced a single exhibit?”\nTHE COMEDIAN: “No one. But the fonts look authoritative.”\n\nThis is a fictional demonstration. Name the proposition you want challenged; live AI is needed for an original debate about your specific claim.';
 return `The question you brought is: “${q.slice(0,160)}${q.length>160?'…':''}”\n\nHere is one useful way into it: distinguish (1) what we already know, (2) the assumptions being made, (3) another relevant discipline, and (4) the evidence that could change our minds.\n\nThis is a scripted preview, not an analysis of your specific question. Original conversational replies are not available in this preview. You can keep your question in your notebook, explore a connection, or inspect the research.`;
}
async function send(inputValue=$input.value){
 const text=String(inputValue||'').trim();if(!text||busy)return;busy=true;
 const thread=ensureThread(); const userMsg={id:id(),role:'user',text:text.slice(0,3500),kind:'visitor'}; const answer={id:id(),role:'assistant',text:'',kind:liveEnabled?'live':'demo'};
 thread.messages.push(userMsg,answer);thread.updated=Date.now();if(thread.title==='A fresh question')thread.title=text.slice(0,60);lastQuestion=text;$input.value='';render();setStatus('The Exhibit Cart is considering your question…');byId('stop-button').hidden=false;byId('send-button').disabled=true;
 const controller=new AbortController();activeController=controller;
 try{
   if(!liveEnabled){await new Promise(resolve=>setTimeout(resolve,100));if(controller.signal.aborted)throw new DOMException('Stopped','AbortError');answer.text=demoReply(text);render();}
   else{
     const messages=thread.messages.filter(m=>m.text).slice(-16).map(m=>({role:m.role,content:m.text.slice(0,3500)}));
     const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages}),signal:controller.signal});
     if(!response.ok){let message='The live Atlas could not reply.';try{const body=await response.json();if(typeof body.error==='string')message=body.error;}catch{}throw new Error(message);}
     if(!response.body)throw new Error('No response stream was returned.');
     const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';let doneEvent=false;
     while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let boundary;
       while((boundary=buffer.indexOf('\n'))>=0){const raw=buffer.slice(0,boundary).trim();buffer=buffer.slice(boundary+1);if(!raw)continue;const event=JSON.parse(raw);if(event.type==='delta'){answer.text=(answer.text+String(event.text||'')).slice(0,12000);const el=$conversation.querySelector(`[data-message-id="${answer.id}"] .message-text`);if(el)el.textContent=answer.text;byId('stage-inner').scrollTop=byId('stage-inner').scrollHeight;}if(event.type==='error')throw new Error('The live response stopped early.');if(event.type==='done')doneEvent=true;}
     }
     if(!doneEvent && !controller.signal.aborted)throw new Error('The live response was interrupted.');
   }
   setStatus('');
 }catch(error){if(error.name==='AbortError')setStatus('Stopped. Your question remains in the Atlas.');else{setStatus(error.message||'Unable to complete that reply.');if(!answer.text)answer.text='The Cart could not complete this reply. Your question is still here. Try again later.';}}
 finally{busy=false;activeController=null;byId('stop-button').hidden=true;byId('send-button').disabled=false;persist();render();}
}
function openPanel(which,seed=''){
  drawerReturnFocus=byId('navigation-overlay').contains(document.activeElement)?byId('menu-toggle'):document.activeElement;
  closeRail(false);
  const title=byId('drawer-title'),kicker=byId('drawer-kicker');$body.replaceChildren();
  const container=document.createElement('div');
  if(which==='connections'){
    title.textContent='One question. Many ways in.';kicker.textContent='FOLLOW A CONNECTION';
    container.innerHTML='<p id="connections-title"></p><p id="connections-description" class="muted"></p><div id="lens-list" class="lens-list"></div><p class="muted">These are suggested lenses, not evidence that a connection is true. Choose one to draft a question for the Cart; you can edit it before sending.</p>';
  } else if(which==='invitation'){
    title.textContent=OPEN_INVITATION.title;kicker.textContent=OPEN_INVITATION.eyebrow;
    container.innerHTML=OPEN_INVITATION.paragraphs.map(p=>`<p>${escapeHTML(p)}</p>`).join('');
  } else if(which==='research'){
    title.textContent='The research behind the artwork';kicker.textContent='READ THE WHITE PAPER';
    container.innerHTML=`<div class="warning"><strong>Publication status:</strong> A complete, updated white paper is in development. This accessible research outline is available now; it is not a published or peer-reviewed final paper.</div><blockquote>The sentence is not the world. But it can change it.</blockquote><h3>Full Color Thinking</h3><p>Refraction · Connection · Cross-Examination · Translation · Imagination · Metacognition · Human Judgment. These are proposed inquiry practices, not proven educational improvements.</p><h3>Questions open for study</h3><ul>${RESEARCH_QUESTIONS.map(q=>`<li>${escapeHTML(q)}</li>`).join('')}</ul><h3>What could count as evidence?</h3><p>Clear definitions, independent comparison groups where suitable, accessible methods, real participants who consent to research, documented limitations, and the willingness to publish unfavorable results.</p><h3>Economic experiment</h3><p>${escapeHTML(PLEDGE.statement)}</p><p class="warning">${escapeHTML(PLEDGE.status)}. ${escapeHTML(PLEDGE.boundaries)}</p><p><strong>${escapeHTML(PLEDGE.principle)}</strong></p>`;
  } else if(which==='impact'){
    title.textContent='Research & real-world impact';kicker.textContent='THE EXPERIMENT OUTSIDE THE MUSEUM';
    container.innerHTML=`<blockquote>Story → Attention → Creation → Economic Value → Independent Inquiry → Evidence → Revision</blockquote><p>Each arrow is a question to investigate, not a result already established.</p><div class="research-card"><strong>THE PROPOSED 50% PLEDGE</strong><p>${escapeHTML(PLEDGE.statement)}</p><p><strong>Status: ${escapeHTML(PLEDGE.status)}.</strong></p><p>${escapeHTML(PLEDGE.boundaries)}</p></div><h3>Ways to take part without buying anything</h3><ul><li>Challenge a claim or suggest an alternative interpretation.</li><li>Bring a documented source or relevant prior art.</li><li>Propose an experiment or accessible learning method.</li><li>Create a fictional exhibit and mark it clearly as fiction.</li><li>Ask what would disprove the project’s own assumptions.</li></ul><p class="warning">This preview does not accept public research submissions, enroll study participants, collect donations or promise follow-up. You may save and export your own notes locally.</p><p><button data-resource="invitation">Open Invitation</button> <button data-resource="research">Read the White Paper</button></p>`;
  } else if(which==='archive'){
    title.textContent='The interdisciplinary archive';kicker.textContent='A CONVERSATION ACROSS CENTURIES';
    container.innerHTML='<p>These are carefully limited introductory interpretations, not verified direct quotations or endorsements of LBB.</p><div class="card-list">'+THINKERS.map(t=>`<article class="archive-card"><strong>${escapeHTML(t.name)}</strong><p>${escapeHTML(t.field)} · ${escapeHTML(t.idea)}</p><small>${escapeHTML(t.limit)}</small><p><button class="inline-action" data-explore="${escapeHTML(t.name)}">Explore this connection →</button></p></article>`).join('')+'</div>';
  } else if(which==='banter'){
    title.textContent='The Banter Bots';kicker.textContent='AN INTELLECTUAL ENSEMBLE · FICTIONAL';
    container.innerHTML='<p>A historian, trial lawyer, philosopher, economist, poet, and occasional Chaos Goblin may disagree with each other—and with the Exhibit Cart. Their voices are fictional simulations, never independent expert endorsements.</p><h3>Let the arguments begin</h3><div class="bullet-grid"><button data-prompt="Summon the Historian, Economist, and Trial Lawyer as explicitly fictional Banter Bots to debate this claim fairly: ">Put a claim on trial</button><button data-prompt="Have the Skeptic, Poet, and Philosopher debate what counts as a good idea. Label their dialogue fictional.">Three very different minds</button><button data-prompt="Have a fictional Chaos Goblin expose the assumptions hiding in this argument: ">Invite the Chaos Goblin</button><button data-prompt="Cross-examine the Exhibit Cart itself. Identify the weak premises in your last answer.">Cross-examine the Cart</button></div><p class="muted">A live model is needed for newly improvised debates; preview mode shows labeled scripted examples.</p>';
  } else if(which==='simulation'){
    title.textContent='What if we changed the rules?';kicker.textContent='THE REALITY SIMULATION WING';
    container.innerHTML='<p>Imagine a world, alter one assumption, examine consequences, and work backward toward possible reality. Hypothetical results are not forecasts.</p><form id="simulation-form"><label for="world-rule">The rule you would change</label><textarea id="world-rule" required maxlength="900" placeholder="What if every city were designed around children’s mobility?"></textarea><label for="world-constraint">The constraint you will keep</label><input id="world-constraint" maxlength="400" placeholder="Limited public budgets, for example" /><p><button type="submit" class="primary-action">Enter this possible world →</button></p></form><p class="muted">The Cart will ask who benefits, what breaks, and what would have to be true for a real test.</p>';
  } else if(which==='notebook'){
    title.textContent='My Living Notebook';kicker.textContent='THE VISITOR KEEPS THE RECORD';
    container.innerHTML=`<p>Keep what you decide matters. Your entries stay in this browser; revisions preserve earlier wording. They are not independently verified evidence.</p><form id="note-form"><label for="note-category">What kind of entry?</label><select id="note-category">${CATEGORIES.map(x=>`<option>${escapeHTML(x)}</option>`).join('')}</select><label for="note-text">Your entry</label><textarea id="note-text" maxlength="4000" required placeholder="A question, theory, objection, or possible next step…">${escapeHTML(seed.slice(0,4000))}</textarea><p><button type="submit" class="primary-action">Save to my notebook</button></p></form><div id="saved-notes"></div><button id="notebook-export">Export my record ↓</button>`;
  } else if(which==='settings'){
    title.textContent='Make the Atlas yours';kicker.textContent='ACCESSIBILITY & PRIVACY';
    container.innerHTML=`<p>The Atlas should be intellectually accessible even without its visual effects. These preferences are saved only on this device.</p><div class="setting-row"><label><input id="high-contrast" type="checkbox" ${state.highContrast?'checked':''}/> High contrast / reduced glare</label></div><div class="setting-row"><label for="text-scale">Reading text size</label><select id="text-scale"><option value="normal" ${state.scale==='normal'?'selected':''}>Comfortable</option><option value="large" ${state.scale==='large'?'selected':''}>Large</option><option value="larger" ${state.scale==='larger'?'selected':''}>Larger</option></select></div><h3>Your local record</h3><p>Conversations and notebook entries remain in your browser's local storage. No account or cloud synchronization is enabled. In live mode, the most recent messages in the active conversation are sent to OpenAI to generate the next reply; saved notebook entries are not included automatically. This preview does not enroll anyone in research.</p><p><button id="settings-export">Export my data ↓</button> <button id="settings-reset">Erase local conversations & notes</button></p>`;
  } else return;
  $body.appendChild(container);$overlay.hidden=false;byId('app-shell').inert=true;$overlay.querySelector('.drawer').focus();
  if(which==='connections')renderLenses();
  $body.querySelectorAll('[data-resource]').forEach(b=>b.addEventListener('click',()=>{const returnFocus=drawerReturnFocus;openPanel(b.dataset.resource);drawerReturnFocus=returnFocus;}));
  if(which==='notebook')renderNotes();
  if(which==='simulation')byId('simulation-form')?.addEventListener('submit',event=>{event.preventDefault();const rule=byId('world-rule').value.trim();const constraint=byId('world-constraint').value.trim();if(rule){closePanel();send(`Imagine a clearly HYPOTHETICAL world with this rule: ${rule}. ${constraint?`Keep this constraint: ${constraint}.`:''} Explore second-order consequences, tradeoffs, opposing fictional BB viewpoints, and the evidence needed before any real-world claim.`);}});
  if(which==='notebook')byId('note-form')?.addEventListener('submit',event=>{event.preventDefault();const text=byId('note-text').value.trim();if(!text)return;state.notes.push({id:id(),category:byId('note-category').value,versions:[{text,time:Date.now()}],verified:false});persist();byId('note-text').value='';renderNotes();renderThreads();});
  if(which==='settings'){byId('high-contrast').addEventListener('change',e=>{state.highContrast=e.target.checked;persist();syncSettings();});byId('text-scale').addEventListener('change',e=>{state.scale=e.target.value;persist();syncSettings();});byId('settings-export').addEventListener('click',exportRecord);byId('settings-reset').addEventListener('click',()=>{if(confirm('Erase saved conversations and notebook entries on this device?')){localStorage.removeItem(STORAGE_KEY);Object.assign(state,initial());syncSettings();closePanel();render();}});}
  if(which==='notebook')byId('notebook-export')?.addEventListener('click',exportRecord);
  $body.querySelectorAll('[data-explore]').forEach(b=>b.addEventListener('click',()=>prefill(`Help me explore ${b.dataset.explore}'s authentic ideas, their historical setting, and the limits of applying them to my question: ${lastQuestion||'language and human judgment'}.`)));
  $body.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>prefill(b.dataset.prompt)));
}
function renderNotes(){const el=byId('saved-notes');if(!el)return;el.replaceChildren();const head=document.createElement('h3');head.textContent=`Saved entries (${state.notes.length})`;el.appendChild(head);if(!state.notes.length){const p=document.createElement('p');p.className='note-empty';p.textContent='The first margin is yours.';el.appendChild(p);return;}
 for(const note of [...state.notes].reverse()){const current=note.versions.at(-1);const card=document.createElement('article');card.className='entry-card';card.innerHTML=`<h4>${escapeHTML(note.category)}</h4><p>${escapeHTML(current.text)}</p><small class="muted">Visitor-owned · unverified · ${note.versions.length} version${note.versions.length===1?'':'s'}</small>`;const actions=document.createElement('div');actions.className='entry-actions';const revise=document.createElement('button');revise.textContent='Revise';revise.addEventListener('click',()=>{const edited=prompt('New wording (original will be preserved):',current.text);if(edited&&edited.trim()&&edited.trim()!==current.text){note.versions.push({text:edited.trim().slice(0,4000),time:Date.now()});persist();renderNotes();}});const remove=document.createElement('button');remove.textContent='Delete';remove.addEventListener('click',()=>{if(confirm('Delete this entry and all its local versions?')){state.notes=state.notes.filter(n=>n.id!==note.id);persist();renderNotes();renderThreads();}});actions.append(revise,remove);card.appendChild(actions);if(note.versions.length>1){const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Revision history';details.appendChild(summary);note.versions.slice(0,-1).forEach(v=>{const p=document.createElement('p');p.textContent=v.text;details.appendChild(p);});card.appendChild(details);}el.appendChild(card);}
}
function closePanel(){if($overlay.hidden)return;$overlay.hidden=true;$body.replaceChildren();byId('app-shell').inert=false;if(drawerReturnFocus&&drawerReturnFocus.isConnected)drawerReturnFocus.focus();drawerReturnFocus=null;}
function exportRecord(){const blob=new Blob([JSON.stringify({exported:new Date().toISOString(),...state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='full-color-atlas-my-record.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function init(){
  syncSettings();
  byId('research-offer').hidden=state.welcomeSeen;
  if(!activeThread()?.messages.length){state.welcomeSeen=true;persist();}
  const starters=STARTER_SETS[Math.floor(Math.random()*STARTER_SETS.length)];const grid=byId('starter-grid');for(const question of starters){const b=document.createElement('button');b.type='button';b.className='starter';const t=document.createElement('strong');t.textContent=question;const arrow=document.createElement('span');arrow.textContent='→';b.append(t,arrow);b.addEventListener('click',()=>send(question));grid.appendChild(b);}
  byId('chat-form').addEventListener('submit',e=>{e.preventDefault();send();});$input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send();}});byId('stop-button').addEventListener('click',()=>activeController?.abort());byId('new-visit').addEventListener('click',newVisit);
  byId('export-button').addEventListener('click',exportRecord);byId('brand-link').addEventListener('click',e=>{e.preventDefault();newVisit();});byId('menu-toggle').addEventListener('click',openRail);
  byId('close-navigation').addEventListener('click',()=>closeRail());byId('rail-backdrop').addEventListener('click',()=>closeRail());byId('fresh-question').addEventListener('click',newVisit);
  document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel)));document.querySelectorAll('[data-action="conversation"]').forEach(b=>b.addEventListener('click',()=>{closePanel();closeRail();$input.focus();}));document.querySelectorAll('[data-action="cross-examine"]').forEach(b=>b.addEventListener('click',()=>prefill(`Put this on trial: ${lastQuestion||'a claim I want to test'}. Separate testimony, inference, evidence, objections, and what could change the verdict.`)));document.querySelectorAll('[data-action="close-drawer"]').forEach(b=>b.addEventListener('click',closePanel));byId('close-drawer').addEventListener('click',closePanel);document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePanel();closeRail();}});
  render();
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const modal=!$overlay.hidden?$overlay.querySelector('.drawer'):!byId('navigation-overlay').hidden?byId('museum-rail'):null;
    if(!modal)return;
    const focusable=[...modal.querySelectorAll('button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]')].filter(el=>el.getClientRects().length);
    const first=focusable[0],last=focusable.at(-1);
    if(!first){event.preventDefault();modal.focus();return;}
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===modal)){event.preventDefault();first.focus();}
  });
  fetch('/api/chat',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{liveEnabled=data.enabled===true;byId('model-state').textContent=liveEnabled?'LIVE AI · OPENAI':'SCRIPTED PREVIEW';byId('privacy-line').textContent=liveEnabled?'Live mode uses OpenAI to answer your messages. Notebook entries are not automatically shared.': 'This is a scripted preview, not live AI. Your notebook stays in this browser.';}).catch(()=>{liveEnabled=false;byId('model-state').textContent='OFFLINE · SCRIPTED PREVIEW';});
}
init();
