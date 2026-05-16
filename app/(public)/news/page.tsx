"use client";

import { useState, useEffect } from "react";
import { getExternalNews } from "@/services/newsService";
import NewsClient from "../../../components/news/NewsClient";
import { Loader2 } from "lucide-react";
import { ExternalNewsArticle } from "@/types/news";

export default function NewsPage() {
  const [articles, setArticles] = useState<ExternalNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getExternalNews();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Tin tức
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Tin tức liên quan đến công nghệ và cộng đồng
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            WeHear tổng hợp các bài viết liên quan đến AI, hỗ trợ người khiếm
            thính, ngôn ngữ ký hiệu và giáo dục hòa nhập từ các nguồn bên ngoài.
          </p>
        </div>

        <NewsClient articles={articles} />
      </div>
    </main>
  );
}