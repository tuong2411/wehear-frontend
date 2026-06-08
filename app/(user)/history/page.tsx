import ContributionHistory from "@/components/dictionary/ContributionHistory";
import { BookOpen, History, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const reviewSteps = [
    { title: "Gửi đóng góp", description: "Bạn gửi từ vựng, mô tả và video minh họa." },
    { title: "Kiểm tra hệ thống", description: "Hệ thống ghi nhận nội dung và trạng thái chờ duyệt." },
    { title: "Admin phê duyệt", description: "Admin xem video, kiểm tra mô tả và phản hồi nếu cần." },
    { title: "Xuất bản", description: "Đóng góp được hiển thị công khai trong từ điển." },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Lịch sử đóng góp</h1>
          <p className="mt-2 font-medium text-slate-500">
            Theo dõi các từ vựng bạn đã chia sẻ với WeHear.
          </p>
        </div>
        <Link
          href="/dictionary"
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
        >
          <PlusCircle size={20} />
          Đóng góp từ mới
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContributionHistory />
        </div>

        <aside className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-100">
            <BookOpen className="absolute -bottom-4 -right-4 h-32 w-32 rotate-12 text-white/10" />
            <h3 className="mb-4 text-2xl font-black">Bạn có biết?</h3>
            <p className="mb-6 text-sm leading-relaxed text-blue-100">
              Mỗi đóng góp của bạn giúp cộng đồng học ngôn ngữ ký hiệu dễ dàng hơn và làm từ điển ngày càng đầy đủ.
            </p>
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-black text-blue-600">
                +10
              </div>
              <div className="text-xs font-bold uppercase tracking-widest">Điểm uy tín cho mỗi đóng góp được duyệt</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 font-black text-slate-800">
              <History size={18} className="text-blue-500" />
              Quy trình kiểm duyệt
            </h4>
            <ul className="space-y-4">
              {reviewSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[10px] font-bold text-blue-600">
                      {index + 1}
                    </div>
                    {index < reviewSteps.length - 1 && <div className="my-1 h-full w-px bg-slate-100" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{step.title}</p>
                    <p className="text-xs leading-relaxed text-slate-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
