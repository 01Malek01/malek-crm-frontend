import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANG, tr } from './translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'crm_lang';

function applyDirection(lang) {
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG);

  const t = useCallback((key, vars) => tr(lang, key, vars), [lang]);

  useEffect(() => {
    applyDirection(lang);
    document.title = tr(lang, 'common.appName');
  }, [lang]);

  const changeLang = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLang(next);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang: changeLang,
      toggleLang: () => changeLang(lang === 'ar' ? 'en' : 'ar'),
      t,
      isRTL: lang === 'ar',
    }),
    [lang, changeLang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}