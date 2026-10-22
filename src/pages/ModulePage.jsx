import { Link } from 'react-router-dom';
import { ExternalLink, MonitorPlay } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Secondary modules (brokers, gis, financials, procurement, workflow, documents, portals).
 * These are NOT backed by the live database — the real app shows an honest empty state and
 * points to the interactive `/demo` showcase, which is the only place sample data lives.
 */
export default function ModulePage({ module }) {
  const { t } = useLanguage();
  const Icon = module?.icon;

  return (
    <div className="space-y-4">
      <PageHeader title={t(module.titleKey)} subtitle={t(`moduleSubtitle.${module.key}`)} />

      <div className="flex flex-col items-center justify-center gap-3 rounded border border-line bg-white py-16 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded bg-primary-soft text-primary">
          <Icon className="size-6" />
        </span>
        <h2 className="text-sm font-semibold text-ink">{t('demo.notInLiveTitle')}</h2>
        <p className="max-w-md text-sm text-muted">{t('demo.notInLiveDesc')}</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <Link
            to={`/demo/${module.key}`}
            className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <MonitorPlay className="size-4" />
            {t('demo.openDemo')}
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <ExternalLink className="size-3.5" />
            {t('demo.badge')}
          </span>
        </div>
      </div>
    </div>
  );
}
