import { useNavigate } from 'react-router-dom';
import { ExternalLink, MessageCircle } from 'lucide-react';
import { DataTable, IconAction } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/Spinner';
import { Progress } from '../../components/ui/Progress';
import { useLanguage } from '../../i18n/LanguageContext';
import { openWhatsApp } from '../../utils/actions';
import { formatPrice } from '../../utils/format';

const COLUMN_SETS = {
  reference: { field: 'reference', labelKey: 'deals.colReference', type: 'primary', subField: 'quotation.number' },
  client: { field: 'lead.clientName', labelKey: 'deals.colClient', type: 'primary', subField: 'lead.clientPhone' },
  unit: { field: 'property.title', labelKey: 'deals.colUnit', type: 'primary', subField: 'property.project' },
  type: { field: 'dealType', labelKey: 'deals.colType', type: 'enum', prefix: 'dealType' },
  total: { field: 'quotation.totalAmount', labelKey: 'deals.colTotal', type: 'currency' },
  status: { field: 'status', labelKey: 'deals.colStatus', type: 'enum', prefix: 'dealStatus' },
  agent: { field: 'agent.name', labelKey: 'deals.colAgent', type: 'muted' },
  updated: { field: 'updatedAt', labelKey: 'deals.colUpdated', type: 'date' },
  contract: { field: 'contract.number', labelKey: 'deals.colContract', type: 'primary', subField: 'contract.ejarNumber' },
  start: { field: 'contract.startDate', labelKey: 'deals.colStart', type: 'date' },
  end: { field: 'contract.endDate', labelKey: 'deals.colEnd', type: 'date' },
  deposit: { field: 'reservation.depositAmount', labelKey: 'deals.colDeposit', type: 'currency' },
  requestedBy: { field: 'approval.requestedBy', labelKey: 'deals.colRequestedBy', type: 'primary', subField: 'approval.notes' },
  handoverDate: { field: 'handover.handedOverAt', labelKey: 'deals.colHandover', type: 'date' },
  discount: {
    field: 'quotation.discount',
    labelKey: 'deals.colDiscount',
    render: (deal) => {
      const pct = deal.quotation?.grossAmount ? (deal.quotation.discount / deal.quotation.grossAmount) * 100 : 0;
      return <span className={`tabular-nums ${pct > 5 ? 'text-warn font-medium' : 'text-muted'}`}>{pct.toFixed(1)}%</span>;
    },
  },
  collection: {
    field: 'financials.progress',
    labelKey: 'deals.colCollection',
    render: (deal) =>
      deal.installments?.length ? (
        <div className="flex w-28 items-center gap-2">
          <Progress value={deal.financials?.progress || 0} />
          <span className="text-xs tabular-nums text-muted">{deal.financials?.progress || 0}%</span>
        </div>
      ) : (
        <span className="text-xs text-warn">—</span>
      ),
  },
};

export const DEFAULT_DEAL_COLUMNS = ['reference', 'client', 'unit', 'type', 'total', 'status', 'agent', 'updated'];

/** Reusable deals list. `columns` picks from COLUMN_SETS; `renderActions(deal)` adds workflow buttons. */
export default function DealsTable({ deals, isLoading, columns = DEFAULT_DEAL_COLUMNS, renderActions, emptyTitle, emptyDescription }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isLoading) return <LoadingState />;
  if (!deals.length) return <EmptyState title={emptyTitle || t('deals.empty')} description={emptyDescription} />;

  return (
    <DataTable
      columns={columns.map((key) => COLUMN_SETS[key])}
      rows={deals}
      onRowClick={(deal) => navigate(`/deals/${deal._id}`)}
      rowActions={(deal) => (
        <>
          {renderActions?.(deal)}
          <IconAction icon={ExternalLink} title={t('deals.open')} onClick={() => navigate(`/deals/${deal._id}`)} />
          {deal.lead?.clientPhone && (
            <IconAction
              icon={MessageCircle}
              title={t('deals.share')}
              onClick={() =>
                openWhatsApp(
                  deal.lead.clientPhone,
                  t('whatsapp.quotation', {
                    name: deal.lead.clientName,
                    unit: `${deal.property?.title} — ${deal.property?.project || ''}`,
                    total: formatPrice(deal.quotation?.totalAmount),
                    ref: deal.quotation?.number || deal.reference,
                    company: t('common.appName'),
                  })
                )
              }
            />
          )}
        </>
      )}
    />
  );
}
