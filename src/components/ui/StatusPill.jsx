import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';

export const TONES = {
  ok: 'bg-emerald-50 text-ok',
  primary: 'bg-primary-soft text-primary',
  dark: 'bg-primary-dark/10 text-primary-dark',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-slate-100 text-slate-600',
  ink: 'bg-ink/5 text-ink',
};

// One tone per business state, shared by every enum in the system.
const VALUE_TONES = {
  // positive / done
  AVAILABLE: 'ok', WON: 'ok', APPROVED: 'ok', HANDED_OVER: 'ok', PAID: 'ok', RESOLVED: 'ok', COMPLETED: 'ok', INTERESTED: 'ok',
  // in motion
  CONTACTED: 'primary', MATCHING: 'primary', CONTRACTED: 'dark', RENTED: 'dark', ASSIGNED: 'primary', IN_PROGRESS: 'primary', SCHEDULED: 'primary', NEGOTIATING: 'primary',
  // waiting on someone
  VIEWING: 'warn', QUOTATION: 'warn', RESERVED: 'warn', PENDING_APPROVAL: 'warn', PENDING: 'warn', PARTIAL: 'warn', OPEN: 'warn', HIGH: 'warn', MEDIUM: 'warn', NEEDS_TIME: 'warn',
  // problems
  REJECTED: 'danger', LOST: 'danger', OVERDUE: 'danger', URGENT: 'danger', NOT_INTERESTED: 'danger',
  // closed / neutral
  NEW: 'neutral', SOLD: 'ink', CLOSED: 'ink', CANCELLED: 'neutral', LOW: 'neutral', NO_ANSWER: 'neutral',
  SALE: 'primary', LEASE: 'dark', BUY: 'primary', RENT: 'dark',
};

// Legacy lowercase statuses used by the static demo modules.
const DEMO_TONES = {
  active: 'primary', approved: 'ok', paid: 'ok', resolved: 'ok', available: 'ok', occupied: 'primary',
  pending: 'warn', reserved: 'warn', open: 'warn', inProgress: 'dark', draft: 'neutral', closed: 'ink',
  vacant: 'neutral', expired: 'danger', overdue: 'danger', revenue: 'ok', expense: 'danger',
};

const PRIORITY_TONES = { high: 'danger', medium: 'warn', low: 'neutral' };

function translated(t, key, fallback) {
  const value = t(key);
  return value === key ? fallback : value;
}

export function Pill({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium', TONES[tone], className)}>
      {children}
    </span>
  );
}

/** Translated, color-coded pill for any backend enum: `<EnumPill prefix="dealStatus" value="APPROVED" />`. */
export function EnumPill({ prefix, value, tone, className }) {
  const { t } = useLanguage();
  if (!value) return <span className="text-muted">—</span>;
  return (
    <Pill tone={tone || VALUE_TONES[value] || 'neutral'} className={className}>
      {translated(t, `${prefix}.${value}`, value)}
    </Pill>
  );
}

export function StatusPill({ value, className }) {
  const { t } = useLanguage();
  return (
    <Pill tone={DEMO_TONES[value] || 'neutral'} className={className}>
      {translated(t, `demo.status.${value}`, value)}
    </Pill>
  );
}

export function PriorityPill({ value, className }) {
  const { t } = useLanguage();
  return (
    <Pill tone={PRIORITY_TONES[value] || 'neutral'} className={className}>
      {translated(t, `demo.priority.${value}`, value)}
    </Pill>
  );
}
