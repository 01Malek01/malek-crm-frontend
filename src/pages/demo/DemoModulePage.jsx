import { useParams, Link } from 'react-router-dom';
import { LogIn, MonitorPlay } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { moduleByKey } from '../../config/sidebar';
import { useLanguage } from '../../i18n/LanguageContext';
import ModuleDemo from '../../features/modules/ModuleDemo';

/**
 * `/demo/:key` — renders the interactive sample data for demo modules, and a
 * "sign in" panel for live modules (which are backed by the real database).
 */
export default function DemoModulePage() {
  const { key } = useParams();
  const { t } = useLanguage();
  const module = moduleByKey(key);

  if (!module) {
    return <div className="py-16 text-center text-sm text-muted">{t('common.notFound')}</div>;
  }

  if (module.demo) {
    return <ModuleDemo module={module} />;
  }

  const Icon = module.icon;
  return (
    <div className="space-y-4">
      <PageHeader title={t(module.titleKey)} subtitle={t('demo.liveModule')} />
      <div className="flex flex-col items-center justify-center gap-3 rounded border border-line bg-white py-16 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded bg-primary-soft text-primary">
          <Icon className="size-6" />
        </span>
        <h2 className="text-sm font-semibold text-ink">{t('demo.liveModule')}</h2>
        <p className="max-w-md text-sm text-muted">{t('demo.liveModuleDesc')}</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <LogIn className="size-4" />
            {t('demo.signIn')}
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <MonitorPlay className="size-3.5" />
            {t('demo.badge')}
          </span>
        </div>
      </div>
    </div>
  );
}
