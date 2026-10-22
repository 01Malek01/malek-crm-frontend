import { Languages } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AuthLayout({ children }) {
  const { t, toggleLang } = useLanguage();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4">
      <button
        onClick={toggleLang}
        className="absolute top-4 end-4 flex items-center gap-1.5 rounded border border-line bg-white px-2 py-1 text-sm text-muted hover:bg-canvas hover:text-ink"
        title={t('common.changeLanguage')}
      >
        <Languages className="size-4" />
        {t('language.toggle')}
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded bg-primary text-white">
            <Building2 className="size-5" />
          </span>
          <h1 className="text-lg font-semibold text-ink">{t('common.appName')}</h1>
          <p className="text-sm text-muted">{t('common.tagline')}</p>
        </div>
        {children}
      </div>
    </div>
  );
}