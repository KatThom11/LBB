import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Contrast, Download, Leaf, Play, RotateCcw, ShieldCheck, X } from 'lucide-react';
import AtlasDrawer from './components/AtlasDrawer';
import Modal from './components/Modal';
import NotebookSpread from './components/NotebookSpread';
import WorkingDraft from './components/WorkingDraft';
import { DRAFT } from './content/workingDraft';
import { ORIGINAL, ASSENT_PROPOSITION, SCENES, SOURCES, SYNTHETIC } from './data';
import { readSession, reducer, STORAGE_KEY } from './state';

function VerifyForm({ state, dispatch, onClose, announce }) {
  const [sourceId, setSourceId] = useState('mcluhan');
  const [consulted, setConsulted] = useState(false);
  const [outcome, setOutcome] = useState('Unresolved');
  const [note, setNote] = useState('');
  const source = SOURCES.find(s => s.id === sourceId);
  return <form onSubmit={e => { e.preventDefault(); dispatch({ type: 'check', check: { id: sourceId, outcome, note } }); announce('Your source check was recorded as ' + outcome + '. The claim is not validated.'); onClose(); }}>
    <p>A reference opens a question. It does not close the case.</p>
    <label className="form-label" htmlFor="source">Primary source to consult</label><select id="source" value={sourceId} onChange={e => { setSourceId(e.target.value); setConsulted(false); setNote(''); setOutcome('Unresolved'); }}>{SOURCES.map(s => <option key={s.id} value={s.id}>{s.author} · {s.location}</option>)}</select>
    <section className="source-card"><span className="eyebrow">BOUNDED SOURCE CHECK</span><h3>{source.title}</h3><strong>{source.location}</strong><p>{source.scope}</p><p className="warning-note">{source.limit}</p></section>
    <p className="fine-print">Use an authorized copy of the primary text. This app has no supplied excerpts and performs no external lookup. It cannot certify a source check.</p>
    <label className="check-label"><input type="checkbox" checked={consulted} onChange={e => setConsulted(e.target.checked)} /> I consulted this primary text myself.</label>
    <label className="form-label" htmlFor="outcome">Your bounded finding</label><select id="outcome" value={outcome} onChange={e => setOutcome(e.target.value)}><option>Unresolved</option><option>Context only</option><option>No support found</option></select>
    <label className="form-label" htmlFor="source-note">Edition, page, and limits of the check (optional)</label><textarea id="source-note" maxLength={2000} rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Record what you consulted and what it does or does not establish." />
    {state.mode === 'replay' && <p className="warning-note">You are editing a curated replay. It remains labeled as an example.</p>}
    <button className="button button-dark" type="submit" disabled={!consulted}><Check size={16} /> Record my source check</button>
  </form>;
}

function HoldForm({ state, dispatch, onClose, announce }) {
  const [reason, setReason] = useState(state.holdReason);
  return <form onSubmit={e => { e.preventDefault(); if (!reason.trim()) return; dispatch({ type: 'set', value: { disposition: 'Held as provisional', holdReason: reason.trim() } }); announce('Claim held as provisional, with your reason. No verdict required.'); onClose(); }}><p>Incomplete certainty is a legitimate disposition. What makes withholding judgment appropriate here?</p><label className="form-label" htmlFor="hold-reason">Reason for holding this claim</label><textarea id="hold-reason" required maxLength={2000} rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="What remains missing, unsettled, or outside this notebook?" /><button className="button button-dark" disabled={!reason.trim()}>Keep as provisional</button></form>;
}

