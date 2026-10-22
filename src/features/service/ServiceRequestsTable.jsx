import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MessageSquareText, PencilLine } from 'lucide-react';
import { DataTable, IconAction } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/Spinner';
import { FormModal } from '../../components/common/FormModal';
import { useUpdateServiceRequest } from '../../hooks/serviceRequest.hooks';
import { useAuth } from '../../hooks/useAuth';
import { openWhatsApp } from '../../utils/actions';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICE_PRIORITIES, SERVICE_STATUSES } from '../../config/constants';
import { apiError } from '../../utils/format';

export default function ServiceRequestsTable({ requests, isLoading, compact = false }) {
  const { t } = useLanguage();
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const update = useUpdateServiceRequest();
  const [editing, setEditing] = useState(null);

  if (isLoading) return <LoadingState />;
  if (!requests.length) return <EmptyState title={t('service.empty')} description={t('service.emptyDesc')} />;

  const columns = [
    { field: 'reference', labelKey: 'service.colReference', type: 'primary', subField: 'description' },
    ...(compact
      ? []
      : [
          { field: 'property.title', labelKey: 'service.colUnit', type: 'primary', subField: 'property.project' },
          { field: 'lead.clientName', labelKey: 'service.colCustomer', type: 'muted' },
        ]),
    { field: 'category', labelKey: 'service.colCategory', type: 'enum', prefix: 'serviceCategory' },
    { field: 'priority', labelKey: 'service.colPriority', type: 'enum', prefix: 'servicePriority' },
    { field: 'status', labelKey: 'service.colStatus', type: 'enum', prefix: 'serviceStatus' },
    { field: 'assignee', labelKey: 'service.colAssignee', type: 'muted' },
    { field: 'createdAt', labelKey: 'service.colOpened', type: 'date' },
  ];

  const onSubmit = (values) =>
    update.mutate(
      { id: editing._id, payload: values },
      {
        onSuccess: () => {
          toast.success(t('service.updated'));
          setEditing(null);
        },
        onError: (err) => toast.error(apiError(err, t('service.updateFailed'))),
      }
    );

  return (
    <>
      <DataTable
        columns={columns}
        rows={requests}
        rowActions={(sr) => (
          <>
            {isManager && <IconAction icon={PencilLine} title={t('service.update')} onClick={() => setEditing(sr)} />}
            {sr.lead?.clientPhone && <IconAction icon={MessageSquareText} title={t('service.notifyCustomer')} onClick={() => openWhatsApp(sr.lead?.clientPhone, t('whatsapp.serviceUpdate', { name: sr.lead?.clientName || '', ref: sr.reference, status: t(`serviceStatus.${sr.status}`) }))} />}
            {sr.deal && !compact && (
              <IconAction icon={ExternalLink} title={t('deals.open')} onClick={() => navigate(`/deals/${sr.deal._id}`)} />
            )}
          </>
        )}
      />
      <FormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={t('service.updateTitle', { ref: editing?.reference })}
        description={editing?.description}
        fields={[
          { name: 'status', label: t('service.status'), type: 'select', required: true, options: SERVICE_STATUSES.map((v) => ({ value: v, label: t(`serviceStatus.${v}`) })) },
          { name: 'priority', label: t('service.priority'), type: 'select', required: true, options: SERVICE_PRIORITIES.map((v) => ({ value: v, label: t(`servicePriority.${v}`) })) },
          { name: 'assignee', label: t('service.assignee'), span: 2 },
          { name: 'cost', label: t('service.cost'), type: 'number', min: 0 },
          { name: 'rating', label: t('service.rating'), type: 'select', options: [5, 4, 3, 2, 1].map((v) => ({ value: String(v), label: '★'.repeat(v) })) },
        ]}
        defaultValues={{
          status: editing?.status,
          priority: editing?.priority,
          assignee: editing?.assignee || '',
          cost: editing?.cost ?? 0,
          rating: editing?.rating ? String(editing.rating) : '',
        }}
        submitLabel={t('common.saveChanges')}
        onSubmit={(values) => onSubmit({ ...values, rating: values.rating ? Number(values.rating) : undefined })}
        isPending={update.isPending}
      />
    </>
  );
}
