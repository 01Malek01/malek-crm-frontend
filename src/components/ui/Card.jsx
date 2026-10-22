import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded border border-line bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('border-b border-line px-4 py-3', className)}>{children}</div>;
}

export function CardBody({ className, children }) {
  return <div className={cn('px-4 py-3', className)}>{children}</div>;
}