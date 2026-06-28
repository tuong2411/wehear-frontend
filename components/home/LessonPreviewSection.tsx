import Link from "next/link";

const tools = [
  {
    id: 1,
    title: "Bài học VSL",
    level: "Bổ trợ",
    desc: "Một số bài học theo chủ đề để người dùng mới làm quen với ký hiệu cơ bản.",
    href: "/lessons",
  },
  {
    id: 2,
    title: "Từ điển ký hiệu",
    level: "Tra cứu",
    desc: "Tra nhanh ký hiệu, mô tả và video minh họa khi cần tham khảo trong thảo luận.",
    href: "/dictionary",
  },
  {
    id: 3,
    title: "Quiz luyện tập",
    level: "Ôn tập",
    desc: "Các câu hỏi ngắn giúp người dùng tự kiểm tra khả năng ghi nhớ ký hiệu.",
    href: "/quiz",
  },
];

export default function LessonPreviewSection() {
  return (
    <section className="pb-20 pt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Chức năng bổ trợ
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Bài học và từ điển vẫn có sẵn khi người dùng cần
          </h2>
          <p className="mt-3 text-slate-600">
            Các chức năng học tập không phải trọng tâm trang chủ, nhưng vẫn là
            công cụ hữu ích để tra cứu, luyện tập và hỗ trợ trao đổi trong cộng
            đồng.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {tool.level}
              </span>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                {tool.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {tool.desc}
              </p>
              <Link
                href={tool.href}
                className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Mở chức năng
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
