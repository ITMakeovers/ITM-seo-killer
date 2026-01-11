import { NextRequest, NextResponse } from 'next/server';
import { getImageForArticle } from '@/lib/images';
import { getArticleBySlug } from '@/lib/articles';
import { getDatabase } from '@/lib/mongodb';
import { Article } from '@/types/article';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Missing slug parameter' },
        { status: 400 }
      );
    }

    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    const imageData = await getImageForArticle(
      article.meta.title,
      article.meta.keywords
    );

    const db = await getDatabase();
    const collection = db.collection<Article>('articles');
    
    await collection.updateOne(
      { slug },
      {
        $set: {
          imageUrl: imageData.url,
          imageAlt: imageData.alt
        }
      }
    );

    return NextResponse.json({
      success: true,
      image: imageData
    });
  } catch (error) {
    console.error('Error fetching image:', error);
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










