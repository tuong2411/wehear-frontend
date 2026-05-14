import { api }  from "./api";
import { ExternalNewsArticle, NewsSource } from "@/types/news";

export interface PagedNewsResponse {
  news: ExternalNewsArticle[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export const getExternalNews = async (): Promise<ExternalNewsArticle[]> => {
  const response = await api.get<ExternalNewsArticle[]>("/external-news");
  return response.data;
};

export const getAllNewsAdmin = async (page: number = 1, size: number = 10): Promise<PagedNewsResponse> => {
  const response = await api.get<PagedNewsResponse>(`/external-news/admin?page=${page}&size=${size}`);
  return response.data;
};

export const getExternalNewsBySlug = async (
  slug: string
): Promise<ExternalNewsArticle> => {
  const response = await api.get<ExternalNewsArticle>(`/external-news/${slug}`);
  return response.data;
};

export const getNewsById = async (id: number): Promise<ExternalNewsArticle> => {
  const response = await api.get<ExternalNewsArticle>(`/external-news/id/${id}`);
  return response.data;
};

export const createNews = async (news: Partial<ExternalNewsArticle>): Promise<void> => {
  await api.post("/external-news", news);
};

export const updateNews = async (id: number, news: Partial<ExternalNewsArticle>): Promise<void> => {
  await api.put(`/external-news/${id}`, news);
};

export const deleteNews = async (id: number): Promise<void> => {
  await api.delete(`/external-news/${id}`);
};

export const getNewsSources = async (): Promise<NewsSource[]> => {
  const response = await api.get<NewsSource[]>("/news-sources");
  return response.data;
};