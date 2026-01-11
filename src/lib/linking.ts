import { Article, InternalLink, ExternalLink } from '@/types/article';
import { loadArticles } from './articles';
import { getSiteConfig, getRandomItem } from './config';
import { getDatabase } from './mongodb';

export function findRelatedArticles(
  currentArticle: Article,
  allArticles: Article[],
  limit: number
): Article[] {
  const currentKeywords = new Set(currentArticle.meta.keywords.map(k => k.toLowerCase()));
  
  const scored = allArticles
    .filter(article => article.slug !== currentArticle.slug)
    .filter(article => article.status === 'generated' || article.status === 'published')
    .map(article => {
      const articleKeywords = article.meta.keywords.map(k => k.toLowerCase());
      const commonKeywords = articleKeywords.filter(k => currentKeywords.has(k));
      const score = commonKeywords.length;
      
      return { article, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return scored.slice(0, limit).map(item => item.article);
}

export function generateInternalLinks(
  currentArticle: Article,
  relatedArticles: Article[]
): InternalLink[] {
  return relatedArticles.map(article => ({
    text: article.meta.title,
    slug: article.slug,
    targetTitle: article.meta.title
  }));
}

export function generateExternalLinks(count: number): ExternalLink[] {
  const config = getSiteConfig();
  
  if (!config.externalLinks.enabled || config.externalLinks.allowedDomains.length === 0) {
    return [];
  }
  
  const links: ExternalLink[] = [];
  
  for (let i = 0; i < count; i++) {
    const domainConfig = getRandomItem(config.externalLinks.allowedDomains);
    if (!domainConfig) continue;
    
    const anchor = getRandomItem(domainConfig.anchors);
    if (!anchor) continue;
    
    links.push({
      text: anchor,
      url: `https://${domainConfig.domain}`,
      domain: domainConfig.domain
    });
  }
  
  return links;
}

export async function updateArticleLinks(articleSlug: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Article>('articles');
  
  const currentArticle = await collection.findOne({ slug: articleSlug });
  
  if (!currentArticle) {
    return false;
  }
  
  const allArticles = await collection.find({}).toArray();
  const config = getSiteConfig();
  
  const maxInternalLinks = Math.min(
    config.content.maxInternalLinks,
    allArticles.length - 1
  );
  
  const minInternalLinks = Math.min(
    config.content.minInternalLinks,
    maxInternalLinks
  );
  
  const targetLinkCount = Math.floor(
    Math.random() * (maxInternalLinks - minInternalLinks + 1) + minInternalLinks
  );
  
  const relatedArticles = findRelatedArticles(
    currentArticle,
    allArticles,
    targetLinkCount
  );
  
  const internalLinks = generateInternalLinks(currentArticle, relatedArticles);
  
  const externalLinks = generateExternalLinks(
    config.externalLinks.maxExternalLinksPerArticle
  );
  
  await collection.updateOne(
    { slug: articleSlug },
    {
      $set: {
        internalLinks,
        externalLinks,
        updatedAt: new Date().toISOString()
      }
    }
  );
  
  return true;
}

export async function updateAllArticlesLinks(): Promise<{ updated: number; failed: number }> {
  const db = await getDatabase();
  const collection = db.collection<Article>('articles');
  
  let updated = 0;
  let failed = 0;
  
  const publishedArticles = await collection.find({
    status: { $in: ['generated', 'published'] }
  }).toArray();
  
  for (const article of publishedArticles) {
    try {
      const success = await updateArticleLinks(article.slug);
      if (success) {
        updated++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to update links for ${article.slug}:`, error);
      failed++;
    }
  }
  
  return { updated, failed };
}




