'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookmarkPlus, CornerUpLeft, Pause, ScanSearch, Send, Sparkles, Square } from 'lucide-react';
import AtlasArtwork from './AtlasArtwork';
import ArtworkImage from './ArtworkImage';
import { artwork } from '@/lib/media';
import { journeyById, provenanceLabels, sources } from '@/lib/content';
import type { JourneyId, JourneyProgress } from '@/lib/schema';
export default function Journey({ id, progress, onUpdate, onSave, onReturn, onSources, onGenerate, onRoute, onStop }: {
  id: JourneyId; progress: JourneyProgress; onUpdate: (value: Partial<JourneyProgress>) => void;
  onSave: (text: string, category?: 'My Theory' | 'Questions') => void; onReturn: () => void;
  onSources: () => void; onGenerate: () => void; onRoute: () => void; onStop: () => void;
}) {
  const definition = journeyById(id); const step = definition.steps[progress.step];
  const [saved, setSaved] = useState(false); const [showSources, setShowSources] = useState(false); const [holding, setHolding] = useState(false);
  const initialStep = useRef(true);
  useEffect(() => {
    if (initialStep.current) { initialStep.current = false; return; }
    document.getElementById('journey-step-title')?.focus();
  }, [progress.step]);
  function save() { if (!progress.thought.trim()) return; onSave(progress.thought, id === 'trial' ? 'Questions' : 'My Theory'); setSaved(true); }
  return <section className={`journey-view ${definition.color}`} aria-label={`${definition.title} journey`}>
    <div className="journey-top"><button className="text-button" onClick={onReturn}><CornerUpLeft size={14} /> Back to conversation</button><span>{definition.duration}</span></div>
    <div className="journey-title"><span className="eyebrow">AN OPTIONAL JOURNEY WITHIN LBB</span><h1>{definition.title}</h1><p>{definition.subtitle}</p></div>
    {id === 'atlas' && <AtlasArtwork />}
    {id === 'refraction' && <figure className="journey-landscape"><div className="landscape-art"><ArtworkImage art={artwork.refraction} sizes="(max-width: 800px) 90vw, 700px" /></div><figcaption>The Refraction Lab · Runway concept artwork</figcaption></figure>}
    <nav className="journey-steps" aria-label="Journey steps">{definition.steps.map((s, i) => <button key={s.title} aria-current={progress.step === i ? 'step' : undefined} onClick={() => { onUpdate({ step: i }); setShowSources(false); }}><span>0{i + 1}</span>{s.title}</button>)}</nav>
    {!definition.available && <p className="content-notice">Journey framework only. The manuscript has not been supplied or ingested. No passage, character, or testimony is presented as coming from the book.</p>}
    <article className="journey-page"><div className="journey-page-label"><span className="eyebrow">{step.eyebrow}</span><span className="provenance-badge">{provenanceLabels[step.kind]}</span></div><h2 id="journey-step-title" tabIndex={-1}>{step.title}</h2><p className="journey-reading">{step.body}</p>
      {step.sourceIds.length > 0 && <div className="journey-source-links">{step.sourceIds.map(sourceId => { const source = sources.find(s => s.id === sourceId)!; return <button className="text-button" key={sourceId} onClick={() => setShowSources(!showSources)}><ScanSearch size={13} /> {source.author} · {source.location}</button>; })}</div>}
      {showSources && <div className="source-examination">{step.sourceIds.map(sourceId => { const s = sources.find(x => x.id === sourceId)!; return <section key={s.id}><strong>{s.title}</strong><p>{s.text}</p><small>{s.limitation}</small></section>; })}<button className="text-button" onClick={onSources}>Open the source register <ArrowRight size={13} /></button></div>}
      {id === 'refraction' && progress.step === 2 && <><div className="lab-actions"><button onClick={onGenerate}><Sparkles size={17} />GENERATE</button><button onClick={() => setShowSources(true)}><ScanSearch size={17} />VERIFY</button><button onClick={onRoute}><Send size={17} />ROUTE</button><button onClick={() => { setHolding(true); onUpdate({ disposition: 'Held as provisional' }); }}><Pause size={17} />HOLD</button><button onClick={onStop}><Square size={16} />STOP</button></div><p className="fine-print">Disposition: {progress.disposition}. No source has been automatically verified.</p>{holding && <><label className="form-label" htmlFor="hold-reason">Reason for holding judgment</label><textarea id="hold-reason" maxLength={2000} rows={3} value={progress.reason} onChange={e => onUpdate({ reason: e.target.value })} /></>}</>}
      {progress.step !== 3 && <div className="journey-reflection"><label htmlFor="journey-thought">{step.question}</label><textarea id="journey-thought" value={progress.thought} rows={4} maxLength={4000} onChange={e => { onUpdate({ thought: e.target.value }); setSaved(false); }} placeholder={id === 'trial' ? 'A question to carry into the future text…' : 'A thought worth keeping, even before it is finished…'} /><div><span>{saved ? 'Saved to your notebook. Earlier entries are kept.' : 'Your reflection stays with this conversation.'}</span><button className="small-button" onClick={save} disabled={!progress.thought.trim() || saved}><BookmarkPlus size={14} />{saved ? 'Saved to notebook' : 'Save to notebook'}</button></div></div>}
      {progress.step === 3 && <div className="world-return"><div><span className="eyebrow">THE ORIGINAL</span><p>{definition.steps[0].body}</p></div><div><span className="eyebrow">OUTSIDE INFORMATION & LIMITS</span><p>{step.sourceIds.length ? step.sourceIds.map(s => sources.find(x => x.id === s)!.limitation).join(' ') : 'No outside source or human response has been added.'}</p></div><div><span className="eyebrow">YOUR THOUGHT</span><p>{progress.thought || 'No reflection recorded. You can return without offering one.'}</p></div><label htmlFor="world-disposition">Your provisional judgment</label><select id="world-disposition" value={progress.disposition} onChange={e => onUpdate({ disposition: e.target.value })}>{['Unresolved', 'Retain with reasons', 'Revise', 'Narrow', 'Contest', 'Withhold judgment', 'Held as provisional'].map(d => <option key={d}>{d}</option>)}</select><label className="form-label" htmlFor="world-reason">Reasons and limits (optional)</label><textarea id="world-reason" maxLength={2000} rows={3} value={progress.reason} onChange={e => onUpdate({ reason: e.target.value })} /><p className="fine-print">Outside change: nothing independently established. Nothing yet is a legitimate outcome.</p><p className="return-question">{step.question}</p></div>}
    </article>
    <div className="journey-bottom"><button className="text-button" disabled={progress.step === 0} onClick={() => onUpdate({ step: progress.step - 1 })}><ArrowLeft size={14} /> Previous</button>{progress.step < 3 ? <button className="button button-dark" onClick={() => { onUpdate({ step: progress.step + 1 }); setShowSources(false); }}>Continue journey <ArrowRight size={15} /></button> : <button className="button button-dark" onClick={() => { onUpdate({ complete: true }); onReturn(); }}>Return to our conversation <CornerUpLeft size={15} /></button>}</div>
  </section>;
}
