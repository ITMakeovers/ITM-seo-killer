import { getSiteConfig } from './config';
import { generateTopicIdeas } from './gemini';
import { addTopics } from './topics';
import { Topic } from '@/types/article';

export interface GenerateTopicsResult {
  success: boolean;
  generated: number;
  topics: Topic[];
  errors: string[];
}

export async function generateTopicsFromSeeds(
  topicsPerKeyword: number = 3
): Promise<GenerateTopicsResult> {
  const config = getSiteConfig();
  const result: GenerateTopicsResult = {
    success: true,
    generated: 0,
    topics: [],
    errors: []
  };

  for (const seedKeyword of config.seedKeywords) {
    try {
      const titles = await generateTopicIdeas(
        seedKeyword,
        config.niche,
        config.language,
        topicsPerKeyword
      );

      const topicsToAdd = titles.map(title => ({
        title,
        keywords: [seedKeyword],
        seedKeyword,
        status: 'pending' as const
      }));

      const addedTopics = await addTopics(topicsToAdd);
      result.topics.push(...addedTopics);
      result.generated += addedTopics.length;

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      const errorMsg = `Failed to generate topics for "${seedKeyword}": ${error}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
}

export async function generateTopicsForKeyword(
  keyword: string,
  count: number = 5
): Promise<GenerateTopicsResult> {
  const config = getSiteConfig();
  const result: GenerateTopicsResult = {
    success: true,
    generated: 0,
    topics: [],
    errors: []
  };

  try {
    const titles = await generateTopicIdeas(
      keyword,
      config.niche,
      config.language,
      count
    );

    const topicsToAdd = titles.map(title => ({
      title,
      keywords: [keyword],
      seedKeyword: keyword,
      status: 'pending' as const
    }));

    const addedTopics = await addTopics(topicsToAdd);
    result.topics = addedTopics;
    result.generated = addedTopics.length;
  } catch (error) {
    result.success = false;
    result.errors.push(`Failed to generate topics: ${error}`);
  }

  return result;
}












