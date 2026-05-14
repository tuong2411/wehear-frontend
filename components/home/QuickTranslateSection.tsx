import Link from "next/link";

export default function QuickTranslateSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 rounded-[32px] bg-white p-8 shadow-sm md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Dịch nhanh
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Bắt đầu sử dụng AI để dịch ký hiệu ngay trên trình duyệt
            </h2>
            <p className="mt-4 text-slate-600">
              Người dùng có thể bật camera để nhận diện trực tiếp hoặc tải video
              lên để hệ thống phân tích và chuyển đổi sang văn bản tiếng Việt.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/translate"
                className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Mở camera
              </Link>
              <Link
                href="/translate"
                className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Tải video
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">
                Dịch trực tiếp qua camera
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Nhận diện ký hiệu theo thời gian thực và hiển thị phụ đề ngay lập tức.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">
                Dịch từ video tải lên
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Phân tích video ký hiệu đã quay sẵn để kiểm tra nội dung và kết quả dịch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}