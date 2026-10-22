import { useState } from 'react';
import { Building2, CalendarRange, Home, KeyRound, Wrench } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { KpiGrid } from '../components/ui/StatCard';
import { FilterTabs } from '../components/ui/FilterTabs';
import { IconAction } from '../components/ui/DataTable';
import { Pill } from '../components/ui/StatusPill';
import { useDeals } from '../hooks/deal.hooks';
import { usePortfolioReport } from '../hooks/report.hooks';
import { useLanguage } from '../i18n/LanguageContext';
import { formatPercent } from '../utils/format';
import DealsTable from '../features/deals/DealsTable';
import DealActionModal from '../features/deals/DealActionModal';

export default function HandoverPage() {
  const { t } = useLanguage();
  const { data: deals = [], isLoading } = useDeals({ status: 'CONTRACTED,HANDED_OVER' });
  const { data: report } = usePortfolioReport();
  const [tab, setTab] = useState('ready');
  const [action, setAction] = useState(null);

  const ready = deals.filter((d) => d.status === 'CONTRACTED');
  const occupied = deals.filter((d) => d.status === 'HANDED_OVER' && !d.renewedBy);
  const units = report?.units;

  return (
    <div className="space-y-4">
      <PageHeader title={t('handover.title')} subtitle={t('handover.subtitle')} />

      <KpiGrid
        items={[
          { label: t('handover.ready'), value: ready.length, hint: t('handover.readyHint'), icon: KeyRound, tone: 'text-warn' },
          { label: t('handover.occupied'), value: occupied.length, hint: t('handover.occupiedHint'), icon: Home, tone: 'text-ok' },
          { label: t('handover.occupancy'), value: formatPercent(units?.occupancyRate), hint: t('handover.occupancyHint', { rented: units?.byStatus.RENTED ?? 0 }) },
          { label: t('handover.available'), value: units?.byStatus.AVAILABLE ?? '—', hint: t('handover.availableHint', { total: units?.total ?? 0 }), icon: Building2 },
        ]}
      />

      <FilterTabs
        options={[
          { value: 'ready', label: t('handover.tab.ready'), count: ready.length },
          { value: 'occupied', label: t('handover.tab.occupied'), count: occupied.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Card>
        <DealsTable
          deals={tab === 'ready' ? ready : occupied}
          isLoading={isLoading}
          columns={tab === 'ready' ? ['client', 'unit', 'contract', 'type', 'collection', 'start'] : ['client', 'unit', 'contract', 'type', 'handoverDate', 'end', 'collection']}
          emptyTitle={t(tab === 'ready' ? 'handover.emptyReady' : 'handover.emptyOccupied')}
          renderActions={(deal) =>
            deal.status === 'CONTRACTED' ? (
              deal.installments?.length ? (
                <IconAction icon={KeyRound} title={t('dealPanel.btn.handover')} onClick={() => setAction({ deal, action: 'handover' })} />
              ) : (
                <>
                  <Pill tone="warn">{t('handover.planRequired')}</Pill>
                  <IconAction icon={CalendarRange} title={t('dealPanel.btn.payment-plan')} onClick={() => setAction({ deal, action: 'payment-plan' })} />
                </>
              )
            ) : (
              <IconAction icon={Wrench} title={t('dealPanel.btn.service')} onClick={() => setAction({ deal, action: 'service' })} />
            )
          }
        />
      </Card>

      {action && <DealActionModal deal={action.deal} action={action.action} onClose={() => setAction(null)} />}
    </div>
  );
}
