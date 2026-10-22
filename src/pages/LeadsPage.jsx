import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { FilterTabs } from '../components/ui/FilterTabs';
import { useLeads, useDeleteLead } from '../hooks/lead.hooks';
import { exportCsv } from '../utils/actions';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { apiError, formatDate } from '../utils/format';
import LeadTable from '../features/leads/LeadTable';
import LeadFormModal from '../features/leads/LeadFormModal';

const GROUPS = {
  all: null,
  new: ['NEW', 'CONTACTED'],
  active: ['MATCHING', 'VIEWING', 'QUOTATION', 'RESERVED'],
  won: ['WON'],
  lost: ['LOST'],
};

export default function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads();
  const deleteLead = useDeleteLead();
  const toast = useToast();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [createOpen, setCreateOpen] = useState(false);
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState(params.get('q') || '');

  useEffect(() => {
    const q = params.get('q');
    if (q !== null) setQuery(q);
  }, [params]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (GROUPS[group] && !GROUPS[group].includes(lead.pipelineStage)) return false;
      if (!q) return true;
      return [lead.clientName, lead.clientPhone, lead.clientEmail, lead.requirements?.district, lead.requirements?.city]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [leads, group, query]);

  const handleDelete = (id) => {
    if (!window.confirm(t('common.deleteConfirmLead'))) return;
    deleteLead.mutate(id, {
      onSuccess: () => toast.success(t('leads.deleted')),
      onError: (err) => toast.error(apiError(err, t('leads.deleteFailed'))),
    });
  };

  const tabs = Object.keys(GROUPS).map((key) => ({
    value: key,
    label: t(`leads.group.${key}`),
    count: GROUPS[key] ? leads.filter((l) => GROUPS[key].includes(l.pipelineStage)).length : leads.length,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('leads.title')}
        subtitle={t('leads.subtitle')}
        actions={
          <>
            <Button variant="outline" onClick={() =>
                exportCsv('leads', [
                  { label: t('leads.colClient'), value: (l) => l.clientName },
                  { label: t('leadForm.phone'), value: (l) => l.clientPhone },
                  { label: t('leadForm.email'), value: (l) => l.clientEmail },
                  { label: t('leads.colPurpose'), value: (l) => t(`purpose.${l.requirements?.purpose || 'BUY'}`) },
                  { label: t('leads.colStage'), value: (l) => t(`stage.${l.pipelineStage}`) },
                  { label: t('leads.colPotential'), value: (l) => t(`aiPotential.${l.aiPotentialStatus || 'MEDIUM_POTENTIAL'}`) },
                  { label: t('leads.colScore'), value: (l) => l.aiLeadScore },
                  { label: t('leadForm.minBudget'), value: (l) => l.requirements?.budgetMin },
                  { label: t('leadForm.maxBudget'), value: (l) => l.requirements?.budgetMax },
                  { label: t('leadForm.city'), value: (l) => l.requirements?.city },
                  { label: t('leadForm.district'), value: (l) => l.requirements?.district },
                  { label: t('leads.colSource'), value: (l) => t(`source.${l.source}`) },
                  { label: t('leads.colAgent'), value: (l) => l.assignedTo?.name },
                  { label: t('leads.colCreated'), value: (l) => formatDate(l.createdAt) },
                ], filtered)
              }>
              <Download className="size-4" /> {t('common.export')}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> {t('leads.newLead')}
            </Button>
          </>
        }
      />

      <FilterTabs options={tabs} value={group} onChange={setGroup} />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">{t('leads.listTitle', { count: filtered.length })}</h3>
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('leads.searchPlaceholder')}
              className="h-9 w-64 rounded border border-line bg-white ps-8 pe-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </CardHeader>
        <LeadTable leads={filtered} isLoading={isLoading} onDelete={handleDelete} />
      </Card>

      <LeadFormModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(lead) => navigate(`/leads/${lead._id}`)} />
    </div>
  );
}
