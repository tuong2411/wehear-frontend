import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">WeHear</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Nền tảng cộng đồng hỗ trợ tra cứu, chia sẻ và giao tiếp bằng ngôn
            ngữ ký hiệu tiếng Việt.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Điều hướng
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-blue-600">
                Cộng đồng
              </Link>
            </li>
            <li>
              <Link href="/translate" className="hover:text-blue-600">
                Dịch ký hiệu
              </Link>
            </li>
            <li>
              <Link href="/dictionary" className="hover:text-blue-600">
                Từ điển
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-blue-600">
                Tin tức
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Thông tin dự án
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Khóa luận tốt nghiệp</li>
            <li>AI + Web Application</li>
            <li>Ngôn ngữ ký hiệu tiếng Việt</li>
            <li>Nguồn tham khảo video: QIPEDC</li>
            <li className="pt-1">
              <div className="group relative inline-flex">
                <button
                  type="button"
                  className="text-sm text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-blue-600 focus:outline-none focus-visible:text-blue-600"
                >
                  Nhóm phát triển
                </button>

                <div className="pointer-events-none absolute bottom-full right-0 z-10 mb-3 w-72 translate-y-1 rounded-md border border-slate-200 bg-white p-4 text-left text-sm text-slate-600 opacity-0 shadow-lg transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <p>
                    <span className="font-semibold text-slate-800">
                      Mô hình nhận diện ký hiệu:
                    </span>{" "}
                    Phan Văn Quân, Trịnh Hữu Thọ
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-800">
                      Phần mềm:
                    </span>{" "}
                    Hoàng Mạnh Tường
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500 sm:text-left">
          <p className="text-center sm:text-left">
            © 2026 WeHear. All rights reserved. Video tham khảo từ QIPEDC.
          </p>
        </div>
      </div>
    </footer>
  );
}
