import { AlertTriangle } from 'lucide-react';

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded border border-warn/30 bg-warn-soft px-3 py-2 text-sm text-warn">
      <AlertTriangle className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}