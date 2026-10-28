import { Sparkles, ScanSearch, CornerUpRight, Pause, Square } from 'lucide-react';

const ACTIONS = [{ id: 'generate', label: 'GENERATE', sub: 'Open a possibility', icon: Sparkles }, { id: 'verify', label: 'VERIFY', sub: 'Check a foundation', icon: ScanSearch }, { id: 'route', label: 'ROUTE', sub: 'Ask beyond the page', icon: CornerUpRight }, { id: 'hold', label: 'HOLD', sub: 'Keep it provisional', icon: Pause }, { id: 'stop', label: 'STOP', sub: 'End generation', icon: Square }];

export default function RefractionToolbar({ onAction, stopped }) {
  return <div className="refraction-actions" aria-label="Refraction actions">{ACTIONS.map(({ id, label, sub, icon: Icon }) => <button key={id} className={`refraction-action action-${id}`} disabled={id === 'generate' && stopped} onClick={() => onAction(id)}><Icon size={20} strokeWidth={1.5} /><strong>{label}</strong><span>{sub}</span></button>)}</div>;
}
