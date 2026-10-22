import { cn } from '../../utils/cn';

export function Field({ label, error, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-sm font-medium text-ink">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function TextInput({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-primary',
        className
      )}
      {...props}
    />
  );
}