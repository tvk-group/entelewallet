import { CONTACT } from './contact';

export type SupportProvider = 'supabase' | 'formspree' | 'mailto';

export const SUPPORT_CONFIG = {
  provider: (process.env.SUPPORT_PROVIDER ||
    process.env.NEXT_PUBLIC_SUPPORT_PROVIDER ||
    'supabase') as SupportProvider,
  securityEmail: CONTACT.security,
  supportEmail: CONTACT.support,
  generalEmail: CONTACT.contact,
  formspreeEndpoint: process.env.FORMSPREE_ENDPOINT || '',
} as const;

export function getActiveSupportProvider(): SupportProvider {
  const provider = SUPPORT_CONFIG.provider;
  if (provider === 'formspree' && SUPPORT_CONFIG.formspreeEndpoint) return 'formspree';
  if (
    provider === 'supabase' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return 'supabase';
  }
  return 'mailto';
}

export const SUPPORT_REPORT_TYPES = [
  'report_phishing',
  'report_fake_domain',
  'report_suspicious_signature',
  'report_fake_support',
  'wallet_connection_issue',
  'transparency_concern',
  'general_support',
] as const;

export type SupportReportType = (typeof SUPPORT_REPORT_TYPES)[number];
