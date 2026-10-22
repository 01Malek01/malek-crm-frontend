import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function PageHeader({ title, subtitle, actions, backTo, backLabel, meta }) {
  const { isRTL } = useLanguage();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-2">
      {backTo && (
        <Link to={backTo} className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary">
          <BackIcon className="size-3.5" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-ink">{title}</h1>
            {meta}
          </div>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
