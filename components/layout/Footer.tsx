import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">WeHear</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Nền tảng hỗ trợ nhận diện và dịch ngôn ngữ ký hiệu tiếng Việt sang
            văn bản, giúp tăng khả năng giao tiếp và tiếp cận thông tin cho
            cộng đồng người khiếm thính.
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
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-500">
        © 2026 WeHear. All rights reserved.
      </div>
    </footer>
  );
}