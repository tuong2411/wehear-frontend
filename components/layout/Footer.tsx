import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
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
            Nhóm phát triển
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <span className="font-semibold text-slate-800">
                Mô hình nhận diện ký hiệu:
              </span>{" "}
              Phan Văn Quân, Trịnh Hữu Thọ
            </li>
            <li>
              <span className="font-semibold text-slate-800">
                Phần mềm:
              </span>{" "}
              Hoàng Mạnh Tường
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
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-500">
        © 2026 WeHear. All rights reserved. Video tham khảo từ QIPEDC.
      </div>
    </footer>
  );
}
