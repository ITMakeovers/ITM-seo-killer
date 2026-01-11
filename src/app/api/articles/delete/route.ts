import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { deleteArticle } from '@/lib/articles';
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
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Missing slug parameter' },
        { status: 400 }
      );
    }

    const success = deleteArticle(slug);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    revalidatePath('/articles');
    revalidatePath(`/articles/${slug}`);

    return NextResponse.json({
      success: true,
      message: 'Artykuł usunięty pomyślnie'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
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




