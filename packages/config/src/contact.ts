/** Public EnteleWALLET contact emails — @entelewallet.com only */
export const CONTACT_EMAIL = 'contact@entelewallet.com';
export const SUPPORT_EMAIL = 'support@entelewallet.com';
export const SECURITY_EMAIL = 'security@entelewallet.com';
export const LEGAL_EMAIL = 'legal@entelewallet.com';
export const PRIVACY_EMAIL = 'privacy@entelewallet.com';
export const PARTNERS_EMAIL = 'partners@entelewallet.com';
export const PRESS_EMAIL = 'press@entelewallet.com';

export const CONTACT = {
  contact: process.env.GENERAL_CONTACT_EMAIL || CONTACT_EMAIL,
  support: process.env.SUPPORT_EMAIL || SUPPORT_EMAIL,
  security: process.env.SECURITY_CONTACT_EMAIL || SECURITY_EMAIL,
  legal: process.env.LEGAL_CONTACT_EMAIL || LEGAL_EMAIL,
  privacy: process.env.PRIVACY_CONTACT_EMAIL || PRIVACY_EMAIL,
  partners: process.env.PARTNERS_CONTACT_EMAIL || PARTNERS_EMAIL,
  press: process.env.PRESS_CONTACT_EMAIL || PRESS_EMAIL,
} as const;

export const PUBLIC_CONTACT_EMAILS = [
  { key: 'contact', email: CONTACT.contact, labelKey: 'support.emailContact' },
  { key: 'support', email: CONTACT.support, labelKey: 'support.emailSupport' },
  { key: 'security', email: CONTACT.security, labelKey: 'support.emailSecurity' },
  { key: 'legal', email: CONTACT.legal, labelKey: 'support.emailLegal' },
  { key: 'privacy', email: CONTACT.privacy, labelKey: 'support.emailPrivacy' },
  { key: 'partners', email: CONTACT.partners, labelKey: 'support.emailPartners' },
] as const;
