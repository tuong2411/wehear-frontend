export const runtime = "edge";

import Link from "next/link";
import { getExternalNewsBySlug } from "@/services/newsService";

export const dynamic = "force-dynamic";

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const { slug } = await params;

  let article = null;

  try {
    article = await getExternalNewsBySlug(slug);
  } catch (error) {
    console.error("DETAIL PAGE ERROR:", error);

    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-red-600 font-medium">Lỗi khi tải bài viết chi tiết</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">
            {String(error)}
          </pre>
          <p className="mt-4 text-sm text-slate-500">Slug: {slug}</p>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-red-600">Không tìm thấy bài viết với slug: {slug}</p>
        </div>
      </main>
    );
  }

  const tags = article.tags
    ? article.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/news"
          className="mb-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Quay lại danh sách tin
        </Link>

        <article className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="h-72 bg-gradient-to-br from-blue-100 via-cyan-100 to-slate-200">
            {article.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-600">
                Nguồn ngoài
              </span>

              {article.category && <span>{article.category}</span>}

              {article.publishedAt && (
                <span>
                  {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900">
              {article.title}
            </h1>

            {article.authorName && (
              <p className="mt-3 text-sm text-slate-500">
                Nguồn: {article.authorName}
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-base leading-8 text-slate-700">
                {article.summary}
              </p>
            </div>

            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm leading-7 text-slate-600">
                Đây là bài viết được tổng hợp từ nguồn bên ngoài. Để xem nội dung
                đầy đủ và bài gốc, vui lòng nhấn vào nút bên dưới.
              </p>

              <a
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Đọc bài gốc
              </a>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}