import { useNavigate } from 'react-router-dom';
import { FormModal, SummaryRow } from '../../components/common/FormModal';
import { useDealAction, useRecordPayment } from '../../hooks/deal.hooks';
import { useCreateServiceRequest } from '../../hooks/serviceRequest.hooks';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  PAYMENT_FREQUENCIES,
  PAYMENT_METHODS,
  PROPERTY_TYPES,
  PURPOSES,
  SERVICE_CATEGORIES,
  SERVICE_PRIORITIES,
} from '../../config/constants';
import { apiError, formatPrice, toInputDate } from '../../utils/format';

const PERIOD = { ONE_TIME: 0, MONTHLY: 1, QUARTERLY: 3, SEMI_ANNUAL: 6, ANNUAL: 12 };
const options = (values, prefix, t) => values.map((v) => ({ value: v, label: t(`${prefix}.${v}`) }));

/** Form definition for each scenario step. */
function buildConfig(action, deal, t, installment) {
  const total = deal.quotation?.totalAmount || 0;
  const isLease = deal.dealType === 'LEASE';

  switch (action) {
    case 'reserve':
      return {
        title: t('dealAction.reserve.title'),
        description: t('dealAction.reserve.description'),
        fields: [
          { name: 'depositAmount', label: t('dealAction.reserve.deposit'), type: 'number', required: true, min: 0, max: total, hint: t('dealAction.reserve.depositHint') },
          { name: 'holdDays', label: t('dealAction.reserve.holdDays'), type: 'select', required: true, options: [3, 7, 14].map((d) => ({ value: String(d), label: t(`quotation.period.${d}`) })) },
        ],
        defaults: { depositAmount: Math.round(total * 0.05), holdDays: '7' },
        submit: t('dealAction.reserve.submit'),
      };
    case 'submit-approval':
      return {
        title: t('dealAction.submitApproval.title'),
        description: t('dealAction.submitApproval.description'),
        fields: [{ name: 'notes', label: t('dealAction.notes'), type: 'textarea', placeholder: t('dealAction.submitApproval.placeholder') }],
        defaults: { notes: '' },
        submit: t('dealAction.submitApproval.submit'),
      };
    case 'approve':
      return {
        title: t('dealAction.approve.title'),
        description: t('dealAction.approve.description'),
        fields: [{ name: 'notes', label: t('dealAction.notes'), type: 'textarea' }],
        defaults: { notes: '' },
        submit: t('dealAction.approve.submit'),
      };
    case 'reject':
      return {
        title: t('dealAction.reject.title'),
        description: t('dealAction.reject.description'),
        fields: [{ name: 'notes', label: t('dealAction.reason'), type: 'textarea', required: true }],
        defaults: { notes: '' },
        submit: t('dealAction.reject.submit'),
        danger: true,
      };
    case 'contract':
      return {
        title: t(isLease ? 'dealAction.contract.leaseTitle' : 'dealAction.contract.saleTitle'),
        description: t('dealAction.contract.description'),
        fields: [
          { name: 'signedAt', label: t('dealAction.contract.signedAt'), type: 'date', required: true },
          { name: 'startDate', label: t(isLease ? 'dealAction.contract.leaseStart' : 'dealAction.contract.effectiveDate'), type: 'date', required: true },
          ...(isLease ? [{ name: 'ejarNumber', label: t('dealAction.contract.ejar'), placeholder: '20XXXXXXXXX', hint: t('dealAction.contract.ejarHint'), span: 2 }] : []),
          { name: 'notes', label: t('dealAction.notes'), type: 'textarea' },
        ],
        defaults: { signedAt: toInputDate(), startDate: toInputDate(), ejarNumber: '', notes: '' },
        submit: t('dealAction.contract.submit'),
      };
    case 'payment-plan': {
      const deposit = deal.reservation?.depositAmount || 0;
      return {
        title: t('dealAction.plan.title'),
        description: t('dealAction.plan.description'),
        fields: [
          { name: 'frequency', label: t('dealAction.plan.frequency'), type: 'select', required: true, options: options(PAYMENT_FREQUENCIES, 'frequency', t) },
          ...(isLease ? [] : [{ name: 'installmentsCount', label: t('dealAction.plan.count'), type: 'number', min: 1, max: 60, hint: t('dealAction.plan.countHint') }]),
          { name: 'firstDueDate', label: t('dealAction.plan.firstDue'), type: 'date', required: true },
        ],
        defaults: {
          frequency: isLease ? 'QUARTERLY' : 'QUARTERLY',
          installmentsCount: 4,
          firstDueDate: toInputDate(deal.contract?.startDate || new Date()),
        },
        submit: t('dealAction.plan.submit'),
        preview: (values) => {
          const remaining = total - deposit;
          const period = PERIOD[values.frequency] ?? 0;
          const count =
            values.frequency === 'ONE_TIME' ? 1 : isLease ? Math.max(1, Math.ceil((deal.quotation?.termMonths || 12) / period)) : Number(values.installmentsCount) || 1;
          return (
            <div className="rounded border border-line bg-canvas px-3 py-2">
              <SummaryRow label={t('dealAction.plan.total')} value={formatPrice(total)} />
              <SummaryRow label={t('dealAction.plan.depositPaid')} value={`- ${formatPrice(deposit)}`} />
              <SummaryRow label={t('dealAction.plan.remaining')} value={formatPrice(remaining)} strong />
              <SummaryRow label={t('dealAction.plan.schedule')} value={t('dealAction.plan.scheduleValue', { count, amount: formatPrice(Math.floor(remaining / count)) })} />
            </div>
          );
        },
      };
    }
    case 'pay': {
      const due = installment ? installment.amount - installment.paidAmount : 0;
      return {
        title: t('dealAction.pay.title', { seq: installment?.seq }),
        description: `${deal.reference} · ${t('dealAction.pay.due')} ${formatPrice(due)}`,
        fields: [
          { name: 'amount', label: t('dealAction.pay.amount'), type: 'number', required: true, min: 1, max: due },
          { name: 'method', label: t('dealAction.pay.method'), type: 'select', required: true, options: options(PAYMENT_METHODS, 'paymentMethod', t) },
          { name: 'reference', label: t('dealAction.pay.reference'), placeholder: 'SADAD / IBAN TRX' },
          { name: 'paidAt', label: t('dealAction.pay.paidAt'), type: 'date', required: true },
        ],
        defaults: { amount: due, method: 'SADAD', reference: '', paidAt: toInputDate() },
        submit: t('dealAction.pay.submit'),
      };
    }
    case 'handover':
      return {
        title: t('dealAction.handover.title'),
        description: t('dealAction.handover.description'),
        fields: [
          { name: 'handedOverAt', label: t('dealAction.handover.date'), type: 'date', required: true },
          { name: 'keysCount', label: t('dealAction.handover.keys'), type: 'number', min: 0 },
          { name: 'electricityMeter', label: t('dealAction.handover.electricity'), placeholder: 'SEC-XXXXXX' },
          { name: 'waterMeter', label: t('dealAction.handover.water'), placeholder: 'NWC-XXXXXX' },
          { name: 'notes', label: t('dealAction.handover.notes'), type: 'textarea', placeholder: t('dealAction.handover.notesPlaceholder') },
        ],
        defaults: { handedOverAt: toInputDate(), keysCount: 2, electricityMeter: '', waterMeter: '', notes: '' },
        submit: t('dealAction.handover.submit'),
      };
    case 'cancel':
      return {
        title: t('dealAction.cancel.title'),
        description: t('dealAction.cancel.description'),
        fields: [{ name: 'reason', label: t('dealAction.reason'), type: 'textarea', required: true }],
        defaults: { reason: '' },
        submit: t('dealAction.cancel.submit'),
        danger: true,
      };
    case 'renew':
      return {
        title: t('dealAction.renew.title'),
        description: t('dealAction.renew.description'),
        fields: [
          { name: 'termMonths', label: t('quotation.termMonths'), type: 'select', required: true, options: [6, 12, 24].map((m) => ({ value: String(m), label: t(`quotation.term.${m}`) })) },
          { name: 'increasePct', label: t('dealAction.renew.increase'), type: 'number', min: 0, max: 30 },
        ],
        defaults: { termMonths: '12', increasePct: 5 },
        submit: t('dealAction.renew.submit'),
        preview: (values) => (
          <div className="rounded border border-line bg-canvas px-3 py-2">
            <SummaryRow label={t('dealAction.renew.currentRent')} value={formatPrice(deal.quotation?.listPrice)} />
            <SummaryRow
              label={t('dealAction.renew.newRent')}
              value={formatPrice(Math.round((deal.quotation?.listPrice || 0) * (1 + (Number(values.increasePct) || 0) / 100)))}
              strong
            />
          </div>
        ),
      };
    case 'upsell':
      return {
        title: t('dealAction.upsell.title'),
        description: t('dealAction.upsell.description'),
        fields: [
          { name: 'purpose', label: t('leadForm.purpose'), type: 'select', required: true, options: options(PURPOSES, 'purpose', t) },
          { name: 'budgetMax', label: t('leadForm.maxBudget'), type: 'number', min: 0 },
          { name: 'preferredTypes', label: t('leadForm.preferredTypes'), type: 'checkboxes', options: options(PROPERTY_TYPES, 'propertyType', t) },
          { name: 'notes', label: t('dealAction.notes'), type: 'textarea', placeholder: t('dealAction.upsell.placeholder') },
        ],
        defaults: { purpose: 'BUY', budgetMax: '', preferredTypes: [], notes: '' },
        submit: t('dealAction.upsell.submit'),
      };
    case 'service':
      return {
        title: t('service.newTitle'),
        description: `${deal.property?.title || ''} · ${deal.lead?.clientName || ''}`,
        fields: [
          { name: 'category', label: t('service.category'), type: 'select', required: true, options: options(SERVICE_CATEGORIES, 'serviceCategory', t) },
          { name: 'priority', label: t('service.priority'), type: 'select', required: true, options: options(SERVICE_PRIORITIES, 'servicePriority', t) },
          { name: 'description', label: t('service.description'), type: 'textarea', required: true, placeholder: t('service.descriptionPlaceholder') },
          { name: 'assignee', label: t('service.assignee'), placeholder: t('service.assigneePlaceholder'), span: 2 },
        ],
        defaults: { category: 'AC', priority: 'MEDIUM', description: '', assignee: '' },
        submit: t('service.submit'),
      };
    default:
      return null;
  }
}

