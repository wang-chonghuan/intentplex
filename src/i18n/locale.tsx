import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const LOCALES = ['en', 'zh'] as const;

export type Locale = (typeof LOCALES)[number];

/** A value that exists in both languages. */
export type L10n<T> = Readonly<Record<Locale, T>>;

export const DEFAULT_LOCALE: Locale = 'en';

const STORAGE_KEY = 'intentplex.locale';

/** BCP-47 tag written to <html lang>, so the browser hyphenates correctly. */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hans',
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Picks the current language out of a bilingual value. */
  t: <T>(value: L10n<T>) => T;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function LocaleProvider({children}: {children: ReactNode}) {
  // Both server and first client render start from the default locale, so
  // hydration always matches. A stored preference is applied in an effect.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored) && stored !== DEFAULT_LOCALE) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: <T,>(bilingual: L10n<T>) => bilingual[locale],
    }),
    [locale, setLocale],
  );

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context == null) {
    throw new Error('useLocale must be used inside a LocaleProvider');
  }
  return context;
}
