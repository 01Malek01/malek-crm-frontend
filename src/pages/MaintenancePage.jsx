import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Plus, Star, Wrench } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KpiGrid } from '../components/ui/StatCard';
import { FilterTabs } from '../components/ui/FilterTabs';
import { FormModal } from '../components/common/FormModal';
import { useServiceRequests, useCreateServiceRequest } from '../hooks/serviceRequest.hooks';
import { useDeals } from '../hooks/deal.hooks';
import { usePortfolioReport } from '../hooks/report.hooks';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SERVICE_CATEGORIES, SERVICE_PRIORITIES } from '../config/constants';
import { apiError, formatNumber } from '../utils/format';
import ServiceRequestsTable from '../features/service/ServiceRequestsTable';

const GROUPS = {
  open: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'],
  done: ['RESOLVED', 'CLOSED'],
  all: null,
};

export default function MaintenancePage() {
  const { t } = useLanguage();
  const toast = useToast();
  const { data: requests = [], isLoading } = useServiceRequests();
  const { data: deals = [] } = useDeals({ status: 'CONTRACTED,HANDED_OVER' });
  const { data: report } = usePortfolioReport();
  const create = useCreateServiceRequest();
  const [tab, setTab] = useState('open');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => (GROUPS[tab] ? requests.filter((r) => GROUPS[tab].includes(r.status)) : requests), [requests, tab]);
  const s = report?.service;

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('maintenance.title')}
        subtitle={t('maintenance.subtitle')}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> {t('service.newTitle')}
          </Button>
        }
      />

      <KpiGrid
        cols={5}
        items={[
          { label: t('maintenance.open'), value: s?.open ?? '—', hint: t('maintenance.openHint'), icon: Wrench, tone: 'text-warn' },
          { label: t('maintenance.urgent'), value: s?.urgent ?? '—', hint: t('maintenance.urgentHint'), icon: AlertTriangle, tone: 'text-danger' },
          { label: t('maintenance.resolved'), value: s?.resolved ?? '—', hint: t('maintenance.resolvedHint'), icon: CheckCircle2, tone: 'text-ok' },
          { label: t('maintenance.resolution'), value: t('maintenance.hours', { hours: formatNumber(s?.avgResolutionHours) }), hint: t('maintenance.resolutionHint'), icon: Clock },
          { label: t('maintenance.satisfaction'), value: s?.satisfaction ? `${s.satisfaction} / 5` : '—', hint: t('maintenance.satisfactionHint'), icon: Star },
        ]}
      />

      <FilterTabs
        options={Object.keys(GROUPS).map((key) => ({
          value: key,
          label: t(`maintenance.tab.${key}`),
          count: GROUPS[key] ? requests.filter((r) => GROUPS[key].includes(r.status)).length : requests.length,
        }))}
        value={tab}
        onChange={setTab}
      />

      <Card>
        <ServiceRequestsTable requests={filtered} isLoading={isLoading} />
      </Card>

      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('service.newTitle')}
        description={t('maintenance.newHint')}
        fields={[
          { name: 'deal', label: t('maintenance.contractUnit'), type: 'select', required: true, span: 2, options: deals.filter((d) => !d.renewedBy).map((d) => ({ value: d._id, label: `${d.property?.title} — ${d.lead?.clientName} (${d.contract?.number || d.reference})` })) },
          { name: 'category', label: t('service.category'), type: 'select', required: true, options: SERVICE_CATEGORIES.map((v) => ({ value: v, label: t(`serviceCategory.${v}`) })) },
          { name: 'priority', label: t('service.priority'), type: 'select', required: true, options: SERVICE_PRIORITIES.map((v) => ({ value: v, label: t(`servicePriority.${v}`) })) },
          { name: 'description', label: t('service.description'), type: 'textarea', required: true, placeholder: t('service.descriptionPlaceholder') },
          { name: 'assignee', label: t('service.assignee'), placeholder: t('service.assigneePlaceholder'), span: 2 },
        ]}
        defaultValues={{ deal: '', category: 'AC', priority: 'MEDIUM', description: '', assignee: '' }}
        submitLabel={t('service.submit')}
        isPending={create.isPending}
        onSubmit={(values) =>
          create.mutate(values, {
            onSuccess: (sr) => {
              toast.success(t('service.created', { ref: sr.reference }));
              setCreateOpen(false);
            },
            onError: (err) => toast.error(apiError(err, t('dealAction.failed'))),
          })
        }
      />
    </div>
  );
}
