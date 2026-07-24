#!/usr/bin/env node
/**
 * Generates locale files from English base + per-locale nav/common overrides.
 * Does NOT mix languages (no "Verbinden Wallet" title hacks).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '../packages/i18n/messages');
const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf8'));

function deepMerge(base, overrides) {
  const result = structuredClone(base);
  for (const [key, value] of Object.entries(overrides)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object'
    ) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/** Nav + common only — page body stays English until fully translated per locale. */
const LOCALE_OVERRIDES = {
  de: {
    nav: {
      home: 'Startseite',
      connect: 'Verbinden',
      overview: 'Übersicht',
      assets: 'Vermögenswerte',
      transactions: 'Transaktionen',
      vesting: 'Vesting',
      claims: 'Ansprüche',
      security: 'Sicherheit',
      transparency: 'Transparenz',
      settings: 'Einstellungen',
      account: 'Konto',
      support: 'Support',
      roadmap: 'Roadmap',
      legal: 'Rechtliches',
      install: 'Installieren',
      ecosystem: 'Ökosystem',
      officialDomains: 'Offizielle Domains',
    },
    common: {
      connectWallet: 'Wallet verbinden',
      disconnect: 'Trennen',
      verifyOwnership: 'Eigentum verifizieren',
      loading: 'Laden…',
      language: 'Sprache',
      securityCenter: 'Sicherheitszentrum',
      transparencyCenter: 'Transparenzzentrum',
      selectLanguage: 'Sprache wählen',
    },
    connect: { title: 'Wallet verbinden' },
  },
  tr: {
    nav: {
      home: 'Ana Sayfa',
      connect: 'Bağlan',
      overview: 'Genel Bakış',
      assets: 'Varlıklar',
      transactions: 'İşlemler',
      vesting: 'Hakediş',
      claims: 'Talepler',
      security: 'Güvenlik',
      transparency: 'Şeffaflık',
      settings: 'Ayarlar',
      account: 'Hesap',
      support: 'Destek',
      roadmap: 'Yol Haritası',
      legal: 'Yasal',
      install: 'Yükle',
      ecosystem: 'Ekosistem',
      officialDomains: 'Resmi Alan Adları',
    },
    common: {
      connectWallet: 'Cüzdan Bağla',
      disconnect: 'Bağlantıyı Kes',
      verifyOwnership: 'Sahipliği Doğrula',
      loading: 'Yükleniyor…',
      language: 'Dil',
      securityCenter: 'Güvenlik Merkezi',
      transparencyCenter: 'Şeffaflık Merkezi',
    },
    connect: { title: 'Cüzdan Bağla' },
  },
  fr: {
    nav: {
      overview: 'Aperçu',
      assets: 'Actifs',
      security: 'Sécurité',
      transparency: 'Transparence',
      support: 'Support',
      install: 'Installer',
    },
    common: {
      connectWallet: 'Connecter le portefeuille',
      verifyOwnership: 'Vérifier la propriété',
      language: 'Langue',
    },
  },
  es: {
    nav: {
      overview: 'Resumen',
      assets: 'Activos',
      security: 'Seguridad',
      transparency: 'Transparencia',
      support: 'Soporte',
      install: 'Instalar',
    },
    common: {
      connectWallet: 'Conectar billetera',
      verifyOwnership: 'Verificar propiedad',
      language: 'Idioma',
    },
  },
  ar: {
    nav: {
      overview: 'نظرة عامة',
      assets: 'الأصول',
      security: 'الأمان',
      transparency: 'الشفافية',
      support: 'الدعم',
      install: 'تثبيت',
    },
    common: {
      connectWallet: 'ربط المحفظة',
      verifyOwnership: 'التحقق من الملكية',
      language: 'اللغة',
    },
  },
};

const locales = [
  'tr',
  'de',
  'fr',
  'es',
  'it',
  'pt',
  'nl',
  'ar',
  'ru',
  'zh',
  'ja',
  'ko',
  'hi',
  'ur',
  'id',
  'ms',
  'fa',
  'el',
  'bg',
  'ro',
  'pl',
  'uk',
  'az',
  'ka',
];

for (const locale of locales) {
  const overrides = LOCALE_OVERRIDES[locale] || {};
  const merged = deepMerge(en, overrides);
  writeFileSync(join(messagesDir, `${locale}.json`), JSON.stringify(merged, null, 2) + '\n');
  console.log(`Generated ${locale}.json`);
}

console.log('Done. English base preserved; nav/common localized where defined.');
