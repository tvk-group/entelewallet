import type { MetadataRoute } from 'next';
import { CANONICAL_APP_URL, ROUTES } from '@entelewallet/config';

const APP_PATHS = [
  ROUTES.home,
  ROUTES.signIn,
  ROUTES.connect,
  ROUTES.overview,
  ROUTES.assets,
  ROUTES.transactions,
  ROUTES.vesting,
  ROUTES.claims,
  ROUTES.security,
  ROUTES.transparency,
  ROUTES.settings,
  ROUTES.account,
  ROUTES.support,
  ROUTES.install,
  ROUTES.officialDomains,
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = CANONICAL_APP_URL.replace(/\/$/, '');
  const lastModified = new Date();

  return APP_PATHS.map((path) => ({
    url: path === '/' ? base : `${base}${path}`,
    lastModified,
    changeFrequency: path === ROUTES.home ? 'weekly' : 'monthly',
    priority: path === ROUTES.home ? 1 : 0.7,
  }));
}
