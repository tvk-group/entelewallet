export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', rtl: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', rtl: true },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', rtl: false },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', rtl: false },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', rtl: false },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', rtl: false },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', rtl: false },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', rtl: false },
] as const;

export type LocaleCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export const RTL_LOCALES: LocaleCode[] = ['ar', 'fa', 'ur'];

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale as LocaleCode);
}

export function getLanguageByCode(code: string) {
  return LANGUAGES.find((l) => l.code === code);
}

export const PROTECTED_NAMES = [
  'EnteleWALLET',
  'EnteleKRON',
  'ENK',
  'SOVRA',
  'EnergieMIND',
  'ENM',
  'TVK Group',
  'TVK Labs',
  'EnteleVAULT',
  'EnteleSCAN',
  'TVK ID',
] as const;
