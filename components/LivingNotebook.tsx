'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, BookmarkPlus, Check, ChevronDown, CircleHelp, Compass, FlaskConical, Globe2, Library, Menu, MessageCircle, PanelRightClose, PanelRightOpen, Plus, Scale, Send, Settings2, ShieldCheck, Sparkles, Square, SquarePen, X } from 'lucide-react';
import Dialog from './Dialog';
import Notebook, { type NoteDraft } from './Notebook';
import Journey from './Journey';
import { journeys, journeyById, sources, provenanceLabels } from '@/lib/content';
import { demoReply } from '@/lib/demo';
import { categories, emptyWorkspace, freshConversation, freshProgress, id, now, STORAGE_KEY, workspaceSchema, type Conversation, type JourneyId, type Message, type NotebookEntry, type Workspace } from '@/lib/schema';

type View = 'chat' | 'journey' | 'sources';
const emptyDraft: NoteDraft = { text: '', category: 'My Theory', origin: 'visitor' };
const suggestions = ['Does language describe the world—or change it?', 'Help me test a theory.', 'Show me a different perspective.'];
const icons = { atlas: Globe2, trial: Scale, refraction: FlaskConical };
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function makeMessage(role: Message['role'], text: string, kind: Message['kind'], sourceIds: string[] = []): Message { return { id: id(), role, text, kind, createdAt: now(), sourceIds }; }
function pause(signal: AbortSignal) { return new Promise<void>((resolve, reject) => { const done = () => { signal.removeEventListener('abort', abort); resolve(); }; const timer = setTimeout(done, 16); const abort = () => { clearTimeout(timer); reject(new DOMException('Stopped', 'AbortError')); }; signal.addEventListener('abort', abort, { once: true }); if (signal.aborted) abort(); }); }

