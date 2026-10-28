'use client';
import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
export default function Dialog({ title, children, onClose, className = '' }: { title: string; children: React.ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null); const label = useId();
  useEffect(() => { const previous = document.activeElement as HTMLElement; const dialog = ref.current!; dialog.showModal(); return () => { dialog.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} aria-labelledby={label} className={`dialog ${className}`} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => {
    if (e.key !== 'Tab') return; const items = [...ref.current!.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]')];
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1)?.focus(); }
    if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0]?.focus(); }
  }}><div className="dialog-heading"><h2 id={label}>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div><div className="dialog-body">{children}</div></dialog>;
}
