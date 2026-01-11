import { loadArticles } from '@/lib/articles';
import { getSiteConfig } from '@/lib/config';
import Link from 'next/link';
import { GridListLayout } from '@/components/list-layouts/GridListLayout';
import { ListLayout } from '@/components/list-layouts/ListLayout';
import { MasonryListLayout } from '@/components/list-layouts/MasonryListLayout';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  return {
    title: `Artykuły: ${decodedTag}`,
    description: `Przeglądaj artykuły z kategorii: ${decodedTag}`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const config = getSiteConfig();
  const articlesDb = await loadArticles();
  
  const articles = articlesDb.articles.filter(
    (article) =>
      (article.status === 'generated' || article.status === 'published') &&
      article.meta.keywords.some(
        (keyword) => keyword.toLowerCase() === decodedTag.toLowerCase()
      )
  );

  if (articles.length === 0) {
    notFound();
  }

  const renderLayout = () => {
    const title = `#${decodedTag}`;
    switch (config.layout.list) {
      case 'list':
        return <ListLayout articles={articles} title={title} />;
      case 'masonry':
        return <MasonryListLayout articles={articles} title={title} />;
      case 'grid':
      default:
        return <GridListLayout articles={articles} title={title} />;
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="hero-glow -top-32 left-1/4 opacity-30" />
      <div className="hero-glow top-1/2 -right-64 opacity-20" />
      
      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <nav className="mb-12 animate-fade-in-down">
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/" 
              className="group inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent-primary)] group-hover:bg-[var(--accent-muted)] transition-all duration-300">
                <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-medium">Strona główna</span>
            </Link>
            
            <span className="text-[var(--text-muted)]">/</span>
            
            <Link 
              href="/articles" 
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors duration-300 font-medium"
            >
              Artykuły
            </Link>
            
            <span className="text-[var(--text-muted)]">/</span>
            
            <span className="tag">
              {decodedTag}
            </span>
          </div>
        </nav>

        {renderLayout()}

        <div className="mt-16 text-center animate-fade-in stagger-6">
          <div className="inline-flex items-center gap-4">
            <div className="w-12 h-px bg-gradient-to-l from-[var(--border-default)] to-transparent" />
            <Link
              href="/articles"
              className="btn btn-ghost"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Zobacz wszystkie artykuły</span>
            </Link>
            <div className="w-12 h-px bg-gradient-to-r from-[var(--border-default)] to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
