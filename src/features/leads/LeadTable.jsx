import { useNavigate } from 'react-router-dom';
import { FolderOpen, Phone, MessageCircle, Trash2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { EnumPill } from '../../components/ui/StatusPill';
import LeadPotential from '../../components/common/LeadPotential';
import { DataTable, IconAction } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatCompactPrice } from '../../utils/format';

export function budgetText(requirements = {}) {
  const { budgetMin, budgetMax } = requirements;
  if (!budgetMin && !budgetMax) return '—';
  if (budgetMin && budgetMax) return `${formatCompactPrice(budgetMin)} – ${formatCompactPrice(budgetMax)}`;
  return formatCompactPrice(budgetMax || budgetMin);
}

export const whatsappLink = (phone = '') => `https://wa.me/${phone.replace(/\D/g, '')}`;

export default function LeadTable({ leads, isLoading, onDelete }) {
  const { isManager } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isLoading) return <LoadingState />;
  if (!leads.length) return <EmptyState title={t('leads.empty')} description={t('leads.emptyDesc')} />;

  const columns = [
    { field: 'clientName', labelKey: 'leads.colClient', type: 'primary', subField: 'clientPhone' },
    { field: 'requirements.purpose', labelKey: 'leads.colPurpose', type: 'enum', prefix: 'purpose' },
    { field: 'pipelineStage', labelKey: 'leads.colStage', render: (lead) => <Badge value={lead.pipelineStage} /> },
    { field: 'aiLeadScore', labelKey: 'leads.colPotential', render: (lead) => <LeadPotential lead={lead} /> },
    {
      field: 'requirements',
      labelKey: 'leads.colRequirements',
      render: (lead) => (
        <div className="text-xs text-muted">
          <p className="whitespace-nowrap tabular-nums">{budgetText(lead.requirements)}</p>
          <p className="truncate">
            {[lead.requirements?.district, lead.requirements?.city].filter(Boolean).join('، ') || '—'}
          </p>
        </div>
      ),
    },
    { field: 'source', labelKey: 'leads.colSource', render: (lead) => <EnumPill prefix="source" value={lead.source} tone="neutral" /> },
    { field: 'assignedTo.name', labelKey: 'leads.colAgent', type: 'muted' },
    { field: 'createdAt', labelKey: 'leads.colCreated', type: 'date' },
  ];

  return (
    <DataTable
      columns={columns}
      rows={leads}
      onRowClick={(lead) => navigate(`/leads/${lead._id}`)}
      rowActions={(lead) => (
        <>
          <IconAction icon={FolderOpen} title={t('leads.openFile')} onClick={() => navigate(`/leads/${lead._id}`)} />
          <IconAction icon={Phone} title={t('leads.call')} onClick={() => window.open(`tel:${lead.clientPhone}`)} />
          <IconAction
            icon={MessageCircle}
            title={t('leads.whatsapp')}
            onClick={() => window.open(whatsappLink(lead.clientPhone), '_blank', 'noopener')}
          />
          {isManager && (
            <IconAction icon={Trash2} tone="danger" title={t('leads.delete')} onClick={() => onDelete(lead._id)} />
          )}
        </>
      )}
    />
  );
}
