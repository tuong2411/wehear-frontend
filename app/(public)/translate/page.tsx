"use client";

import { useState } from "react";
import QuickTranslate from "@/components/translate/QuickTranslate";
import UploadTranslate from "@/components/translate/UploadTranslate";
import LiveTranslate from "@/components/translate/LiveTranslate";
import {
  Languages,
  Video,
  MessageSquare,
  Zap,
  FlaskConical,
  Camera,
} from "lucide-react";

const translationGuides = {
  live: {
    accentClass: "bg-rose-600",
    title: "Hướng dẫn dịch trực tiếp",
    steps: [
      "Cho phép trình duyệt sử dụng camera, sau đó đặt tay và khuôn mặt trong khung hình.",
      "Nhấn \"Bắt đầu dịch\" và thực hiện ký hiệu rõ ràng, từng động tác một.",
      "Kết quả nhận diện sẽ xuất hiện trong nhật ký hội thoại, bạn có thể nghe lại hoặc lưu từ cần dùng.",
    ],
  },
  quick: {
    accentClass: "bg-blue-600",
    title: "Hướng dẫn dịch từ ký hiệu sang câu",
    steps: [
      "Nhập chuỗi từ hoặc cụm từ VSL theo đúng thứ tự nhận diện vào khung đầu vào.",
      "Chọn model dịch phù hợp rồi nhấn \"Dịch câu\" để hệ thống phân tích ngữ cảnh.",
      "Kết quả là một câu tiếng Việt tự nhiên, có thể sao chép hoặc phát thành giọng nói.",
    ],
  },
  upload: {
    accentClass: "bg-indigo-600",
    title: "Hướng dẫn dịch từ video tải lên",
    steps: [
      "Chọn hoặc kéo thả video có chứa động tác ký hiệu, ưu tiên video rõ tay và đủ sáng.",
      "Chờ hệ thống phân tích video và trả về danh sách kết quả nhận diện phù hợp nhất.",
      "Chọn kết quả đúng để lưu lại, hoặc gửi từ nhận diện sang phần dịch câu nếu cần tạo câu tiếng Việt hoàn chỉnh.",
    ],
  },
} satisfies Record<
  "quick" | "upload" | "live",
  { accentClass: string; title: string; steps: string[] }
>;

export default function TranslatePage() {
  const [activeTab, setActiveTab] = useState<"quick" | "upload" | "live">("live");
  const activeGuide = translationGuides[activeTab];

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 relative z-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-rose-100 animate-fade-in">
              <Zap size={14} /> Công cụ AI
            </div>
            <h1 className="text-[30px] sm:text-[34px] md:text-[40px] font-black text-slate-900 tracking-tight leading-[1.08]">
              Giao tiếp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                Theo thời gian thực
              </span>
            </h1>

          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="grid grid-cols-1 gap-1.5 bg-slate-100 p-1.5 rounded-[22px] w-full max-w-2xl mx-auto sm:grid-cols-3">
              <button
                onClick={() => setActiveTab("live")}
                className={`flex min-h-12 items-center justify-center gap-2 py-3 px-3 rounded-[18px] text-xs font-black transition-all sm:text-sm ${
                  activeTab === "live"
                    ? "bg-white text-rose-600 shadow-xl shadow-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Camera size={18} /> Dịch trực tiếp
              </button>
              <button
                onClick={() => setActiveTab("quick")}
                className={`flex min-h-12 items-center justify-center gap-2 py-3 px-3 rounded-[18px] text-xs font-black transition-all sm:text-sm ${
                  activeTab === "quick"
                    ? "bg-white text-blue-600 shadow-xl shadow-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Languages size={18} /> Từ ký hiệu - Câu
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex min-h-12 items-center justify-center gap-2 py-3 px-3 rounded-[18px] text-xs font-black transition-all sm:text-sm ${
                  activeTab === "upload"
                    ? "bg-white text-indigo-600 shadow-xl shadow-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Video size={18} /> Tải video
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8">
          {activeTab === "live" ? <LiveTranslate /> : activeTab === "quick" ? <QuickTranslate /> : <UploadTranslate />}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:mt-24 md:grid-cols-3 md:gap-6 lg:gap-8">
          <div className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <FlaskConical size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-900">Kết quả tham khảo</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Kết quả AI có thể thay đổi theo ánh sáng, góc quay và chất lượng video. Hãy kiểm tra lại trước khi dùng.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <Languages size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-900">Đa ngôn ngữ</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Hỗ trợ dịch từ tiếng Việt sang ký hiệu và nhận diện ký hiệu qua video.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-900">Hỗ trợ cộng đồng</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Giúp người khiếm thính và người nghe hiểu nhau hơn trong cuộc sống.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-slate-900 rounded-[28px] p-5 text-white overflow-hidden relative sm:rounded-[40px] sm:p-8 md:mt-16 md:p-12 lg:p-16">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
                  Hướng dẫn sử dụng hệ thống phiên dịch
                </p>
                <h3 className="mt-3 text-3xl font-black leading-tight">
                  {activeGuide.title}
                </h3>
              </div>
              <div className="space-y-4">
                {activeGuide.steps.map((step, index) => (
                  <div key={step} className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full ${activeGuide.accentClass} flex items-center justify-center text-sm font-black flex-shrink-0`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-slate-300 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md p-8 rounded-[40px] border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-rose-500 rounded-full" />
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-48 bg-white/20 rounded-full" />
                <div className="h-4 w-32 bg-white/10 rounded-full" />
                <div className="h-4 w-40 bg-white/15 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
