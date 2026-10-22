import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-primary', className)} />;
}

export function LoadingState({ label }) {
  const { t } = useLanguage();
  const text = label || t('common.loading');
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-muted">
      <Spinner />
      <span className="text-sm">{text}</span>
    </div>
  );
}