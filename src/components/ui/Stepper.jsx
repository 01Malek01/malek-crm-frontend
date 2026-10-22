import { Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const MARKER = {
  done: 'border-ok bg-ok text-white',
  current: 'border-primary bg-primary-soft text-primary',
  blocked: 'border-danger bg-danger/10 text-danger',
  upcoming: 'border-line bg-white text-muted',
};

/** Horizontal process tracker. Steps: `{ key, label, hint, state: done|current|blocked|upcoming }`. */
export function Stepper({ steps, className }) {
  return (
    <ol className={cn('flex gap-0 overflow-x-auto pb-1', className)}>
      {steps.map((step, index) => (
        <li key={step.key} className="flex min-w-[7.5rem] flex-1 flex-col gap-1.5">
          <div className="flex items-center">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded border text-xs font-semibold tabular-nums',
                MARKER[step.state]
              )}
            >
              {step.state === 'done' ? <Check className="size-4" /> : step.state === 'blocked' ? <X className="size-4" /> : index + 1}
            </span>
            {index < steps.length - 1 && (
              <span className={cn('mx-1 h-0.5 flex-1', step.state === 'done' ? 'bg-ok' : 'bg-line')} />
            )}
          </div>
          <div className="pe-2">
            <p className={cn('text-xs font-medium', step.state === 'upcoming' ? 'text-muted' : 'text-ink')}>{step.label}</p>
            {step.hint && <p className="text-[11px] leading-4 text-muted">{step.hint}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
