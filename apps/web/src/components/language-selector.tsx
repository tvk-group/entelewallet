'use client';

import { useState, useMemo } from 'react';
import { useT, useI18n } from '@/lib/i18n-context';
import { LANGUAGES } from '@entelewallet/i18n';
import { cn } from '@entelewallet/utils';
import { Globe, Search, X } from 'lucide-react';

export function LanguageSelector({ className }: { className?: string }) {
  const t = useT();
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const current = LANGUAGES.find((l) => l.code === locale);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-cyan-300 hover:bg-cyan-50',
          className,
        )}
        aria-label={t('common.selectLanguage')}
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{current?.nativeName ?? locale.toUpperCase()}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 p-4 pt-20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="font-semibold text-slate-900">{t('common.selectLanguage')}</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('common.cancel')}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="border-b border-slate-100 px-4 py-2">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('common.searchLanguages')}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {filtered.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale(lang.code);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-cyan-50',
                      locale === lang.code && 'bg-cyan-50 font-medium text-cyan-900',
                    )}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-xs text-slate-400">{lang.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
