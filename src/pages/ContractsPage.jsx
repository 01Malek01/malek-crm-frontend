import { useState } from 'react';
import { CalendarRange, FileSignature, RefreshCcw, ScrollText } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { KpiGrid } from '../components/ui/StatCard';
import { FilterTabs } from '../components/ui/FilterTabs';
import { IconAction } from '../components/ui/DataTable';
import { useDeals } from '../hooks/deal.hooks';
import { usePortfolioReport } from '../hooks/report.hooks';
import { useLanguage } from '../i18n/LanguageContext';
import { formatCompactPrice } from '../utils/format';
import DealsTable from '../features/deals/DealsTable';
import DealActionModal from '../features/deals/DealActionModal';

export default function ContractsPage() {
  const { t } = useLanguage();
  const { data: deals = [], isLoading } = useDeals({ status: 'APPROVED,CONTRACTED,HANDED_OVER' });
  const { data: report } = usePortfolioReport();
  const [tab, setTab] = useState('active');
  const [action, setAction] = useState(null);

  const awaiting = deals.filter((d) => d.status === 'APPROVED');
  const active = deals.filter((d) => d.status !== 'APPROVED' && !d.renewedBy);
  const sales = active.filter((d) => d.dealType === 'SALE');
  const leases = active.filter((d) => d.dealType === 'LEASE');
  const rows = { awaiting, active, sales, leases }[tab];

  const tabs = [
    { value: 'active', label: t('contracts.tab.active'), count: active.length },
    { value: 'sales', label: t('contracts.tab.sales'), count: sales.length },
    { value: 'leases', label: t('contracts.tab.leases'), count: leases.length },
    { value: 'awaiting', label: t('contracts.tab.awaiting'), count: awaiting.length },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={t('contracts.title')} subtitle={t('contracts.subtitle')} />

      <KpiGrid
        items={[
          { label: t('contracts.active'), value: active.length, hint: t('contracts.activeHint'), icon: ScrollText },
          { label: t('contracts.salesValue'), value: formatCompactPrice(report?.revenue.salesValue), hint: t('contracts.salesValueHint'), tone: 'text-ok' },
          { label: t('contracts.rentRoll'), value: formatCompactPrice(report?.revenue.annualRentRoll), hint: t('contracts.rentRollHint') },
          { label: t('contracts.renewals'), value: report?.renewalsDue.length ?? '—', hint: t('contracts.renewalsHint'), icon: RefreshCcw, tone: 'text-warn' },
        ]}
      />

      <FilterTabs options={tabs} value={tab} onChange={setTab} />

      <Card>
        <DealsTable
          deals={rows}
          isLoading={isLoading}
          columns={tab === 'awaiting' ? ['reference', 'client', 'unit', 'type', 'total', 'status'] : ['contract', 'client', 'unit', 'type', 'total', 'start', 'end', 'collection', 'status']}
          emptyTitle={t('contracts.empty')}
          renderActions={(deal) => (
            <>
              {deal.status === 'APPROVED' && (
                <IconAction icon={FileSignature} title={t('dealPanel.btn.contract')} onClick={() => setAction({ deal, action: 'contract' })} />
              )}
              {deal.status !== 'APPROVED' && !deal.installments?.length && (
                <IconAction icon={CalendarRange} title={t('dealPanel.btn.payment-plan')} onClick={() => setAction({ deal, action: 'payment-plan' })} />
              )}
              {deal.dealType === 'LEASE' && deal.status === 'HANDED_OVER' && !deal.renewedBy && (
                <IconAction icon={RefreshCcw} title={t('dealPanel.btn.renew')} onClick={() => setAction({ deal, action: 'renew' })} />
              )}
            </>
          )}
        />
      </Card>

      {action && <DealActionModal deal={action.deal} action={action.action} onClose={() => setAction(null)} />}
    </div>
  );
}
