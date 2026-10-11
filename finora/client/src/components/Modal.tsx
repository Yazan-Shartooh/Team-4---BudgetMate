import { useEffect, useId, useRef } from 'react';
import type { ModalProps } from '../types';

export default function Modal({ open, title, description, children, onClose, pending = false, initialFocusId }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const region = opener?.closest<HTMLElement>('[tabindex="0"]');
    dialog.showModal();
    const target = initialFocusId ? document.getElementById(initialFocusId) : null;
    if (target && dialog.contains(target)) target.focus();
    else (dialog.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')
      ?? dialog.querySelector<HTMLElement>('button:not(:disabled)'))?.focus();
    return () => {
      dialog.close();
      if (opener?.isConnected) opener.focus();
      else if (region?.isConnected) region.focus();
      else {
        const main = document.querySelector<HTMLElement>('main');
        if (main) { if (!main.hasAttribute('tabindex')) main.tabIndex = -1; main.focus(); }
      }
    };
  }, [open, initialFocusId]);
  return <dialog ref={dialogRef} className="modal" aria-labelledby={`${id}-title`}
    aria-describedby={description ? `${id}-description` : undefined} aria-busy={pending}
    onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}
    onKeyDown={(event) => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      )).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first) { event.preventDefault(); event.currentTarget.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onClick={(event) => {
      if (event.target !== event.currentTarget || pending) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    {open && <div className="modal-content">
      <div className="modal-heading"><h2 id={`${id}-title`}>{title}</h2>
        <button type="button" className="icon-button" onClick={onClose} disabled={pending} aria-label="Close dialog">×</button></div>
      {description && <p id={`${id}-description`}>{description}</p>}
      {children}
    </div>}
  </dialog>;
}
