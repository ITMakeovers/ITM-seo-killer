import { Topic, TopicsDatabase } from '@/types/article';
import { generateUniqueSlug, generateId } from './slug';
import { getDatabase } from './mongodb';

const COLLECTION_NAME = 'topics';

export async function loadTopics(): Promise<TopicsDatabase> {
  const db = await getDatabase();
  const collection = db.collection<Topic>(COLLECTION_NAME);
  
  const topics = await collection.find({}).toArray();
  
  return {
    topics,
    lastUpdated: new Date().toISOString(),
    totalCount: topics.length
  };
}

export async function addTopics(newTopics: Omit<Topic, 'id' | 'slug' | 'createdAt'>[]): Promise<Topic[]> {
  const db = await getDatabase();
  const collection = db.collection<Topic>(COLLECTION_NAME);
  
  // Get existing topics to check for duplicates
  const existingTopics = await collection.find({}).toArray();
  const existingSlugs = existingTopics.map(t => t.slug);
  const existingTitles = new Set(existingTopics.map(t => t.title.toLowerCase()));
  
  const topicsToAdd: Topic[] = [];
  
  for (const topicData of newTopics) {
    const normalizedTitle = topicData.title.toLowerCase();
    
    if (existingTitles.has(normalizedTitle)) {
      continue;
    }
    
    const topic: Topic = {
      id: generateId(),
      title: topicData.title,
      slug: generateUniqueSlug(topicData.title, existingSlugs),
      keywords: topicData.keywords,
      seedKeyword: topicData.seedKeyword,
      status: topicData.status,
      createdAt: new Date().toISOString()
    };
    
    topicsToAdd.push(topic);
    existingSlugs.push(topic.slug);
    existingTitles.add(normalizedTitle);
  }
  
  if (topicsToAdd.length > 0) {
    await collection.insertMany(topicsToAdd);
  }
  
  return topicsToAdd;
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const db = await getDatabase();
  const collection = db.collection<Topic>(COLLECTION_NAME);
  
  return await collection.findOne({ slug });
}

export async function updateTopicStatus(id: string, status: Topic['status'], error?: string): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Topic>(COLLECTION_NAME);
  
  const updateData: Partial<Topic> = { status };
  
  if (error) {
    updateData.error = error;
  } else {
    // MongoDB $unset to remove field
    await collection.updateOne(
      { id },
      { 
        $set: { status },
        $unset: { error: '' }
      }
    );
    return;
  }
  
  if (status === 'generated') {
    updateData.generatedAt = new Date().toISOString();
  } else if (status === 'pending') {
    await collection.updateOne(
      { id },
      { 
        $set: { status },
        $unset: { generatedAt: '', error: '' }
      }
    );
    return;
  }
  
  await collection.updateOne(
    { id },
    { $set: updateData }
  );
}

export async function updateTopicStatusBySlug(slug: string, status: Topic['status'], error?: string): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Topic>(COLLECTION_NAME);
  
  const updateData: Partial<Topic> = { status };
  
  if (error) {
    updateData.error = error;
  } else {
    await collection.updateOne(
      { slug },
      { 
        $set: { status },
        $unset: { error: '' }
      }
    );
    return;
  }
  
  if (status === 'generated') {
    updateData.generatedAt = new Date().toISOString();
  } else if (status === 'pending') {
    await collection.updateOne(
      { slug },
      { 
        $set: { status },
        $unset: { generatedAt: '', error: '' }
      }
    );
    return;
  }
  
  await collection.updateOne(
    { slug },
    { $set: updateData }
  );
}

export async function getPendingTopics(limit?: number): Promise<Topic[]> {
  const db = await getDatabase();
  const collection = db.collection<Topic>(COLLECTION_NAME);
  
  const query = collection.find({ status: 'pending' });
  
  if (limit) {
    query.limit(limit);
  }
  
  return await query.toArray();
}

export async function getTopicStats() {
  const db = await getDatabase();
  const collection = db.collection<Topic>(COLLECTION_NAME);
  
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




