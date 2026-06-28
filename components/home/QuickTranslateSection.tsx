import Link from "next/link";

export default function QuickTranslateSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 rounded-2xl bg-white p-8 shadow-sm md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Công cụ hỗ trợ
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Dùng AI để hỗ trợ giao tiếp và kiểm chứng ký hiệu
            </h2>
            <p className="mt-4 text-slate-600">
              Người dùng có thể bật camera hoặc tải video lên để hệ thống phân
              tích, sau đó chia sẻ kết quả với cộng đồng khi cần góp ý thêm.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/translate"
                className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Mở camera
              </Link>
              <Link
                href="/translate"
                className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
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
                Nhận diện ký hiệu theo thời gian thực và hiển thị kết quả ngay
                trên trình duyệt.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">
                Dịch từ video tải lên
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Phân tích video ký hiệu đã quay sẵn để kiểm tra nội dung và lưu
                lại kết quả cần góp ý.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