function RouteForm({ state, dispatch, announce }) {
  const [question, setQuestion] = useState(state.reviewQuestion);
  function download(e) {
    e.preventDefault();
    const record = {
      title: 'LBB — Human review package', schemaVersion: 2, createdAt: new Date().toISOString(),
      basis: { title: DRAFT.title, date: DRAFT.date, sha256: DRAFT.sha256 },
      provenance: state.mode === 'replay' ? 'Curated replay example, not a participant record.' : 'Visitor record within a route adapted from the supplied working draft; all scene utterances are labeled illustrations or scripted reconstructions.',
      original: ORIGINAL, question: question.trim(), embodiedResponse: state.bodyResponse, embodiedNote: state.bodyNote, readings: state.readingChoices,
      humanAssent: { proposition: ASSENT_PROPOSITION, response: state.assentResponse || 'No response recorded', limitation: 'No independent endorsement of the discovery follows.' },
      sourceChecks: state.checks, disposition: state.disposition, holdReason: state.holdReason, judgment: state.judgment, judgmentReason: state.judgmentReason, judgmentComplete: Boolean(state.judgment) && (state.judgment !== 'Retain with reasons' || Boolean(state.judgmentReason.trim())) && (state.judgment !== 'Revise' || Boolean(state.revisedClaim.trim())),
      revisedClaim: state.revisedClaim, outsideChange: { report: state.outsideChange, status: 'Visitor-reported, not independently verified' }, syntheticExpansions: state.generated,
      limitations: 'No claim has been independently validated. The integrated proposal was supplied; the full Atlas, primary excerpts, original equation, and archival transcripts remain unavailable. Download only; no message is sent.',
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'lbb-human-review.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    dispatch({ type: 'set', value: { reviewQuestion: question.trim(), routed: true, disposition: 'Prepared for human review' } });
    announce('Review package downloaded. Nothing was sent to another person.');
  }
  return <form onSubmit={download}><p>Take a bounded question to someone who can answer it.</p><label className="form-label" htmlFor="review-question">Question for a human reviewer</label><textarea id="review-question" required maxLength={2000} rows={5} value={question} onChange={e => setQuestion(e.target.value)} /><div className="source-card"><span className="eyebrow">THE PACKAGE INCLUDES</span><p>The original sentence, your annotations, source-check notes, explicit assent status, synthetic expansions, and current disposition.</p></div><p className="fine-print">Review before sharing. This downloads a JSON file to your device. It does not contact a reviewer.</p><button className="button button-dark" disabled={!question.trim()}><Download size={16} /> Download review package</button>{state.routed && <p role="status" className="success-message"><Check size={16} /> Download prepared. No information sent.</p>}</form>;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, readSession);
  const [modal, setModal] = useState(null);
  const [view, setView] = useState('notebook');
  const [announcement, setAnnouncement] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [contrast, setContrast] = useState(() => { try { return localStorage.getItem('lbb-contrast') === 'true'; } catch { return false; } });
  const hasNavigated = useRef(false);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, state })); setStorageError(false); } catch { setStorageError(true); } }, [state]);
  useEffect(() => { document.documentElement.dataset.contrast = contrast ? 'high' : 'normal'; try { localStorage.setItem('lbb-contrast', String(contrast)); } catch { /* Contrast works in memory if storage is blocked. */ } }, [contrast]);
  useEffect(() => { if (hasNavigated.current) document.getElementById('scene-title')?.focus(); }, [state.scene]);
  function go(scene) { hasNavigated.current = true; dispatch({ type: 'set', value: { scene } }); }
  function onAction(action) {
    if (action === 'verify' || action === 'route' || action === 'hold') { setModal(action); return; }
    if (action === 'generate') { const next = (SYNTHETIC.indexOf(state.generated.at(-1)) + 1) % SYNTHETIC.length; dispatch({ type: 'generate', text: SYNTHETIC[next] }); setAnnouncement('A curated synthetic expansion was added. No model or external API was called.'); }
    if (action === 'stop') { dispatch({ type: 'stop' }); setAnnouncement('Generation stopped. Synthetic expansions cleared; your decisions and source checks are retained.'); }
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to notebook</a>
    <header className="site-header"><a href="#main" className="brand" aria-label="LBB, The Living Notebook"><span className="brand-mark"><BookOpen size={24} strokeWidth={1.4} /></span><span className="brand-name">LBB<span className="brand-divider">/</span><span className="brand-subtitle">The Living Notebook</span></span></a><nav aria-label="Notebook utilities"><div className="view-switch" role="group" aria-label="Presentation form"><button aria-pressed={view === 'notebook'} onClick={() => setView('notebook')}>Notebook</button><button aria-pressed={view === 'paper'} onClick={() => setView('paper')}>Working draft</button></div><button className="icon-button contrast-button" aria-label="High contrast theme" aria-pressed={contrast} onClick={() => setContrast(!contrast)}><Contrast size={18} /></button><button className="atlas-button" onClick={() => setModal('atlas')}><span className="atlas-dots" aria-hidden="true"><i /><i /><i /><i /></span>Full Color Atlas <ArrowUpRight size={16} /></button></nav></header>
    <main id="main">
      {view === 'paper' ? <WorkingDraft onNotebook={() => setView('notebook')} /> : <>
      <section className="intro-row"><div><div className="eyebrow project-kicker"><span className="dash" /> A WORKSPACE FOR LANGUAGE & ITS LIMITS</div><h1>The sentence is not the world.<br /><em>But it can change it.</em></h1><p>LBB is The Living Notebook. The written Full Color Atlas is its evolving intellectual map.</p><div className="entry-actions"><button className="text-button" onClick={() => go(0)}>EXAMINE A CLAIM <ArrowRight size={13} /></button><button className="text-button" onClick={() => { go(1); dispatch({ type: 'generate', text: SYNTHETIC[1] }); setAnnouncement('Counterargument: language can communicate useful practical knowledge without reproducing another person’s experience. Examine that alternative alongside the extension.'); }}>ARGUE THE OPPOSITE <ArrowUpRight size={13} /></button><button className="text-button" onClick={() => { go(0); dispatch({ type: 'set', value: { path: 'core' } }); }}>TAKE THE SHORT TOUR <Play size={12} /></button></div></div><div className="session-stamp"><Leaf size={16} /><span>TEXT FIRST.<br />HUMAN DECIDED.</span></div></section>
      <div className="workspace-grid">
        <aside className="journey-sidebar" aria-label="Walkthrough"><div className="sidebar-title"><span className="eyebrow">YOUR WALK THROUGH</span><span>06 SCENES</span></div><div className="path-switch" role="group" aria-label="Walkthrough length"><button aria-pressed={state.path === 'core'} className={state.path === 'core' ? 'active' : ''} onClick={() => dispatch({ type: 'set', value: { path: 'core' } })}>Core path <span>3–4 min</span></button><button aria-pressed={state.path === 'extended'} className={state.path === 'extended' ? 'active' : ''} onClick={() => dispatch({ type: 'set', value: { path: 'extended' } })}>Extended <span>8–10 min</span></button></div>
          <nav className="scene-nav" aria-label="Scenes">{SCENES.map((scene, i) => <button key={scene.title} aria-label={`${String(i + 1).padStart(2, '0')} ${scene.short}`} className={`scene-link ${state.scene === i ? 'current' : ''}`} aria-current={state.scene === i ? 'step' : undefined} onClick={() => go(i)}><span className="scene-index">{String(i + 1).padStart(2, '0')}</span><span>{scene.short}</span>{state.scene === i && <ArrowRight size={14} />}</button>)}</nav>
          <div className="sidebar-note"><span className="small-dot" /><p>This notebook does not tell you what to think.<br /><strong>It makes the thinking visible.</strong></p></div>
          <div className="mode-card"><div><span className="eyebrow">{state.mode === 'replay' ? 'CURATED REPLAY' : 'LOCAL DEMO'}</span><span className="mode-dot" /></div><p>{state.mode === 'replay' ? 'Example choices are prefilled and labeled. Explore at your own pace.' : 'No live model. No account. Your notes stay in this browser.'}</p><button className="text-button" onClick={() => setModal('replay')}><Play size={12} /> {state.mode === 'replay' ? 'RESTART REPLAY' : 'EXPLORE CURATED REPLAY'}</button></div>
        </aside>
        <div className="notebook-column">{state.mode === 'replay' && <div className="replay-banner"><Play size={15} /><span>Curated replay · Example decisions, not participant data.</span><button className="text-button" onClick={() => setModal('reset')}>START MY OWN <X size={14} /></button></div>}<NotebookSpread state={state} dispatch={dispatch} onAction={onAction} onAtlas={() => setModal('atlas')} />
          <div className="page-controls"><button className="text-button previous-button" disabled={state.scene === 0} onClick={() => go(state.scene - 1)}><ArrowLeft size={15} /> PREVIOUS SCENE</button><div className="progress-dots" role="img" aria-label={`Scene ${state.scene + 1} of 6`}>{SCENES.map((s, i) => <span key={s.title} className={i === state.scene ? 'active' : ''} />)}</div>{state.scene < 5 ? <button className="button button-dark next-button" onClick={() => go(state.scene + 1)}>Next scene <ArrowRight size={17} /></button> : <button className="button button-dark" onClick={() => onAction('route')}>Carry it forward <ArrowUpRight size={17} /></button>}</div>
        </div>
      </div>
      </>}
      <div className="status-line" role="status" aria-live="polite">{announcement}</div>
      {storageError && <p role="alert" className="storage-error">Browser storage is unavailable or full. Your session works in memory but may not survive a reload. Export your record to keep it.</p>}
    </main>
    <footer className="site-footer"><span>LBB / LANGUAGE BEYOND BINARY</span><div><button className="text-button" onClick={() => setModal('about')}>ABOUT THE NOTEBOOK <ArrowUpRight size={12} /></button><button className="text-button footer-replay" onClick={() => setModal('replay')}><Play size={12} /> CURATED REPLAY</button><button className="text-button" onClick={() => setModal('reset')}><RotateCcw size={12} /> NEW SESSION</button><span className="privacy-label"><ShieldCheck size={13} /> LOCAL ONLY</span></div></footer>
    {modal === 'atlas' && <AtlasDrawer onClose={() => setModal(null)} />}
    {modal === 'verify' && <Modal title="Check a foundation" onClose={() => setModal(null)}><VerifyForm state={state} dispatch={dispatch} onClose={() => setModal(null)} announce={setAnnouncement} /></Modal>}
    {modal === 'hold' && <Modal title="Hold without a verdict" onClose={() => setModal(null)}><HoldForm state={state} dispatch={dispatch} onClose={() => setModal(null)} announce={setAnnouncement} /></Modal>}
    {modal === 'route' && <Modal title="Route beyond the notebook" onClose={() => setModal(null)}><RouteForm state={state} dispatch={dispatch} announce={setAnnouncement} /></Modal>}
    {(modal === 'reset' || modal === 'replay') && <Modal title={modal === 'reset' ? 'A fresh page?' : 'Enter the curated replay?'} onClose={() => setModal(null)}><p>{modal === 'reset' ? 'This clears the notes, source checks, and choices saved in this browser. Your display theme is kept.' : 'The replay replaces your current session with labeled example annotations and a provisional disposition. All six scenes remain interactive. It needs no API or account.'}</p><p>You can download your current record before continuing.</p><div className="dialog-actions"><button className="button button-outline" onClick={() => setModal('route')}><Download size={15} /> Export current record</button><button className="button button-dark" onClick={() => { dispatch({ type: modal === 'reset' ? 'reset' : 'replay' }); setAnnouncement(modal === 'reset' ? 'New session started. Previous notes cleared.' : 'Curated replay loaded. All prefilled choices are examples.'); setModal(null); }}>{modal === 'reset' ? 'Clear and start fresh' : 'Load curated replay'}<ArrowRight size={15} /></button></div></Modal>}
    {modal === 'about' && <Modal title="An artifact. A way through it." onClose={() => setModal(null)}><p className="serif intro">The Living Notebook is both the subject of inquiry and the medium for experiencing it.</p><p>LBB (Language Beyond Binary) is The Living Notebook. The written Full Color Atlas is an evolving intellectual map that informs the notebook and is itself questioned through it. This route follows the integrated working draft supplied on 28 October 2026.</p><h3>For visitors</h3><p>Six scenes, a 3–4 minute core path, and an 8–10 minute extended path. Timings are estimates, not enforced limits.</p><h3>For reviewers</h3><p>The visitor-facing notebook and reviewer-facing working draft present one artifact. This prototype demonstrates provenance boundaries, useful generation, explicit assent and dissent, and revisable dispositions. The full integrated working proposal is readable in the Working draft view. The complete Atlas, primary excerpts, and original technical transcripts remain unavailable. The five margin labels are provenance operations, not the full Atlas taxonomy or truth scores. No empirical evaluation or conference acceptance is claimed.</p><h3>Privacy & replay</h3><p>No analytics, model calls, or external requests are made by the notebook. Session choices and contrast preference are stored in this browser’s local storage. A review package is downloaded only when you ask. New Session clears the local notebook record.</p><p className="fine-print">This is a reflective research prototype, not legal advice or a source-verification service.</p></Modal>}
  </div>;
}
