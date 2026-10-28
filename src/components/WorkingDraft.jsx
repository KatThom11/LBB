import { ArrowLeft, ArrowDownToLine } from 'lucide-react';
import { DRAFT, DRAFT_SECTIONS, draftText } from '../content/workingDraft';

function TextBlock({ text }) {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length > 1 && lines.every(line => line.includes('\t'))) {
    const [head, ...rows] = lines.map(line => line.split('\t'));
    return <div className="draft-table-wrap"><table><thead><tr>{head.map((cell, i) => <th scope="col" key={i}>{cell}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
  }
  return <p style={{ whiteSpace: 'pre-line' }}>{text}</p>;
}

export default function WorkingDraft({ onNotebook }) {
  function download() {
    const url = URL.createObjectURL(new Blob([draftText], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'LBB-living-notebook-working-draft.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <article className="working-draft" aria-label="Supplied working draft">
    <div className="draft-toolbar"><button className="text-button" onClick={onNotebook}><ArrowLeft size={15} /> RETURN TO THE NOTEBOOK</button><button className="text-button" onClick={download}><ArrowDownToLine size={15} /> DOWNLOAD ORIGINAL TEXT</button></div>
    <header className="draft-title"><span className="eyebrow">THE BASIS OF THIS NOTEBOOK / {DRAFT.date}</span><h1>The Living Notebook</h1><p className="serif">LBB (Language Beyond Binary) as an Interactive Full Color Atlas</p><p>The Sentence Is Not the World but It Can Change It</p></header>
    <div className="source-card"><span className="eyebrow">SOURCE & TRANSFORMATION REGISTER</span><p><strong>Origin:</strong> {DRAFT.origin}. <strong>Treatment:</strong> {DRAFT.treatment}</p><p>This is the author-facing development draft, not a validated study or a finished ACM submission. Dates, track rules, prior-art summaries, and novelty claims in it have not been independently checked here.</p><details><summary>Source integrity</summary><p className="source-hash">SHA-256: {DRAFT.sha256}</p></details></div>
    <div className="draft-layout"><nav className="draft-index" aria-label="Working draft sections">{DRAFT_SECTIONS.map((s, i) => <a key={i} href={`#draft-section-${i}`}>{s.title}</a>)}</nav><div className="draft-body">{DRAFT_SECTIONS.map((section, i) => <section key={i} id={`draft-section-${i}`}><h2>{section.title}</h2>{section.lines.join('\n').trim().split(/\n\s*\n/).filter(Boolean).map((text, j) => <TextBlock text={text} key={j} />)}</section>)}</div></div>
  </article>;
}
