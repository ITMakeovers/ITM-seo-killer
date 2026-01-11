import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/articles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Error loading article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}











