import { getExternalNews } from "@/services/newsService";
import NewsClient from "../../../components/news/NewsClient";
export default async function NewsPage() {
  const articles = await getExternalNews();

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