/**
 * Opens the form for one scenario step on a deal and runs it against the API.
 * `action`: reserve | submit-approval | approve | reject | contract | payment-plan | pay |
 *           handover | cancel | renew | upsell | service
 */
export default function DealActionModal({ deal, action, installment, onClose }) {
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const dealAction = useDealAction();
  const payment = useRecordPayment();
  const createService = useCreateServiceRequest();

  if (!deal || !action) return null;
  const config = buildConfig(action, deal, t, installment);
  if (!config) return null;

  const fail = (err) => toast.error(apiError(err, t('dealAction.failed')));

  const onSubmit = (values) => {
    if (action === 'pay') {
      payment.mutate(
        { id: deal._id, seq: installment.seq, payload: values },
        { onSuccess: () => { toast.success(t('dealAction.pay.success')); onClose(); }, onError: fail }
      );
      return;
    }
    if (action === 'service') {
      createService.mutate(
        { deal: deal._id, ...values },
        { onSuccess: (sr) => { toast.success(t('service.created', { ref: sr.reference })); onClose(); }, onError: fail }
      );
      return;
    }

    let payload = values;
    if (action === 'upsell') {
      payload = {
        notes: values.notes,
        requirements: { purpose: values.purpose, budgetMax: values.budgetMax, preferredTypes: values.preferredTypes },
      };
    }
    if (action === 'renew') payload = { termMonths: Number(values.termMonths), increasePct: values.increasePct || 0 };
    if (action === 'reserve') payload = { depositAmount: values.depositAmount, holdDays: Number(values.holdDays) };

    dealAction.mutate(
      { id: deal._id, action, payload },
      {
        onSuccess: (result) => {
          toast.success(t(`dealAction.success.${action}`));
          onClose();
          if (action === 'renew') navigate(`/deals/${result._id}`);
          if (action === 'upsell') navigate(`/leads/${result._id}`);
        },
        onError: fail,
      }
    );
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={config.title}
      description={config.description}
      fields={config.fields}
      defaultValues={config.defaults}
      submitLabel={config.submit}
      onSubmit={onSubmit}
      isPending={dealAction.isPending || payment.isPending || createService.isPending}
      preview={config.preview}
      danger={config.danger}
    />
  );
}
