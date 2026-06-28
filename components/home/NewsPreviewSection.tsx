"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { ExternalNewsArticle } from "@/types/news";
import { getExternalNews } from "@/services/newsService";
import NewsCard from "@/components/news/NewsCard";

const getArticleTime = (article: ExternalNewsArticle) => {
  const value = article.publishedAt || article.fetchedAt;
  return value ? new Date(value).getTime() : 0;
};

export default function NewsPreviewSection() {
  const [articles, setArticles] = useState<ExternalNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getExternalNews();
        const latestArticles = [...data]
          .sort((a, b) => getArticleTime(b) - getArticleTime(a))
          .slice(0, 3);
        setArticles(latestArticles);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (!loading && articles.length === 0) return null;

  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
              <Newspaper className="h-3 w-3" />
              <span>TIN TỨC MỚI NHẤT</span>
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              Cập nhật mới nhất từ <br /> cộng đồng người khiếm thính
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Những bài báo mới nhất về công nghệ hỗ trợ, giáo dục và các hoạt
              động cộng đồng nổi bật.
            </p>
          </div>

          <Link
            href="/news"
            className="group flex items-center gap-2 font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            Xem tất cả bài viết
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
