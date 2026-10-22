import { Link } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, Banknote, Building2, CalendarClock, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiGrid } from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { EnumPill } from '../components/ui/StatusPill';
import { cn } from '../utils/cn';
import { usePortfolioReport } from '../hooks/report.hooks';
import { useActivities } from '../hooks/activity.hooks';
import { useDeals, useInstallments } from '../hooks/deal.hooks';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';
import { moduleByKey } from '../config/sidebar';
import { formatCompactPrice, formatDate, formatDateTime, formatPercent, formatPrice } from '../utils/format';
import { WidgetCard, CollectionsAging } from '../features/reports/ReportWidgets';
import { ACTIVITY_ICONS } from '../features/leads/ActivityTimeline';

// The client's demo scenario, in order. `module` decides the link target and who can open it.
const JOURNEY = [
  { key: 'LEAD', module: 'leads' },
  { key: 'REQUIREMENT', module: 'leads' },
  { key: 'MATCHING', module: 'pipeline' },
  { key: 'VIEWING', module: 'pipeline' },
  { key: 'QUOTATION', module: 'deals', query: '?status=QUOTATION' },
  { key: 'RESERVATION', module: 'deals', query: '?status=RESERVED' },
  { key: 'APPROVAL', module: 'approvals' },
  { key: 'CONTRACT', module: 'contracts' },
  { key: 'PAYMENT_PLAN', module: 'contracts' },
  { key: 'COLLECTION', module: 'collections' },
  { key: 'HANDOVER', module: 'handover' },
  { key: 'SERVICE', module: 'maintenance' },
  { key: 'RENEWAL', module: 'portfolio' },
  { key: 'PORTFOLIO', module: 'portfolio' },
];

