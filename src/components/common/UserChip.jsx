import { User } from 'lucide-react';

export function UserChip({ name, email, className }) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <span className="flex size-8 items-center justify-center rounded bg-primary-soft text-primary">
        <User className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        {email && <p className="truncate text-xs text-muted">{email}</p>}
      </div>
    </div>
  );
}