import { MetadataRoute } from 'next';
import { loadArticles } from '@/lib/articles';
import { getSiteUrl, getSiteConfig } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getSiteConfig();
  const articlesDb = await loadArticles();
  const articles = articlesDb.articles.filter(
    a => a.status === 'generated' || a.status === 'published'
  );

  const articleEntries: MetadataRoute.Sitemap = articles.map(article => ({
    url: getSiteUrl(`/articles/${article.slug}`),
    lastModified: article.updatedAt || article.publishedAt || article.createdAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: getSiteUrl('/'),
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];


  if (config.admin.enabled) {
    baseEntries.push({
      url: getSiteUrl('/admin'),
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.3,
    });
  }

  return [
    ...baseEntries,
    ...articleEntries,
  ];
}



