import { useNavigate } from 'react-router-dom';
import { BellRing, CreditCard, ExternalLink, ReceiptText } from 'lucide-react';
import { DataTable, IconAction } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDate, formatPrice } from '../../utils/format';
import { openWhatsApp, printDocument } from '../../utils/actions';

/**
 * Installment schedule. `withDeal` adds deal/customer columns (collections page).
 * `onPay(row)` is shown only when provided (finance roles).
 * `context` supplies customer/deal details when rows come from a single deal.
 */
export default function InstallmentsTable({ rows, isLoading, withDeal = false, onPay, context }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const info = (row) => ({
    client: row.client || context?.client,
    phone: row.clientPhone || context?.phone,
    reference: row.dealReference || context?.reference,
    unit: row.property?.title || context?.unit,
  });
  const label = (row) => (row.label === 'DEPOSIT' ? t('installmentLabel.DEPOSIT') : t('installmentLabel.INSTALLMENT', { seq: row.seq }));

  const remind = (row) => {
    const d = info(row);
    openWhatsApp(
      d.phone,
      t('whatsapp.reminder', {
        name: d.client || '',
        installment: label(row),
        unit: d.unit || '',
        amount: formatPrice(row.amount - row.paidAmount),
        date: formatDate(row.dueDate),
        company: t('common.appName'),
      })
    );
  };

  const receipt = (row) => {
    const d = info(row);
    printDocument({
      title: t('receipt.title'),
      subtitle: `${t('receipt.no')} RV-${String(d.reference || '').replace(/\D/g, '').slice(-5)}-${row.seq}`,
      company: t('common.appName'),
      dir: document.documentElement.dir || 'rtl',
      rows: [
        [t('receipt.receivedFrom'), d.client],
        [t('receipt.amount'), formatPrice(row.paidAmount)],
        [t('receipt.for'), `${label(row)} — ${d.unit || ''}`],
        [t('receipt.deal'), d.reference],
        [t('receipt.method'), row.method ? t(`paymentMethod.${row.method}`) : '—'],
        [t('receipt.transaction'), row.reference || '—'],
        [t('receipt.date'), formatDate(row.paidAt)],
      ],
      footer: t('receipt.footer'),
    });
  };

  if (isLoading) return <LoadingState />;
  if (!rows.length) return <EmptyState title={t('installments.empty')} description={t('installments.emptyDesc')} />;

  const columns = [
    ...(withDeal
      ? [
          { field: 'client', labelKey: 'installments.colClient', type: 'primary', subField: 'dealReference' },
          { field: 'property.title', labelKey: 'installments.colUnit', type: 'primary', subField: 'property.project' },
        ]
      : []),
    {
      field: 'seq',
      labelKey: 'installments.colInstallment',
      render: (row) => <span className="whitespace-nowrap text-ink">{label(row)}</span>,
    },
    { field: 'dueDate', labelKey: 'installments.colDue', type: 'date' },
    { field: 'amount', labelKey: 'installments.colAmount', type: 'currency' },
    { field: 'paidAmount', labelKey: 'installments.colPaid', type: 'currency' },
    {
      field: 'method',
      labelKey: 'installments.colMethod',
      render: (row) => (
        <div className="text-xs text-muted">
          <p>{row.method ? t(`paymentMethod.${row.method}`) : '—'}</p>
          {row.reference && <p className="truncate">{row.reference}</p>}
        </div>
      ),
    },
    { field: 'status', labelKey: 'installments.colStatus', type: 'enum', prefix: 'installmentStatus' },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey="rowKey"
      rowActions={(row) => {
        const due = row.amount - row.paidAmount;
        return (
          <>
            {onPay && due > 0 && (
              <Button size="sm" variant={row.status === 'OVERDUE' ? 'primary' : 'outline'} onClick={() => onPay(row)} aria-label={t('installments.collect')} title={`${t('installments.collect')} ${formatPrice(due)}`}>
                <CreditCard className="size-4" /> {t('installments.collect')}
              </Button>
            )}
            {due > 0 && info(row).phone && <IconAction icon={BellRing} title={t('installments.remind')} onClick={() => remind(row)} />}
            {row.paidAmount > 0 && <IconAction icon={ReceiptText} title={t('installments.receipt')} onClick={() => receipt(row)} />}
            {withDeal && <IconAction icon={ExternalLink} title={t('deals.open')} onClick={() => navigate(`/deals/${row.dealId}`)} />}
          </>
        );
      }}
    />
  );
}
