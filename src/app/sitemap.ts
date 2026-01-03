import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://livvay.com';
  
  // Static pages
  const staticPages = [
    '',
    '/score',
    '/plus',
    '/liga',
    '/foundation',
    '/manifesto',
    '/imprensa',
    '/blog',
    '/privacidade',
    '/termos',
    '/contato',
  ];

  // Blog posts (in a real app, this would be dynamic)
  const blogPosts = [
    '/blog/sono-qualidade-vs-quantidade',
    '/blog/fibras-guia-pratico',
    '/blog/consistencia-vs-intensidade',
  ];

  const allPages = [...staticPages, ...blogPosts];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/blog') ? 0.7 : 0.8,
  }));
}

