import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorPlay, Search, Settings } from 'lucide-react';
import { cn } from '../utils/cn';
import { SIDEBAR_MODULES } from '../config/sidebar';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';

/** ⌘K command palette: jump to any module or the demo. */
export default function CommandPalette({ open, onClose }) {
  const { t } = useLanguage();
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(() => {
    const modules = SIDEBAR_MODULES.filter((module) => module.roles.includes(user?.role)).map((module) => ({
      id: `module-${module.key}`,
      label: t(module.titleKey),
      hint: module.demo ? t('demo.badge') : '',
      icon: module.icon,
      to: module.href,
    }));
    const extras = [
      { id: 'demo', label: t('demo.badge'), hint: t('demo.explore'), icon: MonitorPlay, to: '/demo' },
      ...(isManager ? [{ id: 'settings', label: t('nav.settings'), hint: '', icon: Settings, to: '/settings' }] : []),
    ];
    return [...modules, ...extras];
  }, [t, user, isManager]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (command) => {
    navigate(command.to);
    onClose();
  };

  const onKeyDown = (event) => {
    if (!filtered.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIndex((i) => (i + 1) % filtered.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (event.key === 'Enter' && filtered[index]) {
      go(filtered[index]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40" />
      <div
        className="relative w-full max-w-md overflow-hidden rounded border border-line bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search className="size-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('common.search')}
            className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-1">
          {filtered.length ? (
            filtered.map((command, i) => (
              <li key={command.id}>
                <button
                  type="button"
                  onClick={() => go(command)}
                  onMouseEnter={() => setIndex(i)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-start text-sm',
                    i === index ? 'bg-canvas' : ''
                  )}
                >
                  <command.icon className="size-4 shrink-0 text-muted" />
                  <span className="flex-1 truncate text-ink">{command.label}</span>
                  {command.hint && <span className="shrink-0 text-xs text-muted">{command.hint}</span>}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-4 text-center text-sm text-muted">{t('common.noResults')}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
