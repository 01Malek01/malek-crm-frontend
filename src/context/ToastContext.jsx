import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" />,
  error: <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />,
  info: <Info className="mt-0.5 size-4 shrink-0 text-primary" />,
};

const BORDERS = {
  success: 'border-ok/30',
  error: 'border-danger/30',
  info: 'border-primary/30',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      notify,
      success: (message) => notify(message, 'success'),
      error: (message) => notify(message, 'error'),
      info: (message) => notify(message, 'info'),
    }),
    [notify]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 end-4 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn('flex items-start gap-2 rounded border bg-white px-3 py-2.5 shadow-sm', BORDERS[toast.type])}
          >
            {ICONS[toast.type]}
            <p className="flex-1 text-sm text-ink">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} className="text-muted hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
