import { cn } from '../../utils/cn';

export function Progress({ value = 0, max = 100, className, barClassName }) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div
      className={cn('h-1.5 w-full rounded bg-line', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn('h-full rounded bg-primary transition-all duration-300', barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}