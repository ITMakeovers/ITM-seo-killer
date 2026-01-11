import { Article } from '@/types/article';
import { ArticleCard } from '../ArticleCard';

interface BlogLayoutProps {
  articles: Article[];
  siteName: string;
  niche: string;
}

export function BlogLayout({ articles, siteName, niche }: BlogLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="text-center mb-20 animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--accent-primary)] blur-2xl opacity-20" />
            <div className="relative flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]" />
              <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--accent-secondary)] to-transparent" />
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display mb-6">
          {siteName}
        </h1>
        
        <p className="text-xl text-[var(--text-secondary)] max-w-lg mx-auto mb-10">
          {niche}
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-px bg-gradient-to-l from-[var(--border-default)] to-transparent" />
          <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-glow" />
          <div className="w-12 h-px bg-gradient-to-r from-[var(--border-default)] to-transparent" />
        </div>
      </header>

      <div className="space-y-2">
        {articles.map((article, index) => (
          <ArticleCard key={article.id} article={article} variant="minimal" index={index} />
        ))}
      </div>
      
      {articles.length > 0 && (
        <div className="flex justify-center mt-16 animate-fade-in stagger-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-gradient-to-l from-[var(--border-default)] to-transparent" />
            <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div className="w-8 h-px bg-gradient-to-r from-[var(--border-default)] to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}
