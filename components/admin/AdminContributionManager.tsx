"use client";

import { useEffect, useState } from "react";
import { contributionService } from "@/services/contributionService";
import { dictionaryService } from "@/services/dictionaryService";
import { DictionaryContribution } from "@/types/contribution";
import { SignDictionary } from "@/types/dictionary";
import { Check, X, Video, Info, User, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminContributionManager() {
  const [contributions, setContributions] = useState<DictionaryContribution[]>([]);
  const [selectedItem, setSelectedItem] = useState<DictionaryContribution | null>(null);
  const [existingSign, setExistingSign] = useState<SignDictionary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    if (selectedItem && selectedItem.type === 'EDIT' && selectedItem.targetDictionaryId) {
      fetchExistingSign(selectedItem.targetDictionaryId);
    } else {
      setExistingSign(null);
    }
  }, [selectedItem]);

  const fetchPending = async () => {
    try {
      const response = await contributionService.getPendingContributions();
      if (response.success) {
        setContributions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending contributions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingSign = async (id: number) => {
    try {
      const sign = await dictionaryService.getSignById(id);
      setExistingSign(sign);
    } catch (error) {
      console.error("Failed to fetch existing sign", error);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
      ? process.env.NEXT_PUBLIC_API_BASE_URL.replace("/api", "") 
      : "http://localhost:8668";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      await contributionService.approveContribution(selectedItem.id!, adminNote);
      toast.success("Đã duyệt đóng góp!");
      setContributions(contributions.filter(c => c.id !== selectedItem.id));
      setSelectedItem(null);
      setAdminNote("");
    } catch (error: any) {
      toast.error(error.message || "Duyệt thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!adminNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    setIsProcessing(true);
    try {
      await contributionService.rejectContribution(selectedItem.id!, adminNote);
      toast.success(" Đã từ chối đóng góp.");
      setContributions(contributions.filter(c => c.id !== selectedItem.id));
      setSelectedItem(null);
      setAdminNote("");
    } catch (error: any) {
      toast.error(error.message || "Thao tác thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to get primary video from SignDictionary
  const getExistingVideoUrl = (sign: SignDictionary) => {
    const primary = sign.media?.find(m => m.isPrimary) || sign.media?.[0];
    return primary ? getFullUrl(primary.mediaUrl) : "";
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      {/* Sidebar - List */}
      <div className="w-1/4 flex flex-col gap-4 overflow-y-auto pr-2">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          Hàng chờ duyệt
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">{contributions.length}</span>
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
             {[1,2,3,4].map(i => <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : contributions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
             Duyệt hết rồi! Nghỉ thôi Admin.
          </div>
        ) : (
          contributions.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedItem(c)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                selectedItem?.id === c.id ? "border-blue-500 bg-blue-50/50 shadow-md" : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-slate-800">{c.word}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'NEW' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                  {c.type === 'NEW' ? 'Mới' : 'Sửa'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
            </div>
          ))
        )}
      </div>

      {/* Main Detail View */}
      <div className="flex-1 rounded-3xl bg-white border border-slate-100 overflow-hidden flex flex-col shadow-sm">
        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div 
              key={selectedItem.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Video Panel(s) */}
                <div className={`flex bg-slate-900 relative ${existingSign ? 'w-2/3' : 'w-1/2'}`}>
                   {existingSign && (
                     <div className="flex-1 border-r border-white/10 relative">
                        <video 
                          key={getExistingVideoUrl(existingSign)}
                          src={getExistingVideoUrl(existingSign)} 
                          className="h-full w-full object-contain" 
                          controls 
                        />
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur rounded-lg px-3 py-1 text-white text-[10px] font-bold uppercase">
                           Video hiện tại
                        </div>
                     </div>
                   )}
                   <div className="flex-1 relative">
                      <video 
                        key={getFullUrl(selectedItem.videoUrl)}
                        src={getFullUrl(selectedItem.videoUrl)} 
                        className="h-full w-full object-contain" 
                        controls 
                        autoPlay
                      />
                      <div className="absolute top-4 left-4 bg-blue-600/80 backdrop-blur rounded-lg px-3 py-1 text-white text-[10px] font-bold uppercase">
                         Video đóng góp
                      </div>
                   </div>
                   
                   {existingSign && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full bg-blue-600 p-2 text-white shadow-xl shadow-blue-900/50">
                        <ArrowRight size={20} />
                     </div>
                   )}
                </div>

                {/* Info Panel */}
                <div className={`${existingSign ? 'w-1/3' : 'w-1/2'} p-6 overflow-y-auto border-l border-slate-100`}>
                   <div className="mb-6">
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                         <User size={12} /> User #{selectedItem.userId} • <Calendar size={12} /> {new Date(selectedItem.createdAt!).toLocaleDateString('vi-VN')}
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{selectedItem.word}</h2>
                   </div>

                   <div className="space-y-6">
                      <section>
                         <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info size={12} /> Mô tả thực hiện
                         </h4>
                         <div className="space-y-3">
                           {existingSign && (
                             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 block mb-1">HIỆN TẠI:</span>
                                <p className="text-xs text-slate-400 line-through">{existingSign.description}</p>
                             </div>
                           )}
                           <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
                              {existingSign && <span className="text-[10px] font-bold text-blue-600 block mb-1">ĐỀ XUẤT:</span>}
                              <p className="text-sm text-slate-700 leading-relaxed">{selectedItem.description}</p>
                           </div>
                         </div>
                      </section>

                      {selectedItem.example && (
                        <section>
                           <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Ví dụ minh họa</h4>
                           <div className="space-y-3">
                              {existingSign && existingSign.exampleSentence && (
                                <p className="text-xs text-slate-400 line-through pl-4 border-l-2 border-slate-100">"{existingSign.exampleSentence}"</p>
                              )}
                              <p className="text-sm text-slate-600 italic border-l-4 border-blue-100 pl-4 py-1">"{selectedItem.example}"</p>
                           </div>
                        </section>
                      )}

                      <section className="pt-6 border-t border-slate-100">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                            <MessageSquare size={12} /> Ghi chú phản hồi cho User
                         </label>
                         <textarea 
                           value={adminNote}
                           onChange={(e) => setAdminNote(e.target.value)}
                           className="w-full rounded-2xl border border-slate-200 p-4 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50/50 transition-all text-sm"
                           placeholder="Nhập lý do duyệt hoặc từ chối..."
                           rows={3}
                         />
                      </section>
                   </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                 <button
                   onClick={handleReject}
                   disabled={isProcessing}
                   className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                 >
                   <X size={20} /> Từ chối
                 </button>
                 <button
                   onClick={handleApprove}
                   disabled={isProcessing}
                   className="flex items-center gap-2 px-10 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                 >
                   {isProcessing ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Check size={20} /> Duyệt ngay</>}
                 </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
               <div className="rounded-full bg-slate-50 p-10">
                  <Video size={100} strokeWidth={1} />
               </div>
               <p className="font-bold text-lg">Chọn một bản đóng góp để xem chi tiết</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
