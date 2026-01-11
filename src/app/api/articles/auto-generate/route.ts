import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { generateArticleFromTopic, generateMultipleArticles } from '@/lib/article-generator';
import { getPendingTopics } from '@/lib/topics';
import { generateTopicsFromSeeds } from '@/lib/topic-generator';
import { getSiteConfig } from '@/lib/config';


export async function POST(request: NextRequest) {
  // API key auth (from config)
  const config = getSiteConfig();
  const apiKey = config.admin?.apiKey;
  const reqKey = request.headers.get('x-api-key');
  if (!apiKey || reqKey !== apiKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Provide valid X-API-Key.' },
      { status: 401 }
    );
  }

  try {
    // Najpierw pobierz 3 tematy do wygenerowania artykułów
    let pendingTopics = await getPendingTopics(3);
    if (pendingTopics.length < 3) {
      // Jeśli nie ma wystarczająco tematów, wygeneruj brakujące tematy z seed keywords
      await generateTopicsFromSeeds(3);
      // Pobierz ponownie tematy
      pendingTopics = await getPendingTopics(3);
    }
    const slugs = pendingTopics.map(t => t.slug);
    const result = await generateMultipleArticles(slugs);

    revalidatePath('/');
    revalidatePath('/articles');
    result.articles.forEach(article => {
      revalidatePath(`/articles/${article.slug}`);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in auto-generate articles API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
