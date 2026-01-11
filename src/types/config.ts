export type LayoutType = 'portal' | 'magazine' | 'blog';
export type ArticleLayoutType = 'standard' | 'wide' | 'minimal';
export type ListLayoutType = 'grid' | 'list' | 'masonry';
export type ArticleLength = 'short' | 'medium' | 'long';
export type WritingStyle = 'professional' | 'casual' | 'academic' | 'conversational';
export type ImageProvider = 'unsplash' | 'pexels' | 'placeholder';

export interface ExternalDomain {
  domain: string;
  anchors: string[];
}

export interface LayoutConfig {
  homepage: LayoutType;
  article: ArticleLayoutType;
  list: ListLayoutType;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface ContentConfig {
  articlesPerGeneration: number;
  articleLength: ArticleLength;
  writingStyle: WritingStyle;
  generateFaq: boolean;
  faqQuestionsCount: number;
  minInternalLinks: number;
  maxInternalLinks: number;
}

export interface ExternalLinksConfig {
  enabled: boolean;
  allowedDomains: ExternalDomain[];
  maxExternalLinksPerArticle: number;
}

export interface SeoConfig {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  ogImageWidth: number;
  ogImageHeight: number;
  twitterCard: string;
}

export interface GenerationConfig {
  batchSize: number;
  autoGenerate: boolean;
  imageProvider: ImageProvider;
  imageFallback: 'placeholder' | 'none';
}

export interface AdminConfig {
  enabled: boolean;
  pinHash?: string;
  apiKey?: string;
}

export interface SiteConfig {
  siteName: string;
  domain: string;
  language: string;
  niche: string;
  seedKeywords: string[];
  layout: LayoutConfig;
  branding: BrandingConfig;
  content: ContentConfig;
  externalLinks: ExternalLinksConfig;
  seo: SeoConfig;
  generation: GenerationConfig;
  admin: AdminConfig;
}

