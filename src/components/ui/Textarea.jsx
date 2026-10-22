import { cn } from '../../utils/cn';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full resize-y rounded border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-primary',
        className
      )}
      {...props}
    />
  );
}