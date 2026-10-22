import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FilePlus2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FilterTabs } from '../components/ui/FilterTabs';
import { useDeals } from '../hooks/deal.hooks';
import { exportCsv } from '../utils/actions';
import { formatDate } from '../utils/format';
import { useLanguage } from '../i18n/LanguageContext';
import DealsTable from '../features/deals/DealsTable';
import QuotationModal from '../features/deals/QuotationModal';

const GROUPS = {
  all: null,
  QUOTATION: ['QUOTATION'],
  RESERVED: ['RESERVED'],
  PENDING_APPROVAL: ['PENDING_APPROVAL'],
  APPROVED: ['APPROVED'],
  won: ['CONTRACTED', 'HANDED_OVER'],
  closed: ['REJECTED', 'CANCELLED'],
};

export default function DealsPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const { data: deals = [], isLoading } = useDeals();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const group = GROUPS[params.get('status')] !== undefined ? params.get('status') : 'all';

  const filtered = useMemo(
    () => (GROUPS[group] ? deals.filter((d) => GROUPS[group].includes(d.status)) : deals),
    [deals, group]
  );

  const tabs = Object.keys(GROUPS).map((key) => ({
    value: key,
    label: t(`deals.group.${key}`),
    count: GROUPS[key] ? deals.filter((d) => GROUPS[key].includes(d.status)).length : deals.length,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('deals.title')}
        subtitle={t('deals.subtitle')}
        actions={
          <>
            <Button variant="outline" onClick={() =>
              exportCsv('deals', [
                { label: t('deals.colReference'), value: (d) => d.reference },
                { label: t('deals.colClient'), value: (d) => d.lead?.clientName },
                { label: t('deals.colUnit'), value: (d) => d.property?.title },
                { label: t('deals.colType'), value: (d) => t(`dealType.${d.dealType}`) },
                { label: t('deals.colTotal'), value: (d) => d.quotation?.totalAmount },
                { label: t('deals.colStatus'), value: (d) => t(`dealStatus.${d.status}`) },
                { label: t('deals.colAgent'), value: (d) => d.agent?.name },
                { label: t('deals.colUpdated'), value: (d) => formatDate(d.updatedAt) },
              ], filtered)
            }>
              <Download className="size-4" /> {t('common.export')}
            </Button>
            <Button onClick={() => setQuoteOpen(true)}>
              <FilePlus2 className="size-4" /> {t('quotation.title')}
            </Button>
          </>
        }
      />
      <FilterTabs options={tabs} value={group} onChange={(value) => setParams(value === 'all' ? {} : { status: value })} />
      <Card>
        <DealsTable deals={filtered} isLoading={isLoading} />
      </Card>
      {quoteOpen && <QuotationModal open onClose={() => setQuoteOpen(false)} />}
    </div>
  );
}
