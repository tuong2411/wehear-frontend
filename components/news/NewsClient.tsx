"use client";

import { useMemo, useState, useEffect } from "react";
import NewsCard from "@/components/news/NewsCard";
import { ExternalNewsArticle } from "@/types/news";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

interface NewsClientProps {
  articles: ExternalNewsArticle[];
}

function extractTopics(articles: ExternalNewsArticle[]) {
  const topics = new Set<string>();
  articles.forEach((article) => {
    if (article.tags) {
      article.tags.split(",").forEach((tag) => {
        const cleanTag = tag.trim();
        if (cleanTag) topics.add(cleanTag);
      });
    }
  });
  return ["all", ...Array.from(topics)];
}

export default function NewsClient({ articles }: NewsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Khắc phục Hydration Mismatch bằng cách đợi component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const topics = useMemo(() => extractTopics(articles), [articles]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Sắp xếp theo ngày phát hành mới nhất, sau đó mới đến điểm liên quan
    result.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    });

    // Lọc theo search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.summary?.toLowerCase().includes(q)
      );
    }

    // Lọc theo topic
    if (topicFilter !== "all") {
      result = result.filter((article) => {
        if (!article.tags) return false;
        const tags = article.tags.split(",").map((tag) => tag.trim().toLowerCase());
        return tags.includes(topicFilter.toLowerCase());
      });
    }

    return result;
  }, [articles, topicFilter, searchQuery]);

  const featuredArticle = topicFilter === "all" && !searchQuery ? filteredArticles[0] : null;
  const listArticles = featuredArticle ? filteredArticles.slice(1) : filteredArticles;

  const totalPages = Math.ceil(listArticles.length / pageSize);
  const paginatedArticles = listArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Tránh render nội dung tương tác khi chưa mount để ngăn lỗi hydration từ browser extensions
  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header & Search */}
      <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Tin tức <span className="text-blue-600">Cộng đồng</span>
        </h1>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // Thêm suppressHydrationWarning để bỏ qua thuộc tính tự chèn từ extension
            suppressHydrationWarning
            className="w-full rounded-2xl border-none bg-white px-12 py-3 shadow-sm outline-none ring-1 ring-slate-100 transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chips Filter */}
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <div className="mr-4 flex items-center gap-2 text-sm font-bold text-slate-500">
           <SlidersHorizontal className="h-4 w-4" /> CHỦ ĐỀ:
        </div>
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => { setTopicFilter(topic); setCurrentPage(1); }}
            // Thêm suppressHydrationWarning để tránh lỗi từ thuộc tính tự chèn
            suppressHydrationWarning
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              topicFilter === topic
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            {topic === "all" ? "Tất cả bài viết" : topic.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Featured Article */}
      {featuredArticle && <NewsCard article={featuredArticle} isFeatured={true} />}

      {/* Articles Grid */}
      {paginatedArticles.length === 0 ? (
        <div className="rounded-[32px] bg-white p-20 text-center shadow-sm">
          <p className="text-xl font-medium text-slate-400">Không tìm thấy bài viết nào phù hợp.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center gap-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  suppressHydrationWarning
                  className={`h-12 w-12 rounded-2xl text-sm font-bold transition-all ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
