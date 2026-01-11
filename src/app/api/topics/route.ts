import { NextResponse } from 'next/server';
import { loadTopics, getTopicStats } from '@/lib/topics';

export async function GET() {
  try {
    const [database, stats] = await Promise.all([
      loadTopics(),
      getTopicStats()
    ]);

    return NextResponse.json({
      success: true,
      topics: database.topics,
      stats,
      lastUpdated: database.lastUpdated
    });
  } catch (error) {
    console.error('Error loading topics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load topics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}












