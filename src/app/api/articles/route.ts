import { NextResponse } from 'next/server';
import { loadArticles, getArticleStats } from '@/lib/articles';

export async function GET() {
  try {
    const [database, stats] = await Promise.all([
      loadArticles(),
      getArticleStats()
    ]);

    return NextResponse.json({
      success: true,
      articles: database.articles,
      stats,
      lastUpdated: database.lastUpdated
    });
  } catch (error) {
    console.error('Error loading articles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}











