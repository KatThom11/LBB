import { ATLAS, SOURCES } from '../data';
import Modal from './Modal';

export default function AtlasDrawer({ onClose }) {
  return <Modal title="The Full Color Atlas" onClose={onClose} drawer>
    <p className="serif intro">A written map. An evolving inquiry.</p>
    <p className="muted">The Atlas supplies intellectual history, competing interpretations, selected exchanges, and open questions. LBB makes selected routes through that map experiential. Questions in LBB can return to the Atlas without silently overwriting its record.</p>
    <h3>The notebook margins</h3>
    <p className="muted">These five definitions follow §3 of your supplied working draft. They are provenance operations and locations—not truth scores, and not the complete conceptual taxonomy of the Full Color Atlas.</p>
    <div className="atlas-entries">{ATLAS.map((entry, i) => <section key={entry.id} className={`atlas-entry ${entry.color}`}><span className="eyebrow">0{i + 1} / {entry.label}</span><h3>{entry.title}</h3><p>{entry.definition}</p><p className="atlas-question">{entry.question}</p></section>)}</div>
    <h3>The Inheritance</h3><p className="muted">Philosophical context and source evidence have different jobs. These are paraphrased reading prompts identified in the working draft, not quoted primary excerpts.</p>
    {SOURCES.map(s => <section className="inheritance-entry" key={s.id}><span className="eyebrow">CONTEXT / PARAPHRASED READING PROMPT</span><h4>{s.author}</h4><p><cite>{s.title}</cite> · {s.location}</p><p>{s.scope}</p><p className="fine-print">{s.limit}</p></section>)}
    <p className="fine-print">The integrated proposal is supplied. The complete written Atlas, edition-specific primary excerpts, and original prompt transcripts are still not supplied. Category colors supplement text labels.</p>
  </Modal>;
}
