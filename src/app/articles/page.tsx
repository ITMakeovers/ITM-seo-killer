import { loadArticles } from '@/lib/articles';
import { getSiteConfig } from '@/lib/config';
import Link from 'next/link';
import { GridListLayout } from '@/components/list-layouts/GridListLayout';
import { ListLayout } from '@/components/list-layouts/ListLayout';
import { MasonryListLayout } from '@/components/list-layouts/MasonryListLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wszystkie artykuły',
  description: 'Przeglądaj wszystkie opublikowane artykuły',
};

export const revalidate = 300;

export default async function ArticlesPage() {
  const config = getSiteConfig();
  const articlesDb = await loadArticles();
  const articles = articlesDb.articles.filter(
    (a) => a.status === 'generated' || a.status === 'published'
  );

  const renderLayout = () => {
    switch (config.layout.list) {
      case 'list':
        return <ListLayout articles={articles} title="Wszystkie artykuły" />;
      case 'masonry':
        return <MasonryListLayout articles={articles} title="Wszystkie artykuły" />;
      case 'grid':
      default:
        return <GridListLayout articles={articles} title="Wszystkie artykuły" />;
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="hero-glow -top-32 left-1/4 opacity-30" />
      <div className="hero-glow top-1/2 -right-64 opacity-20" />
      
      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <nav className="mb-12 animate-fade-in-down">
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
        </nav>

        {articles.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-24 animate-fade-in-up">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] opacity-20 blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center">
                <svg className="w-9 h-9 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-display mb-4 text-[var(--text-primary)]">
              Brak artykułów
            </h1>
            <p className="text-[var(--text-secondary)] mb-10 text-lg">
              Nie znaleziono żadnych opublikowanych artykułów.
            </p>
            {/* {config.admin.enabled && (
              <Link href="/admin" className="btn btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Panel administracyjny</span>
              </Link>
            )} */}
          </div>
        ) : (
          renderLayout()
        )}
      </div>
    </div>
  );
}
