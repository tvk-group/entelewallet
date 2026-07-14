import type { MetadataRoute } from 'next';
import { CANONICAL_APP_URL } from '@entelewallet/config';

export default function robots(): MetadataRoute.Robots {
  const base = CANONICAL_APP_URL.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dev/', '/auth/callback'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
