import { useState } from 'react';
import { ArrowUpRight, MessageSquareText } from 'lucide-react';

export default function ExhibitCart({ scene }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  return <aside className="cart" aria-label="Exhibit Cart narrator">
    <div className="cart-heading"><span className="cart-icon"><MessageSquareText size={17} /></span><strong>Exhibit Cart</strong><span className="tiny-tag">AUTHORED NARRATOR</span></div>
    <p>{scene === 2 ? 'The equation has arrived. The measurement protocol has not.' : 'You’ll find some excellent ideas in here. You’ll also find sentences that have been promoted beyond their evidence. The notebook keeps both.'}</p>
    <button className="text-button" aria-expanded={open} onClick={() => setOpen(!open)}>CROSS-EXAMINE THE CART <ArrowUpRight size={14} /></button>
    {open && <div className="cart-disclosure"><strong>My provenance, on the record.</strong><p>I am a fixed, authored script, not a live model, witness, or independent reviewer. This route adapts the supplied working draft. The embodied sentence and exchange are illustrative reconstructions; no original prompt history, participant records, or validated equation was supplied.</p><div className="cart-questions" role="group" aria-label="Questions for the Cart">{['Why this example?', 'What did you omit?', 'Could the idea remain useful?'].map(q => <button key={q} aria-pressed={question === q} onClick={() => setQuestion(q)}>{q}</button>)}</div>{question && <p className="cart-answer">{question === 'Why this example?' ? 'This is an editorial choice to expose the jump from generated praise to apparent authority. It is not a representative sample of all AI use.' : question === 'What did you omit?' ? 'The original exchange and its full context are not available here. Useful reasoning or disagreement may be missing. You can contest this selection.' : 'Yes. Narrowing an unsupported novelty claim may leave a useful question or design idea. My criticism is not an expert ruling that the idea has no value.'}</p>}</div>}
  </aside>;
}
