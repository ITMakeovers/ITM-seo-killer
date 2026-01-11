import { NextRequest, NextResponse } from 'next/server';
import { updateTopicStatus } from '@/lib/topics';
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
    const { topicId } = body;

    if (!topicId) {
      return NextResponse.json(
        { success: false, error: 'Missing topicId' },
        { status: 400 }
      );
    }

    updateTopicStatus(topicId, 'pending');

    return NextResponse.json({
      success: true,
      message: 'Topic status reset to pending'
    });
  } catch (error) {
    console.error('Error resetting topic:', error);
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