export default function LivingNotebook({ proposal }: { proposal: string }) {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [ready, setReady] = useState(false); const [recoveryRaw, setRecoveryRaw] = useState<string | null>(null); const [storageError, setStorageError] = useState(false);
  const [view, setView] = useState<View>('chat'); const [menuOpen, setMenuOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false); const [mobileNotebook, setMobileNotebook] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false); const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [checkingLive, setCheckingLive] = useState(false); const [input, setInput] = useState('');
  const [pending, setPending] = useState(false); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const [noteDraft, setNoteDraft] = useState<NoteDraft>(emptyDraft); const [selectedNotes, setSelectedNotes] = useState<string[]>([]); const [shareConsent, setShareConsent] = useState(false);
  const abortRef = useRef<AbortController | null>(null); const busyRef = useRef(false);
  const previousView = useRef<View>('chat');
  const composer = useRef<HTMLTextAreaElement>(null); const scroll = useRef<HTMLDivElement>(null); const follow = useRef(true);
  const conversation = workspace.conversations.find(c => c.id === workspace.activeId);
  const activeJourney = conversation?.currentJourney;

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const parsed = workspaceSchema.safeParse(JSON.parse(raw)); if (parsed.success) setWorkspace(parsed.data); else { setRecoveryRaw(raw); setNotice('The saved workspace could not be read. Its original data is kept. Export the recoverable record from Settings; new work stays in memory.'); } } } catch { try { setRecoveryRaw(localStorage.getItem(STORAGE_KEY)); } catch { /* Storage access itself is blocked. */ } setStorageError(true); }
    const media = window.matchMedia('(max-width: 1100px)'); setMobileNotebook(media.matches); setNotebookOpen(!media.matches);
    const resize = (event: MediaQueryListEvent) => { setMobileNotebook(event.matches); setNotebookOpen(!event.matches); }; media.addEventListener('change', resize); setReady(true);
    return () => { media.removeEventListener('change', resize); abortRef.current?.abort(); };
  }, []);
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!ready || recoveryRaw) return;
    // Leave unreadable records intact until a visitor actually changes the workspace.
    if (!loadedRef.current) { loadedRef.current = true; return; }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); setStorageError(false); } catch { setStorageError(true); }
  }, [workspace, ready, recoveryRaw]);
  useEffect(() => { document.documentElement.dataset.contrast = workspace.contrast ? 'high' : 'normal'; document.documentElement.dataset.textSize = workspace.textSize; }, [workspace.contrast, workspace.textSize]);
  useEffect(() => {
    const pane = scroll.current; if (!pane) return;
    if (view !== 'chat') { if (previousView.current !== view) pane.scrollTop = 0; }
    else if (!conversation?.messages.length) pane.scrollTop = 0;
    else if (follow.current) pane.scrollTop = pane.scrollHeight;
    previousView.current = view;
  }, [conversation?.messages, view]);
  function updateConversation(conversationId: string, change: (c: Conversation) => Conversation) { setWorkspace(w => ({ ...w, conversations: w.conversations.map(c => c.id === conversationId ? { ...change(c), updatedAt: now() } : c) })); }
  function ensureConversation(): Conversation {
    if (conversation) return conversation;
    const fresh = freshConversation(); setWorkspace(w => ({ ...w, activeId: fresh.id, conversations: [...w.conversations, fresh] })); return fresh;
  }
  function stop() { abortRef.current?.abort(); setNotice('The Cart has stopped. Your words and notes remain.'); }
  function newConversation() {
    if (workspace.conversations.length >= 50) { setError('This device has reached 50 conversations. Export your workspace before making room in browser storage.'); return; }
    stop(); follow.current = true; const fresh = freshConversation(); setWorkspace(w => ({ ...w, activeId: fresh.id, conversations: [...w.conversations, fresh] })); setInput(''); setView('chat'); setMenuOpen(false); setError(''); setSelectedNotes([]); setShareConsent(false); setNotice('A fresh conversation. Your earlier conversations and notebook entries are kept.'); composer.current?.focus();
  }
  function revisit(c: Conversation) { stop(); follow.current = true; setWorkspace(w => ({ ...w, activeId: c.id })); setView('chat'); setMenuOpen(false); setSelectedNotes([]); setShareConsent(false); setError(''); }
  function startJourney(journey: JourneyId) {
    const c = ensureConversation(); const definition = journeyById(journey);
    updateConversation(c.id, value => ({ ...value, currentJourney: journey, journeys: { ...value.journeys, [journey]: value.journeys[journey] || freshProgress() }, messages: value.messages.length < 200 && !value.journeys[journey] ? [...value.messages, makeMessage('assistant', `We can take a short path through ${definition.title}. Your conversation stays here, and your notebook comes with you.${!definition.available ? ' This is a framework only; the manuscript has not been supplied.' : ''}`, 'scripted')] : value.messages }));
    setView('journey'); setMenuOpen(false); setNotice(`${definition.title} opened within this conversation.`);
  }
  function returnToChat() {
    if (conversation && activeJourney) {
      const p = conversation.journeys[activeJourney];
      if (p?.step === 3 && !p.complete) updateConversation(conversation.id, c => ({ ...c, journeys: { ...c.journeys, [activeJourney]: { ...p, complete: true } }, messages: c.messages.length < 200 ? [...c.messages, makeMessage('assistant', `Back from ${journeyById(activeJourney).title}. ${p.thought ? `Your reflection was: “${p.thought.slice(0, 1800)}”` : 'You can leave a question open.'}\n\nYour provisional disposition: ${p.disposition}. No outside change is independently established. Where shall we take the conversation now?`, 'scripted')] : c.messages }));
    }
    setView('chat'); setNotice('Returned to the same conversation.'); composer.current?.focus();
  }
  function updateProgress(value: Partial<ReturnType<typeof freshProgress>>) { if (!conversation || !activeJourney) return; updateConversation(conversation.id, c => ({ ...c, journeys: { ...c.journeys, [activeJourney]: { ...(c.journeys[activeJourney] || freshProgress()), ...value } } })); }
  function saveNote(draft = noteDraft, journeyId?: JourneyId) {
    if (!draft.text.trim()) return;
    if (workspace.entries.length >= 200) { setError('This notebook has reached 200 entries. Export your workspace before adding more.'); return; }
    const c = ensureConversation(); const entry: NotebookEntry = { id: id(), category: draft.category, conversationId: c.id, journeyId, sourceMessageId: draft.sourceMessageId, origin: draft.origin, status: 'unverified', revisions: [{ id: id(), text: draft.text.trim(), createdAt: now() }] };
    setWorkspace(w => ({ ...w, entries: [...w.entries, entry] })); setNoteDraft(emptyDraft); setNotice(`${draft.category} saved. No evidence status was automatically verified.`);
  }
  function reviseNote(entryId: string, text: string) {
    if (workspace.entries.find(e => e.id === entryId)!.revisions.length >= 50) { setError('This entry has 50 preserved versions. Export them or begin a new entry; no versions were overwritten.'); return; }
    setWorkspace(w => ({ ...w, entries: w.entries.map(e => e.id === entryId ? { ...e, revisions: [...e.revisions, { id: id(), text: text.trim(), createdAt: now() }] } : e) })); setNotice('Revision saved. Your original is preserved.');
  }
  function copyToNotebook(message: Message) { setNoteDraft({ text: message.text.slice(0, 4000), category: message.role === 'user' ? 'My Theory' : 'Questions', origin: message.role === 'user' ? 'visitor' : message.kind === 'ai-generated' ? 'ai-generated' : 'scripted', sourceMessageId: message.id }); setNotebookOpen(true); setNotice('Text placed in your notebook draft. Choose a category and save it when ready.'); }
  async function selectLive() {
    setCheckingLive(true); setError('');
    try { const result = await fetch('/api/chat', { cache: 'no-store' }); const status = await result.json(); if (!result.ok || !status.enabled) throw new Error('Live mode is not configured. Demo mode remains available; no paid request was made.'); setMode('live'); setSelectedNotes([]); setShareConsent(false); setNotice('Live mode selected. Conversation text goes to OpenAI; notebook entries are excluded unless explicitly selected and consented to.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Live mode is unavailable.'); } finally { setCheckingLive(false); }
  }
  async function send(text = input) {
    const trimmed = text.trim(); if (!trimmed || busyRef.current || !ready) return;
    if (mode === 'live' && selectedNotes.length && !shareConsent) { setError('Consent is required before sending selected notebook entries.'); return; }
    if ((conversation?.messages.length || 0) > 197) { setError('This conversation has reached its local message limit. Start a fresh conversation; this one is kept.'); return; }
    const c = ensureConversation(); const userMessage = makeMessage('user', trimmed.slice(0, 3000), 'visitor');
    const answer = makeMessage('assistant', '', mode === 'demo' ? 'scripted' : 'ai-generated');
    const controller = new AbortController(); abortRef.current = controller; busyRef.current = true; setPending(true); setInput(''); setError(''); setView('chat'); follow.current = true;
    updateConversation(c.id, value => ({ ...value, title: value.messages.some(m => m.role === 'user') ? value.title : trimmed.slice(0, 45), messages: [...value.messages, userMessage, answer] }));
    function append(delta: string) { updateConversation(c.id, value => ({ ...value, messages: value.messages.map(m => m.id === answer.id ? { ...m, text: (m.text + delta).slice(0, 8000) } : m) })); }
    try {
      if (mode === 'demo') {
        const response = demoReply(trimmed, c.currentJourney); updateConversation(c.id, value => ({ ...value, messages: value.messages.map(m => m.id === answer.id ? { ...m, sourceIds: response.sourceIds } : m) }));
        const chunks = response.text.match(/[\s\S]{1,20}/g) || [response.text];
        // A visible, simulated stream. It never calls an external service.
        for (const chunk of chunks) { await pause(controller.signal); append(chunk); }
      } else {
        const history = [...c.messages.filter(m => m.text && !m.interrupted), userMessage].slice(-12).map(m => ({ role: m.role, content: m.text.slice(0, 3000) }));
        const approved = shareConsent ? workspace.entries.filter(e => selectedNotes.includes(e.id)).slice(0, 5).map(e => ({ category: e.category, text: e.revisions.at(-1)!.text.slice(0, 2000), status: e.status })) : [];
        const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ messages: history, journey: c.currentJourney, shareNotebook: shareConsent, notebook: approved }) });
        if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'The live reply is unavailable. Your message is kept; try demo mode.'); }
        if (!response.body) throw new Error('The live reply did not contain a stream.');
        const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let completed = false;
        function processLine(line: string) { if (!line.trim()) return; const event = JSON.parse(line); if (event.type === 'delta' && typeof event.text === 'string') append(event.text); if (event.type === 'error') throw new Error('The live reply was interrupted. Your partial reply and message are kept.'); if (event.type === 'done') completed = true; }
        while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n'); buffer = lines.pop()!; for (const line of lines) processLine(line); }
        buffer += decoder.decode(); if (buffer.trim()) processLine(buffer); if (!completed) throw new Error('The live connection ended before the reply completed.');
      }
      setNotice('The Exhibit Cart replied. The response is not verified evidence.');
    } catch (e) {
      const stopped = controller.signal.aborted;
      updateConversation(c.id, value => ({ ...value, messages: value.messages.map(m => m.id === answer.id ? { ...m, interrupted: true, text: m.text || (stopped ? 'Reply stopped. We can leave it here.' : 'The reply could not be completed. Your message is still here; you can continue in demo mode.') } : m) }));
      if (!stopped) setError(e instanceof Error ? e.message : 'The reply could not be completed.');
    } finally { if (abortRef.current === controller) { busyRef.current = false; setPending(false); setShareConsent(false); setSelectedNotes([]); } }
  }
  function routeQuestion() { download('lbb-human-review.json', { conversation: conversation?.title, journey: activeJourney, progress: activeJourney ? conversation?.journeys[activeJourney] : null, question: conversation?.journeys[activeJourney || '']?.thought || 'What evidence would support this claim?', sourceRecords: sources, status: 'Prepared locally. Not sent to any person. No claim independently verified.' }); setNotice('Review package downloaded. Nothing was sent to another person.'); }
  function exportWorkspace() { download('lbb-notebook-workspace.json', recoveryRaw ? { workspace, unreadableSavedRecord: recoveryRaw } : workspace); setNotice('Your conversations and notebook revisions were downloaded.'); }
  const notebook = <Notebook entries={workspace.entries} draft={noteDraft} setDraft={setNoteDraft} onSave={() => saveNote()} onRevise={reviseNote} onClose={() => setNotebookOpen(false)} live={mode === 'live'} selected={selectedNotes} onSelect={entryId => { setSelectedNotes(s => s.includes(entryId) ? s.filter(i => i !== entryId) : [...s, entryId].slice(0, 5)); setShareConsent(false); }} />;
  function navigation() { return <>
    <div className="sidebar-brand"><span className="brand-emblem"><BookOpen size={22} strokeWidth={1.4} /></span><div><strong>LBB<span className="brand-dot">.</span></strong><span>The Living Notebook</span></div></div>
    <button className="new-conversation" onClick={newConversation} disabled={!ready}><SquarePen size={16} /> New conversation <Plus size={14} /></button>
    <div className="nav-section"><span className="eyebrow">YOUR CONVERSATIONS</span><div className="recent-conversations">{!workspace.conversations.length && <p className="empty-recent">A fresh thought starts here.</p>}{[...workspace.conversations].reverse().map(c => <button key={c.id} className={workspace.activeId === c.id && view === 'chat' ? 'active' : ''} onClick={() => revisit(c)}><MessageCircle size={14} /><span>{c.title}</span></button>)}</div></div>
    <div className="nav-section worlds-nav"><span className="eyebrow">WORLDS TO WANDER</span>{journeys.map(j => { const Icon = icons[j.id]; return <button key={j.id} onClick={() => startJourney(j.id)} className={view === 'journey' && activeJourney === j.id ? 'active' : ''}><Icon size={17} strokeWidth={1.5} /><span>{j.title}</span>{j.id === 'trial' && <span className="soon-dot" aria-label="Framework only" />}</button>; })}</div>
    <div className="utility-nav"><button onClick={() => { setView('chat'); setInput('My claim is: '); setMenuOpen(false); setNotice('Write the claim you want to examine. Nothing has been sent.'); requestAnimationFrame(() => composer.current?.focus()); }}><Scale size={16} strokeWidth={1.5} /> Cross-examination</button><button onClick={() => { setNotebookOpen(true); setMenuOpen(false); }}><BookOpen size={16} strokeWidth={1.5} /> My Notebook <span className="nav-count">{workspace.entries.length || ''}</span></button><button className={view === 'sources' ? 'active' : ''} onClick={() => { setView('sources'); setMenuOpen(false); }}><Library size={16} strokeWidth={1.5} /> Sources & research</button></div>
    <div className="sidebar-bottom"><div className="sidebar-thought">Not every thought needs a verdict.<br /><em>Some need a little more room.</em></div><button className="edition-button" onClick={() => setSettingsOpen(true)}><span className="mode-orb" /><span>{mode === 'demo' ? 'The demo edition' : 'Live conversation'}<small>{mode === 'demo' ? 'Scripted Cart · local notebook' : 'OpenAI · consented context'}</small></span><Settings2 size={15} /></button></div>
  </>; }
  return <div className={`living-app ${notebookOpen && !mobileNotebook ? 'notebook-visible' : ''}`}>
    <a className="skip-link" href="#conversation-main">Skip to conversation</a>
    <aside className="sidebar" aria-label="Main navigation">{navigation()}</aside>
    <div className="conversation-shell">
      <header className="conversation-header"><div><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><span className="header-name">The Living Notebook <ChevronDown size={12} /></span><span className="header-separator">/</span><span className="header-section">{view === 'sources' ? 'Sources & research' : view === 'journey' && activeJourney ? journeyById(activeJourney).title : 'A conversation'}</span></div><div><button className="mode-label" onClick={() => setSettingsOpen(true)}><span className="status-dot" />{mode === 'demo' ? 'DEMO MODE' : 'LIVE MODE'}</button><button className="notebook-toggle" aria-label={notebookOpen ? 'Close notebook' : 'Open notebook'} aria-expanded={notebookOpen} onClick={() => setNotebookOpen(!notebookOpen)}>{notebookOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}<span>My notebook</span></button></div></header>
      <main id="conversation-main" className="conversation-main">
        <div className="conversation-scroll" ref={scroll} onScroll={e => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; }}>
          {view === 'chat' && <>
            {!conversation?.messages.length && <section className="welcome"><div className="cart-seal" aria-hidden="true"><Sparkles size={27} strokeWidth={1} /><span /></div><div className="eyebrow welcome-kicker">A CONVERSATION WITH THE EXHIBIT CART</div><h1>A thought is a place<br />to <em>begin.</em></h1><p className="welcome-copy">Welcome to The Living Notebook.<br />We can talk about anything. Or I can show you<br className="desktop-break" /> something rather peculiar.</p><div className="suggestions" aria-label="Suggested questions">{suggestions.map(s => <button disabled={pending || !ready} key={s} onClick={() => send(s)}>{s}<ArrowUpRight size={14} /></button>)}</div><div className="optional-divider"><span />OR FOLLOW YOUR CURIOSITY<span /></div><div className="journey-cards">{journeys.map(j => { const Icon = icons[j.id]; return <button className={`journey-card ${j.color}`} key={j.id} onClick={() => startJourney(j.id)}><div className="journey-art"><Icon size={27} strokeWidth={1} /><span className="art-ring" /></div><span className="journey-card-title">{j.title}</span><span className="journey-card-copy">{j.subtitle}</span><span className="journey-card-link">{j.available ? 'Begin a journey' : 'Explore the framework'}<ArrowRight size={12} /></span></button>; })}</div><p className="welcome-foot">Conversation first. A world to explore, if you like.</p></section>}
            {Boolean(conversation?.messages.length) && <div className="message-history" role="log" aria-label="Conversation with the Exhibit Cart" aria-live="polite" aria-relevant="additions">{conversation!.messages.map(message => <article key={message.id} className={`message message-${message.role}`} aria-label={`${message.role === 'user' ? 'Your message' : 'Exhibit Cart reply'}${message.interrupted ? ', interrupted' : ''}`}><div className="message-avatar">{message.role === 'assistant' ? <Sparkles size={16} strokeWidth={1.4} /> : <span>Y</span>}</div><div className="message-content"><div className="message-heading"><h2>{message.role === 'assistant' ? 'Exhibit Cart' : 'You'}</h2>{message.role === 'assistant' && <span className="provenance-badge">{provenanceLabels[message.kind]}{message.interrupted ? ' · Interrupted' : ''}</span>}</div><div className="message-text">{message.text || <span className="thinking-dots" aria-label="The Cart is composing"><i /><i /><i /></span>}</div>{message.sourceIds.length > 0 && <div className="message-sources">{message.sourceIds.map(sourceId => <button className="source-chip" key={sourceId} onClick={() => setView('sources')}><Library size={11} />{sources.find(s => s.id === sourceId)?.author || sourceId}</button>)}</div>}{message.text && <div className="message-actions"><button className="text-button" onClick={() => copyToNotebook(message)}><BookmarkPlus size={13} /> Keep in notebook</button>{message.role === 'assistant' && /Full Color Atlas/.test(message.text) && <button className="text-button" onClick={() => startJourney('atlas')}>Explore the Atlas <ArrowRight size={13} /></button>}</div>}</div></article>)}{activeJourney && <button className="resume-journey" onClick={() => setView('journey')}><Compass size={15} /> Revisit {journeyById(activeJourney).title}<ArrowRight size={14} /></button>}</div>}
          </>}
          {view === 'journey' && conversation && activeJourney && <Journey key={`${conversation.id}-${activeJourney}`} id={activeJourney} progress={conversation.journeys[activeJourney] || freshProgress()} onUpdate={updateProgress} onSave={(text, category = 'My Theory') => { saveNote({ text, category, origin: 'visitor' }, activeJourney); if (!mobileNotebook) setNotebookOpen(true); }} onReturn={returnToChat} onSources={() => setView('sources')} onGenerate={() => { updateProgress({ disposition: 'A possibility generated' }); updateConversation(conversation.id, c => ({ ...c, messages: c.messages.length < 200 ? [...c.messages, makeMessage('assistant', 'Another possibility: the description helps someone decide what to ask next, without becoming a method that reproduces another person’s experience. This is a scripted extension, not corroboration.', 'scripted')] : c.messages })); setNotice('A scripted possibility was added to the conversation. It is not corroboration.'); }} onRoute={routeQuestion} onStop={() => { stop(); updateProgress({ disposition: 'Stopped' }); setView('chat'); }} />}
          {view === 'sources' && <section className="sources-view"><button className="text-button" onClick={() => setView(activeJourney ? 'journey' : 'chat')}><ArrowRight className="back-arrow" size={14} /> {activeJourney ? 'Back to journey' : 'Back to conversation'}</button><span className="eyebrow">THE SOURCE & TRANSFORMATION REGISTER</span><h1>A footnote is an<br /><em>invitation to look.</em></h1><p>Context, quotations, and evidence have different jobs. Here is what the Cart actually has—and what it doesn’t.</p>{sources.map(source => <article className="source-record" key={source.id}><span className="provenance-badge">{provenanceLabels[source.kind]}</span><h2>{source.title}</h2><p className="source-author">{source.author} · {source.location}</p><p>{source.text}</p><p className="source-limit">{source.limitation}</p></article>)}<div className="source-missing"><h2>Not in this notebook</h2><p>The complete written Atlas, original AI exchanges, unpublished A Trial of Color manuscript, and primary philosophical excerpts have not been supplied. The Cart has no access to private ChatGPT histories or NotebookLM.</p></div><details className="full-proposal"><summary>Read the supplied Living Notebook working proposal</summary><p>Author-facing draft, 28 October 2026. Preserved source; not a validated study or a confirmed conference submission. This chat-first implementation supersedes its mandatory visitor route.</p><pre>{proposal}</pre></details></section>}
        </div>
        <div className="composer-area">{view !== 'chat' && <button className="discuss-link text-button" onClick={() => { setView('chat'); composer.current?.focus(); }}>Discuss this with the Cart <MessageCircle size={13} /></button>}{mode === 'live' && selectedNotes.length > 0 && <label className="share-consent"><input type="checkbox" checked={shareConsent} onChange={e => setShareConsent(e.target.checked)} /> I consent to send these {selectedNotes.length} selected, unverified notebook {selectedNotes.length === 1 ? 'entry' : 'entries'} to OpenAI for this reply.</label>}<form className="composer" onSubmit={e => { e.preventDefault(); send(); }}><label className="sr-only" htmlFor="chat-input">Message the Exhibit Cart</label><textarea ref={composer} id="chat-input" disabled={!ready} rows={2} maxLength={3000} placeholder="Ask anything, challenge the Cart, or begin a thought…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} /><div className="composer-bottom"><span><Sparkles size={13} /> Exhibit Cart<span className="composer-mode">{mode === 'demo' ? '· Scripted demo' : '· Live AI'}</span></span>{pending ? <button type="button" className="send-button" aria-label="Stop reply" onClick={stop}><Square size={14} /></button> : <button className="send-button" aria-label="Send message" disabled={!ready || !input.trim() || (mode === 'live' && selectedNotes.length > 0 && !shareConsent)}><ArrowRight size={19} /></button>}</div></form><div className="composer-disclaimer"><span><ShieldCheck size={11} />{mode === 'demo' ? 'No live AI. Your conversations stay on this device.' : 'Live replies use OpenAI. Notebook sharing is opt-in for each reply.'}</span><button className="text-button" aria-label="Open display and privacy settings" onClick={() => setSettingsOpen(true)}><CircleHelp size={12} /></button></div></div>
      </main>
      <div className="app-status" role="status" aria-live="polite">{pending ? 'The Exhibit Cart is composing a reply.' : notice}</div>
      {error && !settingsOpen && <div className="error-banner" role="alert"><span>{error}</span><button className="icon-button" aria-label="Dismiss error" onClick={() => setError('')}><X size={15} /></button></div>}
      {(storageError || recoveryRaw) && <div className="storage-banner" role="alert">{recoveryRaw ? 'The previous saved record is unreadable and has been preserved. New work is in memory.' : 'Browser storage is unavailable or full. Your current work is in memory.'} <button className="text-button" onClick={exportWorkspace}>Export your workspace</button></div>}
    </div>
    {notebookOpen && !mobileNotebook && <aside className="notebook-panel" aria-label="Living notebook">{notebook}</aside>}
    {notebookOpen && mobileNotebook && <Dialog title="My notebook" onClose={() => setNotebookOpen(false)} className="notebook-dialog">{notebook}</Dialog>}
    {menuOpen && <Dialog title="Explore LBB" onClose={() => setMenuOpen(false)} className="navigation-dialog">{navigation()}</Dialog>}
    {settingsOpen && <Dialog title="Make yourself at home" onClose={() => setSettingsOpen(false)}><span className="eyebrow">THE CART & YOUR PRIVACY</span><p>The demo Cart uses authored, streamed scripts. It is not a live language model. You can chat and keep notes without an account or paid API.</p><div className="mode-options"><button aria-pressed={mode === 'demo'} onClick={() => { stop(); setMode('demo'); setSelectedNotes([]); setShareConsent(false); setError(''); }}><Sparkles size={16} />Scripted demo</button><button aria-pressed={mode === 'live'} disabled={checkingLive} onClick={selectLive}><MessageCircle size={16} />{checkingLive ? 'Checking availability…' : 'Live OpenAI mode'}</button></div><p className="fine-print">Live mode requires server configuration and approved API billing. If enabled, your recent conversation and current journey are sent to OpenAI. Notebook entries are excluded unless you select them and explicitly consent for that reply. No private notebooks, accounts, or books are connected. No paid request is made by checking availability.</p>{error && <p className="settings-error" role="alert">{error}</p>}<h3>Reading comfort</h3><label className="check-label"><input type="checkbox" checked={workspace.contrast} onChange={e => setWorkspace(w => ({ ...w, contrast: e.target.checked }))} /> High contrast</label><label className="form-label" htmlFor="text-size">Text size</label><select id="text-size" value={workspace.textSize} onChange={e => setWorkspace(w => ({ ...w, textSize: e.target.value as Workspace['textSize'] }))}><option value="normal">Comfortable</option><option value="large">Large</option><option value="larger">Larger</option></select><h3>Your local record</h3><p>Conversations and notebook versions are saved in this browser only. Earlier prototype records are preserved separately. There is no cloud sync or automatic research verification.</p><button className="button button-outline" onClick={exportWorkspace}><ArrowDownToLine size={15} /> Export conversations & notebook</button></Dialog>}
  </div>;
}
