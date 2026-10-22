import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Building2, Languages, LogIn, MonitorPlay } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SIDEBAR_CATEGORIES, SIDEBAR_MODULES } from '../../config/sidebar';
import { ROLES } from '../../config/constants';
import { useLanguage } from '../../i18n/LanguageContext';

const ROLE_OPTIONS = [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.AGENT];

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-primary-soft font-medium text-primary' : 'text-muted hover:bg-canvas hover:text-ink'
  );

/**
 * Public, interactive showcase. The ONLY place sample/demo data is rendered.
 * A role switcher demonstrates RBAC by filtering the navigation.
 */
export default function DemoLayout() {
  const { t, toggleLang } = useLanguage();
  const [role, setRole] = useState(ROLES.ADMIN);

  const modules = SIDEBAR_MODULES.filter((module) => module.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-64 shrink-0 flex-col border-e border-line bg-white">
        <Link to="/demo" className="flex items-center gap-2 border-b border-line px-4 py-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded bg-primary text-white">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{t('common.appName')}</p>
            <p className="flex items-center gap-1 text-xs font-medium text-primary">
              <MonitorPlay className="size-3" /> {t('demo.badge')}
            </p>
          </div>
        </Link>

        <nav className="flex-1 space-y-3 overflow-y-auto p-2">
          <NavLink to="/demo" end className={linkClass}>
            {t('demo.backToDemo')}
          </NavLink>
          {SIDEBAR_CATEGORIES.map((category) => {
            const items = modules.filter((module) => module.category === category.key);
            if (!items.length) return null;
            return (
              <div key={category.key} className="space-y-1">
                <p className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {t(category.labelKey)}
                </p>
                {items.map((module) => (
                  <NavLink key={module.key} to={`/demo/${module.key}`} className={linkClass}>
                    <module.icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">{t(module.titleKey)}</span>
                    {module.demo && (
                      <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {t('demo.badge')}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">{t('demo.roleSwitcher')}</span>
            <div className="flex rounded border border-line p-0.5">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                    role === option ? 'bg-primary text-white' : 'text-muted hover:text-ink'
                  )}
                >
                  {t(`role.${option}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded border border-line px-2 py-1.5 text-sm text-muted hover:bg-canvas hover:text-ink"
              title={t('common.changeLanguage')}
            >
              <Languages className="size-4" />
              {t('language.toggle')}
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <LogIn className="size-4" />
              {t('demo.signIn')}
            </Link>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
