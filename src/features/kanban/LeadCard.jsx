import { User } from 'lucide-react';
import { cn } from '../../utils/cn';
import LeadPotential from '../../components/common/LeadPotential';
import { EnumPill } from '../../components/ui/StatusPill';
import { useLanguage } from '../../i18n/LanguageContext';
import { budgetText } from '../leads/LeadTable';

export default function LeadCard({ lead, onDragStart, onDragEnd, onClick }) {
  const { t } = useLanguage();
  const r = lead.requirements || {};

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'cursor-grab select-none rounded border border-line bg-white px-3 py-2 shadow-sm transition-shadow hover:shadow',
        'active:cursor-grabbing'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-ink">{lead.clientName}</p>
        <EnumPill prefix="purpose" value={r.purpose} />
      </div>

      <p className="mt-0.5 truncate text-xs tabular-nums text-muted">{budgetText(r)}</p>
      {(r.district || r.city || r.preferredTypes?.length > 0) && (
        <p className="truncate text-xs text-muted">
          {[r.preferredTypes?.map((v) => t(`propertyType.${v}`)).join('، '), r.district || r.city].filter(Boolean).join(' · ')}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <LeadPotential lead={lead} />
        <div className="flex items-center gap-1 text-xs text-muted">
          <User className="size-3" />
          {lead.assignedTo?.name?.split(' ')[0] || t('common.unassigned')}
        </div>
      </div>
    </div>
  );
}
