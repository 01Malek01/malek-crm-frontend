import { useRef } from 'react';
import { cn } from '../../utils/cn';
import { useUpdateLeadStage } from '../../hooks/lead.hooks';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiError } from '../../utils/format';
import LeadCard from './LeadCard';

const COLUMN_TINT = {
  NEW: 'border-t-slate-600',
  CONTACTED: 'border-t-primary',
  MATCHING: 'border-t-teal-600',
  VIEWING: 'border-t-teal-800',
  QUOTATION: 'border-t-warn',
  RESERVED: 'border-t-primary-dark',
  WON: 'border-t-ok',
  LOST: 'border-t-danger',
};

export default function PipelineColumn({
  stage,
  leads,
  isTarget,
  onDragStart,
  onDragEnd,
  onDescribeDrop,
  onAbortDrop,
  onSelectLead,
}) {
  const updateStage = useUpdateLeadStage();
  const toast = useToast();
  const { t } = useLanguage();
  const dragDepth = useRef(0);

  const handleDrop = (e) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    dragDepth.current = 0;
    onDragEnd();
    if (!leadId || leads.some((lead) => lead._id === leadId)) return;
    updateStage.mutate(
      { id: leadId, stage: stage.key },
      {
        onSuccess: () =>
          toast.success(t('leads.moveTo', { stage: t(`stage.${stage.key}`) })),
        onError: (err) => toast.error(apiError(err, t('leads.moveFailed'))),
      }
    );
  };

  return (
    <div
      className={cn(
        'flex w-60 shrink-0 flex-col rounded border-t-4 border-line bg-white shadow-sm',
        isTarget && 'ring-1 ring-primary',
        COLUMN_TINT[stage.key]
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDescribeDrop();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        onDescribeDrop();
      }}
      onDragLeave={() => {
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          onAbortDrop();
        }
      }}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-3 py-2" title={t(`stageHint.${stage.key}`)}>
        <span className="text-sm font-semibold text-ink">{t(`stage.${stage.key}`)}</span>
        <span className="rounded bg-canvas px-1.5 py-0.5 text-xs tabular-nums text-muted">
          {leads.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead._id}
            lead={lead}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', lead._id);
              onDragStart(lead._id);
            }}
            onDragEnd={onDragEnd}
            onClick={() => onSelectLead(lead)}
          />
        ))}
        {leads.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted">{t('common.noLeads')}</p>
        )}
      </div>
    </div>
  );
}