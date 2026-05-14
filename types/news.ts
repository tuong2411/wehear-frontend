export interface NewsSource {
  id: number;
  sourceName: string;
  sourceType: string;
  baseUrl: string;
  rssUrl?: string;
  apiUrl?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ExternalNewsArticle {
  id: number;
  sourceId: number;
  externalId?: string;
  title: string;
  slug: string;
  summary: string;
  articleUrl: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  fetchedAt?: string;
  authorName?: string;
  category?: string;
  tags?: string;
  languageCode?: string;
  contentType?: string;
  status?: string;
  relevanceScore?: number;
}