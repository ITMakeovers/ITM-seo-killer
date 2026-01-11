import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateArticleLinks, updateAllArticlesLinks } from '@/lib/linking';
import { loadArticles } from '@/lib/articles';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please provide valid authentication.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { slug, all } = body;

    if (all) {
      const result = updateAllArticlesLinks();
      
      const articlesDb = loadArticles();
      articlesDb.articles.forEach(article => {
        revalidatePath(`/articles/${article.slug}`);
      });
      revalidatePath('/');
      revalidatePath('/articles');
      
      return NextResponse.json({
        success: true,
        updated: result.updated,
        failed: result.failed,
        message: `Zaktualizowano linki w ${result.updated} artykułach`
      });
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Missing slug parameter' },
        { status: 400 }
      );
    }

    const success = updateArticleLinks(slug);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    revalidatePath(`/articles/${slug}`);

    return NextResponse.json({
      success: true,
      message: 'Linki zaktualizowane pomyślnie'
    });
  } catch (error) {
    console.error('Error updating article links:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}





