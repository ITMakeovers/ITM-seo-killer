import { getSiteConfig, replaceTemplateVars } from './config';
import { generateWithGemini } from './gemini';
import { addArticle, updateArticleStatus } from './articles';
import { getTopicBySlug, updateTopicStatus } from './topics';
import { Article, ArticleSection, FaqItem } from '@/types/article';
import { generateId } from './slug';

interface GeneratedContent {
  title: string;
  lead: string;
  sections: ArticleSection[];
  faq?: FaqItem[];
  metaTitle: string;
  metaDescription: string;
}

export async function generateArticleContent(
  topicTitle: string,
  keywords: string[],
  niche: string,
  language: string,
  articleLength: string,
  writingStyle: string,
  generateFaq: boolean,
  faqCount: number
): Promise<GeneratedContent> {
  const lengthMap = {
    short: '300-400 słów',
    medium: '400-600 słów',
    long: '600-800 słów'
  };

  const prompt = `Jesteś ekspertem SEO i content writerem. Napisz profesjonalny artykuł o temacie: "${topicTitle}"

Parametry:
- Nisza: ${niche}
- Język: ${language}
- Długość: ${lengthMap[articleLength as keyof typeof lengthMap] || 'medium'}
- Styl: ${writingStyle}
- Słowa kluczowe: ${keywords.join(', ')}

PRZYKŁAD JSON (DOKŁADNIE taki format, krótko):
{
  "title": "Krótki tytuł max 50 znaków",
  "lead": "Jedno lub dwa krótkie zdania maksymalnie 40 słów.",
  "sections": [
    {"heading": "Pierwsza sekcja", "level": 2, "content": "Krótki tekst max 80 słów. Jeden lub dwa akapity."},
    {"heading": "Druga sekcja", "level": 2, "content": "Krótki tekst max 80 słów. Jeden lub dwa akapity."}
  ],
  ${generateFaq ? `"faq": [{"question": "Pytanie?", "answer": "Max 30 słów odpowiedź"}],` : ''}
  "metaTitle": "SEO title 50 znaków",
  "metaDescription": "SEO opis 150 znaków max"
}

Wymagania KRYTYCZNE:
- TYLKO 2-3 krótkie sekcje H2
- Każda sekcja: MAKSYMALNIE 80 słów (2 krótkie akapity)
- Lead: MAKSYMALNIE 40 słów
- Treść BEZ cudzysłowów " - używaj tylko '
- Treść zwykły tekst bez formatowania
${generateFaq ? `- FAQ: ${faqCount} pytania, KAŻDA odpowiedź MAX 30 słów` : '- BEZ FAQ'}
- JSON MUSI być kompletny i zamknięty
- Bądź ZWIĘZŁY`;

  const response = await generateWithGemini(prompt, 8192);
  
  let jsonStr = response.trim();
  
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```\n?/g, '');
  }
  
  jsonStr = jsonStr.trim();
  
  const startIdx = jsonStr.indexOf('{');
  const endIdx = jsonStr.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1) {
    jsonStr = jsonStr.substring(startIdx, endIdx + 1);
  }
  
  try {
    const content = JSON.parse(jsonStr) as GeneratedContent;
    return content;
  } catch (error) {
    console.error('Failed to parse JSON from Gemini response:');
    console.error('Response:', response);
    console.error('Cleaned JSON:', jsonStr);
    throw new Error(`Failed to parse article content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateArticleFromTopic(
  topicSlug: string
): Promise<Article> {
  const topic = await getTopicBySlug(topicSlug);
  
  if (!topic) {
    throw new Error(`Topic not found: ${topicSlug}`);
  }
  
  if (topic.status === 'generating') {
    throw new Error(`Topic is already being processed`);
  }
  
  if (topic.status === 'generated') {
    throw new Error(`Topic already has a generated article`);
  }
  
  await updateTopicStatus(topic.id, 'generating');
  
  const config = getSiteConfig();
  
  try {
    const content = await generateArticleContent(
      topic.title,
      topic.keywords,
      config.niche,
      config.language,
      config.content.articleLength,
      config.content.writingStyle,
      config.content.generateFaq,
      config.content.faqQuestionsCount
    );
    
    const { getImageForArticle } = await import('./images');
    const imageData = await getImageForArticle(content.title, topic.keywords);

    const article: Article = {
      id: generateId(),
      slug: topic.slug,
      status: 'generated',
      meta: {
        title: content.title,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        keywords: topic.keywords
      },
      lead: content.lead,
      sections: content.sections,
      faq: content.faq,
      internalLinks: [],
      externalLinks: [],
      imageUrl: imageData.url,
      imageAlt: imageData.alt,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };
    
    await addArticle(article);
    await updateTopicStatus(topic.id, 'generated');
    
    return article;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to generate article for topic ${topicSlug}:`, errorMsg);
    await updateTopicStatus(topic.id, 'error', errorMsg);
    throw error;
  }
}

export async function generateMultipleArticles(
  topicSlugs: string[],
  batchSize: number = 3
): Promise<{ success: number; failed: number; errors: string[]; articles: Article[] }> {
  const result = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    articles: [] as Article[]
  };
  
  for (let i = 0; i < topicSlugs.length; i += batchSize) {
    const batch = topicSlugs.slice(i, i + batchSize);
    
    for (const slug of batch) {
      try {
        const article = await generateArticleFromTopic(slug);
        result.success++;
        result.articles.push(article);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        result.failed++;
        result.errors.push(`${slug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
  
  return result;
}

