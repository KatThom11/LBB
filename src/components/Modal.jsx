import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose, drawer = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  function keepFocus(event) {
    if (event.key !== 'Tab') return;
    const controls = [...ref.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  return <dialog ref={ref} className={drawer ? 'modal drawer' : 'modal'} aria-labelledby="modal-title" onKeyDown={keepFocus} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-header"><div><span className="eyebrow">THE LIVING NOTEBOOK / REFERENCE</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
    <div className="modal-content">{children}</div>
  </dialog>;
}
