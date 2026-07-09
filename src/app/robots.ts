import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shubhvivahhall.in'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/bookings/', '/profile/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
