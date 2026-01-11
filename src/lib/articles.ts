import { Article, ArticlesDatabase } from '@/types/article';
import { generateId } from './slug';
import { getDatabase } from './mongodb';

const COLLECTION_NAME = 'articles';

export async function loadArticles(): Promise<ArticlesDatabase> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const articles = await collection.find({}).toArray();
  
  return {
    articles,
    lastUpdated: new Date().toISOString(),
    totalCount: articles.length
  };
}

export async function addArticle(article: Article): Promise<Article> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  await collection.insertOne(article);
  return article;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  return await collection.findOne({ slug });
}

export async function updateArticleStatus(id: string, status: Article['status'], error?: string): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const updateData: Partial<Article> = {
    status,
    updatedAt: new Date().toISOString()
  };
  
  if (status === 'published') {
    updateData.publishedAt = new Date().toISOString();
  }
  
  await collection.updateOne(
    { id },
    { $set: updateData }
  );
}

export async function getArticleStats() {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const [total, pending, generating, generated, published, error] = await Promise.all([
    collection.countDocuments({}),
    collection.countDocuments({ status: 'pending' }),
    collection.countDocuments({ status: 'generating' }),
    collection.countDocuments({ status: 'generated' }),
    collection.countDocuments({ status: 'published' }),
    collection.countDocuments({ status: 'error' })
  ]);
  
  return { total, pending, generating, generated, published, error };
}

export async function getPendingArticles(limit?: number): Promise<Article[]> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const query = collection.find({ status: 'pending' });
  
  if (limit) {
    query.limit(limit);
  }
  
  return await query.toArray();
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Article>(COLLECTION_NAME);
  
  const result = await collection.deleteOne({ slug });
  
  if (result.deletedCount > 0) {
    const { updateTopicStatusBySlug } = await import('./topics');
    await updateTopicStatusBySlug(slug, 'pending');
    return true;
  }
  
  return false;
}



