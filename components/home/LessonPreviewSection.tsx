const lessons = [
  {
    id: 1,
    title: "Giao tiếp cơ bản",
    level: "Cơ bản",
    desc: "Làm quen với các ký hiệu chào hỏi và giao tiếp hàng ngày.",
  },
  {
    id: 2,
    title: "Từ vựng hành chính",
    level: "Trung cấp",
    desc: "Các ký hiệu liên quan đến địa chỉ, tỉnh thành và thông tin công việc.",
  },
  {
    id: 3,
    title: "Ôn tập bằng câu hỏi",
    level: "Luyện tập",
    desc: "Kiểm tra khả năng ghi nhớ ký hiệu thông qua bài trắc nghiệm ngắn.",
  },
];

export default function LessonPreviewSection() {
  return (
    <section className="pb-20 pt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Học tập
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Học ngôn ngữ ký hiệu theo lộ trình dễ tiếp cận
          </h2>
          <p className="mt-3 text-slate-600">
            Hệ thống cung cấp các bài học từ cơ bản đến nâng cao, kết hợp với quiz
            để người dùng luyện tập thường xuyên.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-[28px] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {lesson.level}
              </span>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                {lesson.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {lesson.desc}
              </p>
              <button className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Khám phá bài học
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}