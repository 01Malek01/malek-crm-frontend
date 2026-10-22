import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  outline: 'border border-line bg-white text-ink hover:bg-canvas',
  ghost: 'text-muted hover:bg-canvas hover:text-ink',
  danger: 'bg-danger text-white hover:bg-danger/80',
};

const sizes = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-sm',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}