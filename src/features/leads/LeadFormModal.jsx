import { useMemo } from 'react';
import { FormModal } from '../../components/common/FormModal';
import { useCreateLead, useUpdateLead } from '../../hooks/lead.hooks';
import { useUsers } from '../../hooks/user.hooks';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { LEAD_SOURCES, PROPERTY_TYPES, PURPOSES } from '../../config/constants';
import { apiError } from '../../utils/format';

/** Create a lead, or edit an existing lead's contact details and requirement (`lead` prop). */
export default function LeadFormModal({ open, onClose, lead, onCreated }) {
  const create = useCreateLead();
  const update = useUpdateLead();
  const toast = useToast();
  const { isManager } = useAuth();
  const { t } = useLanguage();
  const { data: users = [] } = useUsers(undefined, open && isManager && !lead);
  const isEdit = Boolean(lead);

  const fields = useMemo(() => {
    const list = [
      { name: 'clientName', label: t('leadForm.fullName'), required: true, placeholder: t('leadForm.fullNamePlaceholder') },
      { name: 'clientPhone', label: t('leadForm.phone'), required: true, placeholder: '+966 5X XXX XXXX' },
      { name: 'clientEmail', label: t('leadForm.email'), placeholder: 'name@email.com' },
      { name: 'source', label: t('leadForm.source'), type: 'select', required: true, options: LEAD_SOURCES.map((v) => ({ value: v, label: t(`source.${v}`) })) },
      { name: 'purpose', label: t('leadForm.purpose'), type: 'select', required: true, options: PURPOSES.map((v) => ({ value: v, label: t(`purpose.${v}`) })) },
      { name: 'bedrooms', label: t('leadForm.bedrooms'), type: 'number', min: 0 },
      { name: 'preferredTypes', label: t('leadForm.preferredTypes'), type: 'checkboxes', options: PROPERTY_TYPES.map((v) => ({ value: v, label: t(`propertyType.${v}`) })) },
      { name: 'budgetMin', label: t('leadForm.minBudget'), type: 'number', min: 0 },
      { name: 'budgetMax', label: t('leadForm.maxBudget'), type: 'number', min: 0 },
      { name: 'city', label: t('leadForm.city'), placeholder: t('leadForm.cityPlaceholder') },
      { name: 'district', label: t('leadForm.district'), placeholder: t('leadForm.districtPlaceholder') },
      { name: 'notes', label: t('leadForm.notes'), type: 'textarea', placeholder: t('leadForm.notesPlaceholder') },
    ];
    if (isManager && !isEdit) {
      list.push({
        name: 'assignedTo',
        label: t('leadForm.assignTo'),
        type: 'select',
        options: users.map((u) => ({ value: u.id, label: `${u.name} — ${t(`role.${u.role}`)}` })),
      });
    }
    return list;
  }, [t, isManager, isEdit, users]);

  const req = lead?.requirements || {};
  const defaultValues = {
    clientName: lead?.clientName || '',
    clientPhone: lead?.clientPhone || '',
    clientEmail: lead?.clientEmail || '',
    source: lead?.source || 'WEBSITE',
    purpose: req.purpose || 'BUY',
    bedrooms: req.bedrooms ?? '',
    preferredTypes: req.preferredTypes || [],
    budgetMin: req.budgetMin ?? '',
    budgetMax: req.budgetMax ?? '',
    city: req.city || '',
    district: req.district || '',
    notes: req.notes || '',
    assignedTo: '',
  };

  const onSubmit = (values) => {
    const payload = {
      clientName: values.clientName,
      clientPhone: values.clientPhone,
      clientEmail: values.clientEmail || undefined,
      source: values.source,
      requirements: {
        purpose: values.purpose,
        budgetMin: values.budgetMin,
        budgetMax: values.budgetMax,
        bedrooms: values.bedrooms,
        preferredTypes: values.preferredTypes || [],
        city: values.city || undefined,
        district: values.district || undefined,
        notes: values.notes || undefined,
      },
      ...(values.assignedTo ? { assignedTo: values.assignedTo } : {}),
    };

    if (values.budgetMin && values.budgetMax && values.budgetMin > values.budgetMax) {
      toast.error(t('leadForm.budgetRange'));
      return;
    }

    const options = {
      onSuccess: (saved) => {
        toast.success(t(isEdit ? 'leads.updated' : 'leads.created'));
        onClose();
        if (!isEdit) onCreated?.(saved);
      },
      onError: (err) => toast.error(apiError(err, t(isEdit ? 'leads.updateFailed' : 'leads.createFailed'))),
    };

    if (isEdit) update.mutate({ id: lead._id, payload }, options);
    else create.mutate(payload, options);
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? t('leadForm.editTitle') : t('leadForm.title')}
      description={t('leadForm.description')}
      fields={fields}
      defaultValues={defaultValues}
      submitLabel={isEdit ? t('common.saveChanges') : t('leadForm.create')}
      onSubmit={onSubmit}
      isPending={create.isPending || update.isPending}
    />
  );
}
