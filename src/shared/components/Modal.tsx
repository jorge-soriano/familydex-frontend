import { useEffect } from 'react';
import { c } from '../../styles/tokens';

interface Props {
  onClose: () => void;
  title?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

export default function Modal({ onClose, title, maxWidth = 480, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      style={{ position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overscrollBehavior: 'contain' } as React.CSSProperties}
      onClick={onClose}
    >
      <div
        style={{ background: c.surface, borderRadius: 12, padding: '1.5rem', width: 'calc(100% - 2rem)', maxWidth, display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: c.shadowLg }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 id="modal-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{title}</h3>
            <button
              aria-label="Cerrar"
              style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: c.caption, lineHeight: 1, padding: '0.2rem' }}
              onClick={onClose}
            >✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
