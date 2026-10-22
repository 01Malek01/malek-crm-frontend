import { Link } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { STAGE_KEYS } from '../../config/constants';
import { formatCompactPrice, formatDate, formatNumber, formatPercent, formatPrice } from '../../utils/format';

export function WidgetCard({ title, subtitle, action, children, bodyClassName }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      <CardBody className={bodyClassName}>{children}</CardBody>
    </Card>
  );
}

/** Monthly collections — CSS bar chart (no chart library, per design system). */
export function CollectionsTrend({ monthly }) {
  const { t, lang } = useLanguage();
  const max = Math.max(...monthly.map((m) => Math.max(m.collected, m.due)), 1);
  const monthLabel = (key) =>
    new Date(`${key}-01T00:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { month: 'short' });

  return (
    <WidgetCard title={t('portfolio.collectionsTrend')} subtitle={t('portfolio.collectionsTrendHint')}>
      <div className="flex h-44 items-end gap-3">
        {monthly.map((m) => (
          <div key={m.month} className="flex h-full flex-1 flex-col items-center gap-1.5">
            <span className="text-[11px] tabular-nums text-muted">{formatCompactPrice(m.collected).replace(/ ?(ر\.س|SAR) ?/, '')}</span>
            <div className="flex h-full w-full items-end gap-1 rounded bg-canvas px-1">
              <div className="w-1/2 rounded-t bg-line" style={{ height: `${(m.due / max) * 100}%` }} title={t('portfolio.due')} />
              <div className="w-1/2 rounded-t bg-primary" style={{ height: `${(m.collected / max) * 100}%` }} title={t('portfolio.collected')} />
            </div>
            <span className="text-xs text-muted">{monthLabel(m.month)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" /> {t('portfolio.collected')}</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-line" /> {t('portfolio.due')}</span>
      </div>
    </WidgetCard>
  );
}

export function PipelineFunnel({ byStage, conversionRate }) {
  const { t } = useLanguage();
  const max = Math.max(...Object.values(byStage), 1);
  return (
    <WidgetCard title={t('portfolio.pipeline')} subtitle={t('portfolio.conversion', { rate: formatPercent(conversionRate) })}>
      <div className="space-y-2">
        {STAGE_KEYS.map((stage) => (
          <div key={stage} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 truncate text-muted">{t(`stage.${stage}`)}</span>
            <Progress value={byStage[stage] || 0} max={max} barClassName={stage === 'LOST' ? 'bg-danger' : stage === 'WON' ? 'bg-ok' : ''} />
            <span className="w-6 shrink-0 text-end tabular-nums text-ink">{byStage[stage] || 0}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

export function SourceBreakdown({ bySource }) {
  const { t } = useLanguage();
  const entries = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <WidgetCard title={t('portfolio.sources')}>
      <div className="space-y-2">
        {entries.map(([source, count]) => (
          <div key={source} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-ink">{t(`source.${source}`)}</span>
              <span className="tabular-nums text-muted">{count}</span>
            </div>
            <Progress value={count} max={max} />
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

export function ProjectPerformance({ rows }) {
  const { t } = useLanguage();
  const columns = [
    { field: 'project', labelKey: 'portfolio.colProject', type: 'primary', subField: 'city' },
    { field: 'units', labelKey: 'portfolio.colUnits', type: 'number' },
    {
      field: 'occupancy',
      labelKey: 'portfolio.colAbsorption',
      render: (row) => {
        const pct = row.units ? Math.round(((row.sold + row.rented + row.reserved) / row.units) * 100) : 0;
        return (
          <div className="flex w-32 items-center gap-2">
            <Progress value={pct} />
            <span className="text-xs tabular-nums text-muted">{pct}%</span>
          </div>
        );
      },
    },
    {
      field: 'mix',
      labelKey: 'portfolio.colMix',
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted">
          {t('portfolio.mix', { available: row.available, reserved: row.reserved, sold: row.sold, rented: row.rented })}
        </span>
      ),
    },
    { field: 'contractedValue', labelKey: 'portfolio.colContracted', type: 'currency' },
    { field: 'collected', labelKey: 'portfolio.colCollected', type: 'currency' },
    { field: 'outstanding', labelKey: 'portfolio.colOutstanding', type: 'currency' },
    { field: 'inventoryValue', labelKey: 'portfolio.colInventory', type: 'currency' },
  ];
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-ink">{t('portfolio.byProject')}</h3>
      </CardHeader>
      <DataTable columns={columns} rows={rows} rowKey="project" />
    </Card>
  );
}

export function RenewalsDue({ items, onRenew }) {
  const { t } = useLanguage();
  return (
    <WidgetCard title={t('portfolio.renewalsDue')} subtitle={t('portfolio.renewalsHint')}>
      {!items.length ? (
        <EmptyState title={t('portfolio.noRenewals')} />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.dealId} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0 text-sm">
                <Link to={`/deals/${item.dealId}`} className="font-medium text-ink hover:text-primary">{item.client}</Link>
                <p className="text-xs text-muted">
                  {item.property} · {formatPrice(item.annualRent)} {t('units.perYear')}
                </p>
                <p className={`text-xs ${item.daysLeft <= 30 ? 'text-danger' : 'text-warn'}`}>
                  {t('portfolio.endsIn', { days: formatNumber(item.daysLeft), date: formatDate(item.endDate) })}
                </p>
              </div>
              {onRenew && (
                <Button size="sm" variant="outline" onClick={() => onRenew(item)}>
                  <RefreshCcw className="size-4" /> {t('dealPanel.btn.renew')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Outstanding installments bucketed by days overdue (current / 1-30 / 31-60 / 61-90 / 90+). */
export function CollectionsAging({ installments }) {
  const { t } = useLanguage();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = [
    { label: t('dashboard.agingCurrent'), color: 'bg-primary', test: (d) => d < 1 },
    { label: t('dashboard.aging30'), color: 'bg-warn', test: (d) => d >= 1 && d <= 30 },
    { label: t('dashboard.aging60'), color: 'bg-danger/70', test: (d) => d >= 31 && d <= 60 },
    { label: t('dashboard.aging90'), color: 'bg-danger', test: (d) => d >= 61 && d <= 90 },
    { label: t('dashboard.agingOver'), color: 'bg-ink', test: (d) => d > 90 },
  ];

  const totals = buckets.map(() => 0);
  for (const inst of installments) {
    const outstanding = (inst.amount || 0) - (inst.paidAmount || 0);
    if (outstanding <= 0) continue;
    const days = Math.floor((today - new Date(inst.dueDate)) / DAY_MS);
    const idx = buckets.findIndex((b) => b.test(days));
    if (idx >= 0) totals[idx] += outstanding;
  }

  const max = Math.max(...totals, 1);
  const total = totals.reduce((sum, value) => sum + value, 0);

  return (
    <WidgetCard
      title={t('dashboard.agingTitle')}
      subtitle={t('dashboard.agingHint')}
      action={<Link to="/collections" className="text-xs text-primary hover:underline">{t('dashboard.viewAll')}</Link>}
    >
      <div className="space-y-2.5">
        {buckets.map((bucket, index) => (
          <div key={bucket.label} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 truncate text-muted">{bucket.label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded bg-canvas">
              <div className={cn('h-full rounded transition-all duration-300', bucket.color)} style={{ width: `${(totals[index] / max) * 100}%` }} />
            </div>
            <span className="w-28 shrink-0 text-end tabular-nums text-ink">{formatCompactPrice(totals[index])}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-sm">
        <span className="text-muted">{t('dashboard.agingTotal')}</span>
        <span className="font-semibold tabular-nums text-ink">{formatPrice(total)}</span>
      </div>
    </WidgetCard>
  );
}
