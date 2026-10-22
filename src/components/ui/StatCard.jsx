import { Card } from './Card';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatCompactPrice, formatNumber } from '../../utils/format';
import AnimatedNumber from './AnimatedNumber';

export function StatCard({ icon: Icon, label, value, hint, tone = 'text-primary', format }) {
  // Numeric values animate (count-up); strings render as-is.
  const numeric = typeof value === 'number' && Number.isFinite(value);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {numeric ? <AnimatedNumber value={value} format={format || formatNumber} /> : value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        {Icon && (
          <span className={`shrink-0 rounded bg-primary-soft p-2 ${tone}`}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
    </Card>
  );
}

const COLS = {
  3: 'sm:grid-cols-2 xl:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

/** Already-translated KPI tiles: `{ label, value, hint, icon, tone }`. */
export function KpiGrid({ items, cols = 4 }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4', COLS[cols])}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}

/** Demo-module stats keyed by i18n labels; `format: 'compactCurrency'` renders SAR amounts. */
export function StatGrid({ stats }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.labelKey}
          icon={stat.icon}
          label={t(stat.labelKey)}
          value={stat.format === 'compactCurrency' ? formatCompactPrice(stat.value) : stat.value}
          hint={stat.hintKey ? t(stat.hintKey) : undefined}
          tone={stat.tone}
        />
      ))}
    </div>
  );
}
