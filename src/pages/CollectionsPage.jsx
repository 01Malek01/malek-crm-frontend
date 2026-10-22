import { useMemo, useState } from 'react';
import { AlertTriangle, Banknote, Download, Percent, Wallet } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KpiGrid } from '../components/ui/StatCard';
import { FilterTabs } from '../components/ui/FilterTabs';
import { useDeals, useInstallments } from '../hooks/deal.hooks';
import { usePortfolioReport } from '../hooks/report.hooks';
import { exportCsv } from '../utils/actions';
import { useLanguage } from '../i18n/LanguageContext';
import { formatCompactPrice, formatDate, formatPercent } from '../utils/format';
import InstallmentsTable from '../features/deals/InstallmentsTable';
import DealActionModal from '../features/deals/DealActionModal';

const GROUPS = {
  open: ['OVERDUE', 'PENDING', 'PARTIAL'],
  OVERDUE: ['OVERDUE'],
  PENDING: ['PENDING', 'PARTIAL'],
  PAID: ['PAID'],
  all: null,
};

export default function CollectionsPage() {
  const { t } = useLanguage();
  const { data: rows = [], isLoading } = useInstallments();
  const { data: deals = [] } = useDeals({ status: 'CONTRACTED,HANDED_OVER' });
  const { data: report } = usePortfolioReport();
  const [tab, setTab] = useState('open');
  const [payment, setPayment] = useState(null);

  const filtered = useMemo(() => (GROUPS[tab] ? rows.filter((r) => GROUPS[tab].includes(r.status)) : rows), [rows, tab]);
  const tabs = Object.keys(GROUPS).map((key) => ({
    value: key,
    label: t(`collections.tab.${key}`),
    count: GROUPS[key] ? rows.filter((r) => GROUPS[key].includes(r.status)).length : rows.length,
  }));

  const c = report?.collections;
  const paymentDeal = payment && deals.find((d) => d._id === payment.dealId);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('collections.title')}
        subtitle={t('collections.subtitle')}
        actions={
          <Button variant="outline" onClick={() =>
              exportCsv('collections', [
                { label: t('installments.colClient'), value: (r) => r.client },
                { label: t('deals.colReference'), value: (r) => r.dealReference },
                { label: t('installments.colUnit'), value: (r) => r.property?.title },
                { label: t('installments.colInstallment'), value: (r) => (r.label === 'DEPOSIT' ? t('installmentLabel.DEPOSIT') : t('installmentLabel.INSTALLMENT', { seq: r.seq })) },
                { label: t('installments.colDue'), value: (r) => formatDate(r.dueDate) },
                { label: t('installments.colAmount'), value: (r) => r.amount },
                { label: t('installments.colPaid'), value: (r) => r.paidAmount },
                { label: t('installments.colStatus'), value: (r) => t(`installmentStatus.${r.status}`) },
              ], filtered)
            }>
            <Download className="size-4" /> {t('collections.statement')}
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: t('collections.collected'), value: formatCompactPrice(c?.collected), hint: t('collections.collectedHint', { total: formatCompactPrice(c?.scheduled) }), icon: Banknote, tone: 'text-ok' },
          { label: t('collections.outstanding'), value: formatCompactPrice(c?.outstanding), hint: t('collections.outstandingHint'), icon: Wallet },
          { label: t('collections.overdue'), value: formatCompactPrice(c?.overdue), hint: t('collections.overdueHint'), icon: AlertTriangle, tone: 'text-danger' },
          { label: t('collections.rate'), value: formatPercent(c?.collectionRate), hint: t('collections.rateHint'), icon: Percent },
        ]}
      />

      <FilterTabs options={tabs} value={tab} onChange={setTab} />

      <Card>
        <InstallmentsTable rows={filtered} isLoading={isLoading} withDeal onPay={(row) => setPayment(row)} />
      </Card>

      {paymentDeal && (
        <DealActionModal deal={paymentDeal} action="pay" installment={payment} onClose={() => setPayment(null)} />
      )}
    </div>
  );
}
