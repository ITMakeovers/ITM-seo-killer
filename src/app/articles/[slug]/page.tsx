import { getArticleBySlug, loadArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { generateArticleMetadata, generateArticleJsonLd } from '@/lib/seo';
import { getSiteConfig } from '@/lib/config';
import { Metadata } from 'next';
import { StandardArticleLayout } from '@/components/article-layouts/StandardArticleLayout';
import { WideArticleLayout } from '@/components/article-layouts/WideArticleLayout';
import { MinimalArticleLayout } from '@/components/article-layouts/MinimalArticleLayout';

export const revalidate = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articlesDb = await loadArticles();
  const publishedArticles = articlesDb.articles.filter(
    (a) => a.status === 'generated' || a.status === 'published'
  );
  
  return publishedArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artykuł nie znaleziony',
    };
  }

  return generateArticleMetadata(article);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const jsonLd = generateArticleJsonLd(article);
  const config = getSiteConfig();
  const layoutType = config.layout.article;

  const renderLayout = () => {
    switch (layoutType) {
      case 'wide':
        return <WideArticleLayout article={article} />;
      case 'minimal':
        return <MinimalArticleLayout article={article} />;
      case 'standard':
      default:
        return <StandardArticleLayout article={article} />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {renderLayout()}
    </>
  );
}
