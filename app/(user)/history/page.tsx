import ContributionHistory from "@/components/dictionary/ContributionHistory";
import { BookOpen, History, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lịch sử đóng góp</h1>
          <p className="mt-2 text-slate-500 font-medium">Theo dõi các từ vựng bạn đã chia sẻ với WeHear.</p>
        </div>
        <Link 
          href="/dictionary"
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <PlusCircle size={20} />
          Đóng góp từ mới
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ContributionHistory />
        </div>
        
        <div className="space-y-6">
           <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
              <BookOpen className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10 rotate-12" />
              <h3 className="text-2xl font-black mb-4">Bạn có biết?</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Mỗi đóng góp của bạn giúp hàng ngàn người khiếm thính tiếp cận thông tin dễ dàng hơn. Cảm ơn bạn vì tinh thần cộng đồng!
              </p>
              <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                 <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-black text-xl">
                    10
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest">
                    Điểm uy tín tích lũy
                 </div>
              </div>
           </div>

           <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm">
              <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                 <History size={18} className="text-blue-500" /> Quy trình kiểm duyệt
              </h4>
              <ul className="space-y-4">
                 {[
                   { t: "Gửi đóng góp", d: "User gửi từ vựng & video" },
                   { t: "Xử lý hệ thống", d: "Kiểm tra kỹ thuật & định dạng" },
                   { t: "Admin phê duyệt", d: "Kiểm tra nội dung chuyên môn" },
                   { t: "Xuất bản", d: "Hiển thị công khai trên từ điển" }
                 ].map((s, i) => (
                   <li key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                         <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center border border-blue-100">
                            {i+1}
                         </div>
                         {i < 3 && <div className="w-px h-full bg-slate-100 my-1" />}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-800">{s.t}</p>
                         <p className="text-xs text-slate-500">{s.d}</p>
                      </div>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
