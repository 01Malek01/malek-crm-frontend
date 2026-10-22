import { cn } from '../../utils/cn';

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-primary',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}