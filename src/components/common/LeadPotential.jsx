import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Tooltip } from '../ui/Tooltip';
import { useLanguage } from '../../i18n/LanguageContext';

const TONES = {
  READY_TO_BUY: 'bg-emerald-50 text-ok',
  STRONG_POTENTIAL: 'bg-primary-soft text-primary',
  MEDIUM_POTENTIAL: 'bg-warn-soft text-warn',
  NOT_INTERESTED: 'bg-danger/10 text-danger',
};

const RISK_CODES = ['OBJECTION', 'DISENGAGED', 'INCOMPLETE', 'LOST'];

/** AI "potential" tier badge; hovering reveals the score and the reasons behind it. */
export default function LeadPotential({ lead, className }) {
  const { t } = useLanguage();
  const status = lead.aiPotentialStatus || 'MEDIUM_POTENTIAL';
  const score = Number.isFinite(lead.aiLeadScore) ? Math.round(lead.aiLeadScore) : 0;
  const reasons = lead.aiReasons || [];
  const hasChat = lead.conversation && lead.conversation.source !== 'NONE';

  const tooltip = (
    <div className="rounded border border-line bg-white p-2.5 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Sparkles className="size-3.5 text-primary" /> {t(`aiPotential.${status}`)}
        </span>
        <span className="text-xs font-medium tabular-nums text-muted">{score}/100</span>
      </div>
      {hasChat && <p className="mt-0.5 text-[11px] text-muted">{t('aiPotential.basedOnChat')}</p>}
      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">{t('aiPotential.why')}</p>
      <ul className="mt-1 space-y-1">
        {reasons.map((code) => (
          <li key={code} className={cn('flex gap-1.5 text-xs leading-snug', RISK_CODES.includes(code) ? 'text-danger' : 'text-ink')}>
            <span aria-hidden="true">·</span>
            <span>{t(`aiReason.${code}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Tooltip content={tooltip} side="bottom">
      <span
        className={cn(
          'inline-flex cursor-default items-center rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap',
          TONES[status] || TONES.MEDIUM_POTENTIAL,
          className
        )}
      >
        {t(`aiPotential.${status}`)}
      </span>
    </Tooltip>
  );
}
