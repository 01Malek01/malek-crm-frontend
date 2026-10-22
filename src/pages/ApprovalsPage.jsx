import { useState } from 'react';
import { BadgeCheck, XCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { KpiGrid } from '../components/ui/StatCard';
import { IconAction } from '../components/ui/DataTable';
import { useDeals } from '../hooks/deal.hooks';
import { useLanguage } from '../i18n/LanguageContext';
import { formatCompactPrice } from '../utils/format';
import DealsTable from '../features/deals/DealsTable';
import DealActionModal from '../features/deals/DealActionModal';

export default function ApprovalsPage() {
  const { t } = useLanguage();
  const { data: pending = [], isLoading } = useDeals({ status: 'PENDING_APPROVAL' });
  const { data: decided = [], isLoading: decidedLoading } = useDeals({ status: 'APPROVED,REJECTED' });
  const [action, setAction] = useState(null);

  const pendingValue = pending.reduce((sum, d) => sum + (d.quotation?.totalAmount || 0), 0);
  const discounts = pending.map((d) => (d.quotation?.grossAmount ? (d.quotation.discount / d.quotation.grossAmount) * 100 : 0));

  return (
    <div className="space-y-4">
      <PageHeader title={t('approvals.title')} subtitle={t('approvals.subtitle')} />

      <KpiGrid
        cols={3}
        items={[
          { label: t('approvals.pending'), value: pending.length, hint: t('approvals.pendingHint'), icon: BadgeCheck, tone: 'text-warn' },
          { label: t('approvals.value'), value: formatCompactPrice(pendingValue), hint: t('approvals.valueHint') },
          { label: t('approvals.maxDiscount'), value: `${Math.max(0, ...discounts).toFixed(1)}%`, hint: t('approvals.maxDiscountHint') },
        ]}
      />

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-ink">{t('approvals.queue')}</h3>
        </CardHeader>
        <DealsTable
          deals={pending}
          isLoading={isLoading}
          columns={['reference', 'client', 'unit', 'total', 'discount', 'deposit', 'requestedBy']}
          emptyTitle={t('approvals.empty')}
          renderActions={(deal) => (
            <>
              <IconAction icon={BadgeCheck} title={t('dealPanel.btn.approve')} onClick={() => setAction({ deal, action: 'approve' })} />
              <IconAction icon={XCircle} tone="danger" title={t('dealPanel.btn.reject')} onClick={() => setAction({ deal, action: 'reject' })} />
            </>
          )}
        />
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-ink">{t('approvals.history')}</h3>
        </CardHeader>
        <DealsTable deals={decided} isLoading={decidedLoading} columns={['reference', 'client', 'unit', 'total', 'status', 'updated']} />
      </Card>

      {action && <DealActionModal deal={action.deal} action={action.action} onClose={() => setAction(null)} />}
    </div>
  );
}
