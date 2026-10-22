import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';
import { EnumPill } from './StatusPill';

/** Pipeline stage (default) or any enum when `prefix` is given. */
export function Badge({ value, prefix = 'stage', className }) {
  return <EnumPill prefix={prefix} value={String(value || '').toUpperCase()} className={className} />;
}

export function RoleBadge({ role, className }) {
  const { t } = useLanguage();
  const map = {
    ADMIN: 'bg-primary-soft text-primary',
    SALES_MANAGER: 'bg-teal-50 text-teal-700',
    AGENT: 'bg-slate-100 text-slate-600',
  };
  const label = t(`role.${role}`);
  return (
    <span
      className={cn(
        'inline-block rounded px-1.5 py-0.5 text-xs font-medium',
        map[role] || 'bg-slate-100 text-slate-600',
        className
      )}
    >
      {label.startsWith('role.') ? role : label}
    </span>
  );
}
