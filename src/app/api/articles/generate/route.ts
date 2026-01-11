import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { generateArticleFromTopic, generateMultipleArticles } from '@/lib/article-generator';
import { getPendingTopics } from '@/lib/topics';
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
    const { topicSlug, topicSlugs, count } = body;

    if (topicSlug) {
      const article = await generateArticleFromTopic(topicSlug);
      
      revalidatePath('/');
      revalidatePath('/articles');
      revalidatePath(`/articles/${article.slug}`);
      
      return NextResponse.json({
        success: true,
        article
      });
    }
    
    if (topicSlugs && Array.isArray(topicSlugs)) {
      const result = await generateMultipleArticles(topicSlugs);
      
      revalidatePath('/');
      revalidatePath('/articles');
      result.articles.forEach(article => {
        revalidatePath(`/articles/${article.slug}`);
      });
      
      return NextResponse.json(result);
    }
    
    if (count) {
      const pendingTopics = await getPendingTopics(count);
      const slugs = pendingTopics.map(t => t.slug);
      const result = await generateMultipleArticles(slugs);
      
      revalidatePath('/');
      revalidatePath('/articles');
      result.articles.forEach(article => {
        revalidatePath(`/articles/${article.slug}`);
      });
      
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Missing required parameters: topicSlug, topicSlugs, or count' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in generate articles API:', error);
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






