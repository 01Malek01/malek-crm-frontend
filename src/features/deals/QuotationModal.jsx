import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormModal, SummaryRow } from '../../components/common/FormModal';
import { useCreateQuotation } from '../../hooks/deal.hooks';
import { useLeads } from '../../hooks/lead.hooks';
import { useProperties } from '../../hooks/property.hooks';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { MAX_DISCOUNT_PCT } from '../../config/constants';
import { apiError, formatPrice } from '../../utils/format';
import { computeQuote } from './dealMath';

/**
 * Issues a quotation. Pass `lead` and/or `property` to pre-select them
 * (from the customer file, a matched unit, or the units inventory).
 */
export default function QuotationModal({ open, onClose, lead, property }) {
  const create = useCreateQuotation();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: leads = [] } = useLeads(undefined);
  const { data: available = [] } = useProperties({ status: 'AVAILABLE' });
  const maxPct = MAX_DISCOUNT_PCT[user?.role] ?? 0;

  const units = useMemo(() => {
    const purpose = lead?.requirements?.purpose;
    const listing = purpose === 'RENT' ? 'RENT' : 'SALE';
    const list = purpose ? available.filter((u) => u.listingType === listing) : available;
    if (property && !list.some((u) => u._id === property._id)) return [property, ...list];
    return list;
  }, [available, property, lead]);

  const openLeads = leads.filter((l) => !['WON', 'LOST'].includes(l.pipelineStage) || l._id === lead?._id);

  const fields = useMemo(
    () => [
      ...(lead
        ? []
        : [{ name: 'leadId', label: t('quotation.customer'), type: 'select', required: true, span: 2, options: openLeads.map((l) => ({ value: l._id, label: `${l.clientName} — ${l.clientPhone}` })) }]),
      { name: 'propertyId', label: t('quotation.unit'), type: 'select', required: true, span: 2, options: units.map((u) => ({ value: u._id, label: `${u.title} · ${u.project || ''} · ${formatPrice(u.price)}` })) },
      { name: 'discount', label: t('quotation.discount'), type: 'number', min: 0, hint: t('quotation.discountHint', { pct: maxPct }) },
      { name: 'termMonths', label: t('quotation.termMonths'), type: 'select', required: true, options: [6, 12, 24, 36].map((m) => ({ value: String(m), label: t(`quotation.term.${m}`) })), hint: t('quotation.termHint') },
      { name: 'validDays', label: t('quotation.validDays'), type: 'select', required: true, options: [7, 14, 30].map((d) => ({ value: String(d), label: t(`quotation.period.${d}`) })) },
      { name: 'notes', label: t('quotation.notes'), type: 'textarea', placeholder: t('quotation.notesPlaceholder') },
    ],
    [t, lead, openLeads, units, maxPct]
  );

  const preview = (values) => {
    const unit = units.find((u) => u._id === values.propertyId);
    const quote = computeQuote(unit, { discount: values.discount, termMonths: Number(values.termMonths) || 12 });
    if (!quote) return null;
    const overLimit = quote.discount > (quote.grossAmount * maxPct) / 100;
    return (
      <div className="rounded border border-line bg-canvas px-3 py-2">
        <p className="mb-1 text-xs font-semibold uppercase text-muted">{t('quotation.breakdown')}</p>
        <SummaryRow label={t('quotation.dealType')} value={t(`dealType.${quote.dealType}`)} />
        <SummaryRow label={quote.dealType === 'LEASE' ? t('quotation.rentForTerm') : t('quotation.listPrice')} value={formatPrice(quote.grossAmount)} />
        <SummaryRow label={t('quotation.discount')} value={`- ${formatPrice(quote.discount)}`} className={overLimit ? 'text-danger' : ''} />
        <SummaryRow label={t('quotation.net')} value={formatPrice(quote.netAmount)} />
        <SummaryRow label={`${t(`taxType.${quote.taxType}`)} (${quote.taxRate}%)`} value={formatPrice(quote.taxAmount)} />
        <SummaryRow label={t('quotation.total')} value={formatPrice(quote.totalAmount)} strong className="border-t border-line pt-2" />
        {overLimit && <p className="pt-1 text-xs text-danger">{t('quotation.overLimit', { pct: maxPct })}</p>}
      </div>
    );
  };

  const onSubmit = (values) => {
    create.mutate(
      {
        leadId: lead?._id || values.leadId,
        propertyId: values.propertyId,
        discount: values.discount || 0,
        termMonths: Number(values.termMonths),
        validDays: Number(values.validDays),
        notes: values.notes,
      },
      {
        onSuccess: (deal) => {
          toast.success(t('quotation.issued', { ref: deal.quotation?.number }));
          onClose();
          navigate(`/deals/${deal._id}`);
        },
        onError: (err) => toast.error(apiError(err, t('quotation.failed'))),
      }
    );
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('quotation.title')}
      description={lead ? lead.clientName : t('quotation.description')}
      fields={fields}
      defaultValues={{ leadId: '', propertyId: property?._id || '', discount: '', termMonths: '12', validDays: '14', notes: '' }}
      submitLabel={t('quotation.submit')}
      onSubmit={onSubmit}
      isPending={create.isPending}
      preview={preview}
    />
  );
}
