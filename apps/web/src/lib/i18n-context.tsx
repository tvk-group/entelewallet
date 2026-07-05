'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  getMessages,
  DEFAULT_LOCALE,
  isRtlLocale,
  type Messages,
  type LocaleCode,
  LANGUAGES,
} from '@entelewallet/i18n';

interface I18nContextValue {
  locale: LocaleCode;
  messages: Messages;
  setLocale: (locale: LocaleCode) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'entelewallet-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((newLocale: LocaleCode) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = isRtlLocale(newLocale) ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const messages = getMessages(locale);

  const t = useCallback(
    (key: string): string => {
      const parts = key.split('.');
      let current: unknown = messages;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return key;
        }
      }
      return typeof current === 'string' ? current : key;
    },
    [messages],
  );

  return (
    <I18nContext.Provider value={{ locale, messages, setLocale, t, isRtl: isRtlLocale(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
