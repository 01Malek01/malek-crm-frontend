import { cn } from '../../utils/cn';

/** Segmented filter. Options: `{ value, label, count? }`. */
export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded border border-line bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center gap-1.5 rounded px-2.5 py-1 text-sm transition-colors',
            value === option.value ? 'bg-primary text-white' : 'text-muted hover:bg-canvas hover:text-ink'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                'rounded px-1 text-xs tabular-nums',
                value === option.value ? 'bg-white/20 text-white' : 'bg-canvas text-muted'
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
