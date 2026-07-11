/** EnteleKRON dashboard embed integration — URL params and return paths. */

export const ENTELEKRON_INTEGRATION_SOURCE = 'entelekron' as const;

/** Investor dashboard return URL when opened from EnteleKRON presale dashboard. */
export const ENTELEKRON_INVESTOR_RETURN_URL =
  process.env.NEXT_PUBLIC_ENTELEKRON_INVESTOR_RETURN_URL ||
  'https://www.entelekron.io/presale/en/dashboard/investor';

/** `?view=` values supported on entelewallet.app root for embed routing. */
export const EMBED_VIEWS = ['wallet', 'security', 'transparency'] as const;
export type EmbedView = (typeof EMBED_VIEWS)[number];

export function isEmbedView(value: string | null | undefined): value is EmbedView {
  return value != null && (EMBED_VIEWS as readonly string[]).includes(value);
}

/** Brand colors for EnteleKRON dashboard embed (void + accent). */
export const EMBED_BRAND = {
  void: '#1e2f48',
  accent: '#14b8a6',
} as const;
