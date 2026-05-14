"use client";

import { useEffect, useState } from "react";
import { contributionService } from "@/services/contributionService";
import { DictionaryContribution } from "@/types/contribution";
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, Video } from "lucide-react";
import { motion } from "framer-motion";
import { ContributionCard } from "./ContributionCard";

export default function ContributionHistory() {
  const [contributions, setContributions] = useState<DictionaryContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      const response = await contributionService.getMyContributions();
      if (response.success) {
        setContributions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch contributions", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 w-full animate-pulse rounded-3xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[40px] border border-dashed border-slate-200 bg-white py-24 text-center">
        <div className="mb-6 rounded-3xl bg-blue-50 p-6 text-blue-500 shadow-inner">
          <Video size={48} strokeWidth={1.5} />
        </div>
        <h4 className="text-2xl font-black text-slate-900">Bắt đầu hành trình của bạn</h4>
        <p className="mt-3 max-w-sm text-slate-500 leading-relaxed">
          Bạn chưa có đóng góp nào. Hãy chia sẻ kiến thức ngôn ngữ ký hiệu của bạn để giúp đỡ cộng đồng.
        </p>
        <button 
          onClick={() => window.location.href = "/dictionary"}
          className="mt-8 flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Đóng góp từ vựng ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-col gap-4 bg-slate-50/80 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between rounded-3xl border border-white/40 shadow-sm">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             Lịch sử đóng góp
             <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                {contributions.length}
             </span>
           </h2>
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Theo dõi tiến độ đóng góp của bạn</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm từ vựng..." 
                className="w-48 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-bold outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50"
              />
           </div>
           <button 
              onClick={() => window.location.href = "/dictionary"}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
           >
              <Plus size={16} strokeWidth={3} />
              ĐÓNG GÓP MỚI
           </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {contributions.map((item, index) => (
          <ContributionCard key={item.id} item={item} index={index} />
        ))}
      </div>
      
      {/* Stats Summary - Optional SaaS detail */}
      <div className="mt-12 rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl overflow-hidden relative group">
         <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
               <h4 className="text-lg font-black text-blue-400 uppercase tracking-widest">Thống kê cá nhân</h4>
               <p className="text-slate-400 text-sm mt-1">Cảm ơn bạn đã đồng hành cùng cộng đồng WeHear.</p>
            </div>
            <div className="flex gap-12">
               <div className="text-center">
                  <div className="text-3xl font-black">{contributions.length}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Đã đóng góp</div>
               </div>
               <div className="text-center">
                  <div className="text-3xl font-black text-emerald-400">
                    {contributions.filter(c => c.status === 'APPROVED').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Được chấp nhận</div>
               </div>
               <div className="text-center">
                  <div className="text-3xl font-black text-amber-400">
                    {contributions.filter(c => c.status === 'PENDING').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Đang chờ</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
