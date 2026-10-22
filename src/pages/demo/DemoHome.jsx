import { Link } from 'react-router-dom';
import { MonitorPlay } from 'lucide-react';
import { SIDEBAR_MODULES } from '../../config/sidebar';
import { useLanguage } from '../../i18n/LanguageContext';

/** Landing page for the public demo: hero + a grid of every module. */
export default function DemoHome() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="rounded border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
              <MonitorPlay className="size-3.5" /> {t('demo.badge')}
            </span>
            <h1 className="mt-3 text-xl font-semibold text-ink">{t('demo.explore')}</h1>
            <p className="mt-1 text-sm text-muted">{t('demo.exploreHint')}</p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            {t('demo.signIn')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SIDEBAR_MODULES.map((module) => (
          <Link
            key={module.key}
            to={`/demo/${module.key}`}
            className="group flex items-start gap-3 rounded border border-line bg-white p-4 shadow-sm transition-colors hover:border-primary hover:bg-primary-soft/20"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded bg-primary-soft text-primary">
              <module.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink group-hover:text-primary">{t(module.titleKey)}</p>
              {module.demo ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{t(`moduleSubtitle.${module.key}`)}</p>
              ) : (
                <p className="mt-0.5 text-xs text-muted">{t('demo.liveModule')}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
