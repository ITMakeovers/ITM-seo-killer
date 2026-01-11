'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin();
      } else {
        setError('Nieprawidłowy PIN');
      }
    } catch {
      setError('Błąd podczas weryfikacji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-8">
      <div className="hero-glow -top-32 right-1/4 opacity-30" />
      <div className="hero-glow top-1/2 -left-64 opacity-20" />
      
      <div className="relative w-full max-w-md mx-auto px-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display text-gradient mb-2">Panel administracyjny</h1>
            <p className="text-[var(--text-muted)] text-sm">Wprowadź PIN aby kontynuować</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Wprowadź PIN"
                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full bg-gradient-to-r from-sky-600 to-sky-500 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:from-sky-500 hover:to-sky-400 disabled:from-neutral-700 disabled:to-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Weryfikacja...
                </span>
              ) : 'Zaloguj'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Powrót do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  keywords: string[];
  seedKeyword: string;
  status: string;
  createdAt: string;
}

interface Article {
  id: string;
  slug: string;
  status: string;
  meta: {
    title: string;
  };
  imageUrl: string;
  createdAt: string;
}

interface TopicStats {
  total: number;
  pending: number;
  generating: number;
  generated: number;
  published: number;
  error: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<TopicStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingArticle, setGeneratingArticle] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const loadTopics = async () => {
    setLoading(true);
    try {
      const [topicsRes, articlesRes] = await Promise.all([
        fetch('/api/topics'),
        fetch('/api/articles')
      ]);
      
      const topicsData = await topicsRes.json();
      const articlesData = await articlesRes.json();
      
      if (topicsData.success) {
        setTopics(topicsData.topics);
        setStats(topicsData.stats);
      }
      
      if (articlesData.success) {
        setArticles(articlesData.articles);
      }
    } catch {
      setMessage('Błąd podczas wczytywania danych');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Load topics when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTopics();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    loadTopics();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setTopics([]);
      setArticles([]);
      setStats(null);
    } catch {
      setMessage('Błąd podczas wylogowania');
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const handleGenerateTopics = async () => {
    setGenerating(true);
    setMessage('Generowanie tematów...');
    
    try {
      const response = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Wygenerowano ${data.generated} nowych tematów`);
        await loadTopics();
      } else {
        setMessage(`Błąd: ${data.error}`);
      }
    } catch {
      setMessage('Błąd podczas generowania tematów');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateArticle = async (slug: string) => {
    setGeneratingArticle(slug);
    setMessage(`Generowanie artykułu dla: ${slug}...`);
    
    try {
      const response = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug: slug })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Artykuł wygenerowany pomyślnie`);
        await loadTopics();
      } else {
        setMessage(`Błąd: ${data.error}`);
      }
    } catch {
      setMessage('Błąd podczas generowania artykułu');
    } finally {
      setGeneratingArticle(null);
    }
  };

  const handleGenerateBatch = async (count: number) => {
    setGenerating(true);
    setMessage(`Generowanie ${count} artykułów...`);
    
    try {
      const response = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      
      const data = await response.json();
      
      if (data.success > 0) {
        setMessage(`Wygenerowano ${data.success} artykułów${data.failed > 0 ? `, błędów: ${data.failed}` : ''}`);
        await loadTopics();
      } else {
        setMessage(`Błąd: nie udało się wygenerować artykułów (${data.failed} błędów)`);
      }
    } catch {
      setMessage('Błąd podczas generowania artykułów');
    } finally {
      setGenerating(false);
    }
  };

  const handleResetTopic = async (topicId: string) => {
    try {
      const response = await fetch('/api/topics/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Status zresetowany');
        await loadTopics();
      } else {
        setMessage(`Błąd: ${data.error}`);
      }
    } catch {
      setMessage('Błąd podczas resetowania statusu');
    }
  };

  const handleLinkArticles = async () => {
    setGenerating(true);
    setMessage('Linkowanie artykułów...');
    
    try {
      const response = await fetch('/api/articles/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`${data.message}`);
        await loadTopics();
      } else {
        setMessage(`Błąd: ${data.error}`);
      }
    } catch {
      setMessage('Błąd podczas linkowania artykułów');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten artykuł?')) {
      return;
    }

    try {
      const response = await fetch('/api/articles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Artykuł usunięty pomyślnie');
        await loadTopics();
      } else {
        setMessage(`Błąd: ${data.error}`);
      }
    } catch {
      setMessage('Błąd podczas usuwania artykułu');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'generating': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'generated': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'published': return 'bg-violet-500/15 text-violet-400 border-violet-500/30';
      case 'error': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Oczekuje';
      case 'generating': return 'Generowanie';
      case 'generated': return 'Wygenerowany';
      case 'published': return 'Opublikowany';
      case 'error': return 'Błąd';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen relative py-8">
      <div className="hero-glow -top-32 right-1/4 opacity-30" />
      <div className="hero-glow top-1/2 -left-64 opacity-20" />
      
      <div className="relative container mx-auto px-4 max-w-7xl">
        <header className="mb-12 animate-fade-in-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display text-gradient mb-2">Panel administracyjny</h1>
              <p className="text-[var(--text-muted)] text-sm">Zarządzanie tematami i artykułami</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-rose-400 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-rose-500 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="font-medium">Wyloguj</span>
              </button>
              <Link
                href="/"
                className="group flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent-primary)] transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="font-medium">Strona główna</span>
              </Link>
            </div>
          </div>
        </header>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 animate-fade-in-up">
            {[
              { label: 'Wszystkie', value: stats.total, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-tertiary)]' },
              { label: 'Oczekujące', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'W trakcie', value: stats.generating, color: 'text-sky-400', bg: 'bg-sky-500/10' },
              { label: 'Wygenerowane', value: stats.generated, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Opublikowane', value: stats.published, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { label: 'Błędy', value: stats.error, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`${stat.bg} border border-[var(--border-subtle)] rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:border-[var(--border-default)]`}
              >
                <div className={`text-3xl font-display ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 mb-10 animate-fade-in-up stagger-2">
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 overflow-hidden group hover:border-[var(--border-default)] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-sky-400 opacity-50" />
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Generowanie tematów</h2>
                <p className="text-sm text-[var(--text-muted)]">Na podstawie seed keywords</p>
              </div>
            </div>
            <button
              onClick={handleGenerateTopics}
              disabled={generating}
              className="w-full bg-gradient-to-r from-sky-600 to-sky-500 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:from-sky-500 hover:to-sky-400 disabled:from-neutral-700 disabled:to-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generowanie...
                </span>
              ) : 'Generuj tematy'}
            </button>
          </div>

          <div className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 overflow-hidden group hover:border-[var(--border-default)] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-50" />
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Generowanie artykułów</h2>
                <p className="text-sm text-[var(--text-muted)]">Dla oczekujących tematów</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[3, 5, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => handleGenerateBatch(count)}
                  disabled={generating}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-emerald-500 hover:to-emerald-400 disabled:from-neutral-700 disabled:to-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 overflow-hidden group hover:border-[var(--border-default)] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-violet-400 opacity-50" />
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Linkowanie</h2>
                <p className="text-sm text-[var(--text-muted)]">Linki wewnętrzne i zewnętrzne</p>
              </div>
            </div>
            <button
              onClick={handleLinkArticles}
              disabled={generating}
              className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 disabled:from-neutral-700 disabled:to-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            >
              {generating ? 'Linkowanie...' : 'Przelinkuj wszystkie'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-5 rounded-xl border text-sm font-medium animate-fade-in-up ${
            message.includes('Błąd') 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <div className="flex items-center gap-3">
              {message.includes('Błąd') ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message}
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl mb-10 overflow-hidden animate-fade-in-up stagger-3">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                Artykuły
                <span className="text-[var(--text-muted)] font-normal">({articles.length})</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tytuł</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Obrazek</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-[var(--bg-tertiary)] transition-colors duration-200">
                      <td className="px-6 py-5 text-sm text-[var(--text-primary)] font-medium max-w-xs truncate">{article.meta.title}</td>
                      <td className="px-6 py-5">
                        {article.imageUrl ? (
                          <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-[var(--border-subtle)]">
                            <Image 
                              src={article.imageUrl} 
                              alt="" 
                              fill
                              sizes="80px"
                              className="object-cover" 
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded">Brak</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--text-muted)]">
                        {new Date(article.createdAt).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-3">
                          <a
                            href={`/articles/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--accent-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Zobacz
                          </a>
                          <button
                            onClick={() => handleDeleteArticle(article.slug)}
                            className="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Usuń
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden animate-fade-in-up stagger-4">
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              Tematy
              <span className="text-[var(--text-muted)] font-normal">({topics.length})</span>
            </h2>
          </div>
          
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center gap-3 text-[var(--text-muted)]">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ładowanie...
              </div>
            </div>
          ) : topics.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)]">
                Brak tematów. Wygeneruj nowe tematy aby rozpocząć.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tytuł</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Seed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {topics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-[var(--bg-tertiary)] transition-colors duration-200">
                      <td className="px-6 py-5 text-sm text-[var(--text-primary)] font-medium max-w-xs truncate">{topic.title}</td>
                      <td className="px-6 py-5 text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-tertiary)] rounded px-2 py-1 inline-block">{topic.slug}</td>
                      <td className="px-6 py-5 text-sm text-[var(--text-secondary)]">{topic.seedKeyword}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusStyle(topic.status)}`}>
                          {getStatusText(topic.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--text-muted)]">
                        {new Date(topic.createdAt).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          {topic.status === 'pending' && (
                            <button
                              onClick={() => handleGenerateArticle(topic.slug)}
                              disabled={generatingArticle === topic.slug}
                              className="text-xs bg-gradient-to-r from-sky-600 to-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-sky-500 hover:to-sky-400 disabled:from-neutral-700 disabled:to-neutral-600 disabled:text-neutral-400 transition-all duration-200 shadow-md shadow-sky-500/20"
                            >
                              {generatingArticle === topic.slug ? (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  ...
                                </span>
                              ) : 'Generuj'}
                            </button>
                          )}
                          {topic.status === 'error' && (
                            <>
                              <button
                                onClick={() => handleResetTopic(topic.id)}
                                className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-500 transition-colors duration-200"
                              >
                                Resetuj
                              </button>
                              <button
                                onClick={() => handleGenerateArticle(topic.slug)}
                                disabled={generatingArticle === topic.slug}
                                className="text-xs bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-500 disabled:bg-neutral-700 transition-colors duration-200"
                              >
                                Ponów
                              </button>
                            </>
                          )}
                          {topic.status === 'generated' && (
                            <button
                              onClick={() => handleResetTopic(topic.id)}
                              className="text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-4 py-2 rounded-lg font-semibold border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-default)] transition-all duration-200"
                            >
                              Resetuj
                            </button>
                          )}
                          {topic.status === 'generating' && (
                            <span className="text-xs text-sky-400 flex items-center gap-2 bg-sky-500/10 px-3 py-2 rounded-lg">
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Generowanie...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
