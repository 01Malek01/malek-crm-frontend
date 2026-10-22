import { Inbox } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function EmptyState({ title, description, action }) {
  const { t } = useLanguage();
  const heading = title || t('common.noDataTitle');

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox className="size-8 text-line" />
      <p className="text-sm font-medium text-ink">{heading}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}