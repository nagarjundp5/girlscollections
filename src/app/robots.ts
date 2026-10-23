import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const adminSlug = process.env.NEXT_PUBLIC_ADMIN_ROUTE_SLUG || 'tgc-portal-secure-x97a';
  const staffSlug = process.env.NEXT_PUBLIC_STAFF_ROUTE_SLUG || 'staff-portal';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', `/${adminSlug}/`, `/${staffSlug}/`, '/api/admin/'],
    },
    sitemap: 'https://thegirlscollections.com/sitemap.xml',
  };
}
