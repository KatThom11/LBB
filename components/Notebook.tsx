'use client';
import { useState } from 'react';
import { BookOpen, Check, CornerDownLeft, History, PenLine, Plus, X } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import { artwork } from '@/lib/media';
import { categories, type Category, type NotebookEntry, type Provenance } from '@/lib/schema';
export interface NoteDraft { text: string; category: Category; origin: 'visitor' | 'scripted' | 'ai-generated'; sourceMessageId?: string; }
export default function Notebook({ entries, draft, setDraft, onSave, onRevise, onClose, live, selected, onSelect }: {
  entries: NotebookEntry[]; draft: NoteDraft; setDraft: (value: NoteDraft) => void;
  onSave: () => void; onRevise: (id: string, text: string) => void; onClose: () => void;
  live: boolean; selected: string[]; onSelect: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null); const [revision, setRevision] = useState('');
  return <div className="notebook-inner">
    <div className="notebook-heading"><div className="notebook-symbol"><BookOpen size={19} strokeWidth={1.5} /></div><div><h2>The Living Notebook</h2><span>A place for thoughts in progress.</span></div><button className="icon-button" aria-label="Close notebook" onClick={onClose}><X size={17} /></button></div>
    <div className="notebook-scroll">
      <div className="notebook-intro"><span className="eyebrow">IN THE MARGINS</span><p>Keep an idea.<br /><em>Leave room to change it.</em></p></div>
      <div className="notebook-landscape"><ArtworkImage art={artwork.notebook} sizes="(max-width: 1100px) 340px, 300px" /></div>
      <form className="note-form" onSubmit={e => { e.preventDefault(); onSave(); }}>
        <label htmlFor="note-category">A place for this thought</label><select id="note-category" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as Category })}>{categories.map(c => <option key={c}>{c}</option>)}</select>
        <label className="sr-only" htmlFor="note-text">Notebook entry</label><textarea id="note-text" rows={5} maxLength={4000} placeholder="An idea, a question, a beautifully inconvenient objection…" value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })} />
        {draft.origin !== 'visitor' && <p className="fine-print">Copied {draft.origin === 'scripted' ? 'scripted demo' : 'AI-generated'} text. Saving does not verify it.</p>}
        <div className="note-form-footer"><span>Only on this device</span><button className="small-button" disabled={!draft.text.trim()}><Plus size={14} /> Save entry</button></div>
      </form>
      <div className="entries-heading"><span className="eyebrow">YOUR PAGES</span><span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span></div>
      {!entries.length && <div className="empty-notes"><PenLine size={22} strokeWidth={1.25} /><p>Nothing needs to be settled<br />before it belongs here.</p><small>Save your first thought above, or bring one back from a journey.</small></div>}
      {[...entries].reverse().map(entry => <article className="note-entry" key={entry.id} aria-label={`${entry.category} entry`}>
        <div className="note-entry-heading"><span>{entry.category}</span><span className="note-number">{String(entries.indexOf(entry) + 1).padStart(2, '0')}</span></div>
        <p>{entry.revisions.at(-1)!.text}</p><div className="note-provenance">{entry.origin === 'visitor' ? 'Your entry' : entry.origin === 'scripted' ? 'Copied scripted text' : 'Copied AI-generated text'} · Unverified</div>
        <div className="note-entry-actions"><button className="text-button" onClick={() => { setEditing(entry.id); setRevision(entry.revisions.at(-1)!.text); }}><PenLine size={12} /> Revise</button><span>v{entry.revisions.length}</span></div>
        {editing === entry.id && <form className="revision-form" onSubmit={e => { e.preventDefault(); if (!revision.trim()) return; onRevise(entry.id, revision); setEditing(null); }}><label htmlFor={`revision-${entry.id}`}>Revise your entry</label><textarea id={`revision-${entry.id}`} rows={4} value={revision} maxLength={4000} onChange={e => setRevision(e.target.value)} /><div className="revision-buttons"><button type="button" className="text-button" onClick={() => setEditing(null)}>Cancel</button><button className="small-button" disabled={!revision.trim()}><Check size={13} /> Save revision</button></div><p className="fine-print">Your original and earlier versions are kept.</p></form>}
        {entry.revisions.length > 1 && <details className="revision-history"><summary><History size={12} /> Revision history</summary>{entry.revisions.map((r, i) => <div key={r.id}><span>Version {i + 1}{i === 0 ? ' · Original' : ''}</span><p>{r.text}</p></div>)}</details>}
        {live && <label className="check-label"><input type="checkbox" checked={selected.includes(entry.id)} onChange={() => onSelect(entry.id)} /> Select for next live reply</label>}
      </article>)}
    </div><div className="notebook-foot"><CornerDownLeft size={13} /><span>Your notebook travels with the conversation.</span></div>
  </div>;
}
