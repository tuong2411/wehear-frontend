"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NewsForm from "@/components/admin/NewsForm";
import { getNewsById } from "@/services/newsService";
import { ExternalNewsArticle } from "@/types/news";
import { Loader2 } from "lucide-react";

export default function EditNewsPage() {
  const params = useParams();
  const id = params.id as string;
  const [news, setNews] = useState<ExternalNewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsById(parseInt(id));
        setNews(data);
      } catch (error) {
        console.error("Failed to fetch news", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNews();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return <NewsForm initialData={news} isEdit={true} />;
}
