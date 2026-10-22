import { Languages, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';
import { RoleBadge } from '../components/ui/Badge';
import { UserChip } from '../components/common/UserChip';
import NotificationsMenu from './NotificationsMenu';

export default function Topbar({ onOpenSidebar, onOpenPalette }) {
  const { user, logout } = useAuth();
  const { t, toggleLang } = useLanguage();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-6 py-3 print:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded p-1.5 text-muted hover:bg-canvas hover:text-ink md:hidden"
          title={t('common.openMenu')}
          aria-label={t('common.openMenu')}
        >
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden w-full max-w-sm items-center gap-2 rounded border border-line bg-canvas px-3 py-2 text-sm text-muted transition-colors hover:bg-white hover:text-ink lg:flex"
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 truncate text-start">{t('common.search')}</span>
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded border border-line px-2 py-1 text-sm text-muted hover:bg-canvas hover:text-ink"
          title={t('common.changeLanguage')}
        >
          <Languages className="size-4" />
          {t('language.toggle')}
        </button>
        <NotificationsMenu />
        <div className="hidden items-center gap-2 sm:flex">
          <UserChip name={user?.name} email={user?.email} />
          <RoleBadge role={user?.role} />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-muted hover:bg-canvas hover:text-ink"
          title={t('common.signOut')}
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">{t('common.signOut')}</span>
        </button>
      </div>
    </header>
  );
}
