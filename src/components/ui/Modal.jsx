import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZES = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, description, size = 'md', className, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        className={cn('relative z-50 w-full rounded border border-line bg-white shadow-md', SIZES[size], className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-canvas hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-4 py-3">{children}</div>
      </div>
    </div>
  );
}
