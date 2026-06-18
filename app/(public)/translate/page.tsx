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
  ShieldCheck,
  Camera
} from "lucide-react";

export default function TranslatePage() {
  const [activeTab, setActiveTab] = useState<'quick' | 'upload' | 'live'>('quick');

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-slate-100 overflow-hidden">
        {/* ... (phần nền và trang trí giữ nguyên) */}
        
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest border border-rose-100 animate-fade-in">
              <Zap size={16} /> Real-time Translation Ready
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Giao tiếp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                Theo thời gian thực
              </span>
            </h1>
            
            {/* Tab Switcher - Cập nhật 3 tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-[24px] mt-12 w-full max-w-xl">
              <button 
                onClick={() => setActiveTab('live')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[20px] text-sm font-black transition-all ${
                  activeTab === 'live' 
                  ? "bg-white text-rose-600 shadow-xl shadow-slate-200" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Camera size={18} /> Dịch trực tiếp
              </button>
              <button 
                onClick={() => setActiveTab('quick')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[20px] text-sm font-black transition-all ${
                  activeTab === 'quick' 
                  ? "bg-white text-blue-600 shadow-xl shadow-slate-200" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Languages size={18} /> Từ ký hiệu → Câu
              </button>
              <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[20px] text-sm font-black transition-all ${
                  activeTab === 'upload' 
                  ? "bg-white text-indigo-600 shadow-xl shadow-slate-200" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Video size={18} /> Tải video
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-16">
         <div className="grid grid-cols-1 gap-12">
            {activeTab === 'live' ? <LiveTranslate /> : activeTab === 'quick' ? <QuickTranslate /> : <UploadTranslate />}
         </div>

         {/* Features Info */}
         <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={28} />
               </div>
               <h4 className="text-xl font-black text-slate-900">Độ chính xác cao</h4>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Dữ liệu được kiểm duyệt bởi các chuyên gia ngôn ngữ ký hiệu Việt Nam (VSL).
               </p>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
               <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Languages size={28} />
               </div>
               <h4 className="text-xl font-black text-slate-900">Đa ngôn ngữ</h4>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Hỗ trợ dịch từ tiếng Việt sang ký hiệu và nhận diện ký hiệu qua video.
               </p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
               <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={28} />
               </div>
               <h4 className="text-xl font-black text-slate-900">Hỗ trợ cộng đồng</h4>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Giúp người khiếm thính và người nghe hiểu nhau hơn trong cuộc sống.
               </p>
            </div>
         </div>

         {/* Guide Section */}
         <div className="mt-16 bg-slate-900 rounded-[48px] p-8 md:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="max-w-xl space-y-6">
                  <h3 className="text-3xl font-black leading-tight">Hướng dẫn sử dụng hệ thống phiên dịch</h3>
                  <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-black flex-shrink-0">1</div>
                        <p className="text-slate-300 font-medium">Nhập chuỗi từ hoặc cụm từ VSL theo đúng thứ tự nhận diện vào khung đầu vào.</p>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-black flex-shrink-0">2</div>
                        <p className="text-slate-300 font-medium">Mô hình ngôn ngữ sẽ phân tích trật tự từ và ngữ cảnh của chuỗi ký hiệu.</p>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-black flex-shrink-0">3</div>
                        <p className="text-slate-300 font-medium">Kết quả là một câu tiếng Việt tự nhiên, có thể sao chép hoặc phát thành giọng nói.</p>
                     </div>
                  </div>
               </div>
               <div className="flex-shrink-0 bg-white/10 backdrop-blur-md p-8 rounded-[40px] border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                     <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                     <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                     <div className="h-4 w-48 bg-white/20 rounded-full"></div>
                     <div className="h-4 w-32 bg-white/10 rounded-full"></div>
                     <div className="h-4 w-40 bg-white/15 rounded-full"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