function JourneyMap({ counts, role }) {
  const { t } = useLanguage();
  return (
    <WidgetCard title={t('dashboard.journey')} subtitle={t('dashboard.journeyHint')}>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {JOURNEY.map((step, index) => {
          const module = moduleByKey(step.module);
          const allowed = module?.roles.includes(role);
          const count = counts?.[step.key] ?? 0;
          const content = (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tabular-nums text-muted">{String(index + 1).padStart(2, '0')}</span>
                <span className={cn('text-lg font-semibold tabular-nums', count ? 'text-primary' : 'text-line')}>{count}</span>
              </div>
              <p className="text-sm font-medium leading-5 text-ink">{t(`scenario.${step.key}`)}</p>
              <p className="text-[11px] leading-4 text-muted">{t(`scenarioHint.${step.key}`)}</p>
            </>
          );
          const className = 'flex h-full flex-col gap-1 rounded border border-line bg-white px-2.5 py-2 transition-colors';
          return (
            <li key={step.key}>
              {allowed ? (
                <Link to={`${module.href}${step.query || ''}`} className={cn(className, 'hover:border-primary hover:bg-primary-soft/30')}>
                  {content}
                </Link>
              ) : (
                <div className={cn(className, 'opacity-60')}>{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </WidgetCard>
  );
}

function UpcomingActivities() {
  const { t } = useLanguage();
  const { data: activities = [], isLoading } = useActivities({ upcoming: true });
  return (
    <WidgetCard title={t('dashboard.upcoming')} subtitle={t('dashboard.upcomingHint')}>
      {isLoading ? (
        <LoadingState />
      ) : !activities.length ? (
        <EmptyState title={t('dashboard.noUpcoming')} />
      ) : (
        <ul className="divide-y divide-line">
          {activities.slice(0, 6).map((a) => {
            const Icon = ACTIVITY_ICONS[a.type] || CalendarClock;
            return (
              <li key={a._id}>
                <Link to={`/leads/${a.lead?._id}`} className="flex items-center gap-3 py-2 hover:bg-canvas">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded bg-primary-soft text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium text-ink">
                      {t(`activityType.${a.type}`)} · {a.lead?.clientName}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {formatDateTime(a.scheduledAt)} {a.property && `· ${a.property.title}`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}

function PendingApprovals() {
  const { t } = useLanguage();
  const { data: deals = [] } = useDeals({ status: 'PENDING_APPROVAL' });
  return (
    <WidgetCard
      title={t('dashboard.approvals')}
      action={<Link to="/approvals" className="text-xs text-primary hover:underline">{t('dashboard.viewAll')}</Link>}
    >
      {!deals.length ? (
        <EmptyState title={t('approvals.empty')} />
      ) : (
        <ul className="divide-y divide-line">
          {deals.slice(0, 5).map((d) => (
            <li key={d._id}>
              <Link to={`/deals/${d._id}`} className="flex items-center justify-between gap-2 py-2 hover:bg-canvas">
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium text-ink">{d.lead?.clientName}</p>
                  <p className="truncate text-xs text-muted">{d.property?.title} · {d.agent?.name}</p>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-ink">{formatPrice(d.quotation?.totalAmount)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

function OverdueInstallments() {
  const { t } = useLanguage();
  const { data: rows = [] } = useInstallments({ status: 'OVERDUE' });
  return (
    <WidgetCard
      title={t('dashboard.overdue')}
      action={<Link to="/collections" className="text-xs text-primary hover:underline">{t('dashboard.viewAll')}</Link>}
    >
      {!rows.length ? (
        <EmptyState title={t('dashboard.noOverdue')} />
      ) : (
        <ul className="divide-y divide-line">
          {rows.slice(0, 5).map((r) => (
            <li key={`${r.dealId}-${r.seq}`}>
              <Link to={`/deals/${r.dealId}`} className="flex items-center justify-between gap-2 py-2 hover:bg-canvas">
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium text-ink">{r.client}</p>
                  <p className="truncate text-xs text-muted">{r.property?.title} · {formatDate(r.dueDate)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm tabular-nums text-danger">{formatPrice(r.amount - r.paidAmount)}</span>
                  <EnumPill prefix="installmentStatus" value={r.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user, isManager } = useAuth();
  const { data: report, isLoading } = usePortfolioReport();
  const { data: installments = [] } = useInstallments();

  if (isLoading || !report) return <LoadingState />;
  const { units, revenue, collections, pipeline } = report;

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.welcome', { name: user?.name })} />

      <KpiGrid
        items={[
          { label: t('dashboard.salesValue'), value: revenue.salesValue + revenue.annualRentRoll, format: formatCompactPrice, hint: t('dashboard.salesValueHint', { deals: revenue.contractedDeals }), icon: TrendingUp, tone: 'text-ok' },
          { label: t('dashboard.activeLeads'), value: pipeline.totalLeads - pipeline.byStage.WON - pipeline.byStage.LOST, hint: t('dashboard.conversionHint', { rate: formatPercent(pipeline.conversionRate) }), icon: Users },
          { label: t('dashboard.collected'), value: collections.collected, format: formatCompactPrice, hint: t('dashboard.collectedHint', { rate: formatPercent(collections.collectionRate) }), icon: Banknote, tone: 'text-ok' },
          { label: t('dashboard.availableUnits'), value: units.byStatus.AVAILABLE, hint: t('dashboard.availableHint', { total: units.total, occupancy: formatPercent(units.occupancyRate) }), icon: Building2, tone: 'text-warn' },
        ]}
      />

      <JourneyMap counts={report.journey} role={user?.role} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <UpcomingActivities />
        {isManager ? (
          <>
            <PendingApprovals />
            <OverdueInstallments />
          </>
        ) : (
          <WidgetCard title={t('dashboard.myFocus')}>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-ink"><BadgeCheck className="size-4 text-primary" /> {t('dashboard.focusApprovals', { count: pipeline.pendingApprovals })}</li>
              <li className="flex items-center gap-2 text-ink"><AlertTriangle className="size-4 text-warn" /> {t('dashboard.focusQuotes', { count: report.journey.QUOTATION })}</li>
            </ul>
          </WidgetCard>
        )}
      </div>

      {isManager && <CollectionsAging installments={installments} />}
    </div>
  );
}
