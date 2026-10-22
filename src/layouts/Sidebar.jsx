import { NavLink } from 'react-router-dom';
import { Building2, Settings, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { SIDEBAR_CATEGORIES, SIDEBAR_MODULES } from '../config/sidebar';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-primary-soft font-medium text-primary' : 'text-muted hover:bg-canvas hover:text-ink'
  );

export default function Sidebar({ open = false, onClose }) {
  const { user, isManager } = useAuth();
  const { t, isRTL } = useLanguage();

  const modules = SIDEBAR_MODULES.filter((module) => module.roles.includes(user?.role));

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-64 shrink-0 flex-col border-e border-line bg-white transition-transform duration-200 print:hidden md:static md:z-auto md:translate-x-0',
          open ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded bg-primary text-white">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{t('common.appName')}</p>
            <p className="truncate text-xs text-muted">{t('common.tagline')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-canvas hover:text-ink md:hidden"
            title={t('common.closeMenu')}
            aria-label={t('common.closeMenu')}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto p-2">
          {SIDEBAR_CATEGORIES.map((category) => {
            const items = modules.filter((module) => module.category === category.key);
            if (!items.length) return null;
            return (
              <div key={category.key} className="space-y-1">
                <p className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {t(category.labelKey)}
                </p>
                {items.map((module) => (
                  <NavLink
                    key={module.key}
                    to={module.href}
                    end={module.href === '/'}
                    onClick={onClose}
                    className={linkClass}
                  >
                    <module.icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">{t(module.titleKey)}</span>
                    {module.demo && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        {t('nav.preview')}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {isManager && (
          <div className="border-t border-line p-2">
            <NavLink to="/settings" onClick={onClose} className={linkClass}>
              <Settings className="size-4 shrink-0" />
              {t('nav.settings')}
            </NavLink>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-30 bg-ink/40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
    </>
  );
}