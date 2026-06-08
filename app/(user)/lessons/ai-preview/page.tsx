"use client";

import { useEffect, useState, useRef } from "react";
import { Lesson } from "@/types/lesson";
import { Sparkles, ArrowLeft, Play, MapPin, CheckCircle2, Video, BookmarkPlus, Loader2, BookOpen, Clock, Layers, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function AIPreviewPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeSignIndex, setActiveSignIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("ai_lesson_preview");
    if (data) {
      setLesson(JSON.parse(data));
    } else {
      router.push("/lessons");
    }
  }, [router]);

  if (!lesson) return null;

  const currentSign = lesson.signs?.[activeSignIndex];
  
  const getPrimaryVideo = () => {
    if (!currentSign || !currentSign.media || currentSign.media.length === 0) return null;
    const isVideoMedia = (mediaType?: string) => mediaType?.toLowerCase() === "video";
    const primary = currentSign.media.find(m => isVideoMedia(m.mediaType) && m.isPrimary);
    return primary || currentSign.media.find(m => isVideoMedia(m.mediaType)) || currentSign.media[0];
  };

  const primaryVideo = getPrimaryVideo();

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    baseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleSaveLesson = async () => {
    try {
      setIsSaving(true);
      // Giả định API /lessons nhận object Lesson để tạo mới
      await api.post("/lessons", lesson);
      setIsSaved(true);
      // Có thể thêm toast thông báo ở đây
    } catch (error) {
      console.error("Failed to save lesson:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 font-sans">
      {/* Immersive Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-slate-500 font-bold hover:text-slate-900 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
               <ArrowLeft size={18} />
            </div>
            Quay lại
          </button>
          
          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
            <Sparkles size={18} className="text-blue-600 animate-pulse" />
            <span className="text-sm font-black text-blue-700 tracking-tight">Lộ trình học AI thông minh</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSaveLesson}
              disabled={isSaving || isSaved}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black transition-all shadow-sm ${
                isSaved 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                : "bg-white text-slate-900 border border-slate-200 hover:border-blue-500 hover:text-blue-600 active:scale-95"
              }`}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isSaved ? <CheckCircle2 size={18} /> : <BookmarkPlus size={18} />)}
              {isSaved ? "Đã lưu" : "Lưu vào thư viện"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-blue-500/5 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-100">
                {primaryVideo ? (
                  <video
                    key={primaryVideo.mediaUrl}
                    ref={videoRef}
                    src={getFullUrl(primaryVideo.mediaUrl)}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Video size={64} className="mb-4 opacity-10" />
                    <p className="font-bold">Không tìm thấy video hướng dẫn</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden"
            >
               {/* Background accent */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
               
               <div className="relative">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">{currentSign?.signWord}</h1>
                    <div className="flex gap-2">
                       <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                         {currentSign?.region || "Toàn quốc"}
                       </span>
                       <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                         {currentSign?.difficultyLevel || "BASIC"}
                       </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Ý nghĩa & Cách thực hiện</h3>
                       <p className="text-slate-600 leading-relaxed text-xl font-medium">
                          {currentSign?.description || "Chưa có mô tả chi tiết cho ký hiệu này. Hãy quan sát kỹ video để nắm bắt các cử chỉ tay và biểu cảm khuôn mặt."}
                       </p>
                    </div>
                    
                    {currentSign?.exampleSentence && (
                      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Ví dụ minh họa</h3>
                         <p className="text-slate-700 italic font-bold">"{currentSign.exampleSentence}"</p>
                      </div>
                    )}
                  </div>
               </div>
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8 sticky top-32">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 ring-1 ring-slate-900/5"
            >
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-slate-900">Nội dung bài học</h2>
                 <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">
                    {lesson.signs?.length}
                 </span>
              </div>

              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-3 custom-scrollbar">
                {lesson.signs?.map((sign, index) => (
                  <button
                    key={`${sign.id}-${index}`}
                    onClick={() => setActiveSignIndex(index)}
                    className={`w-full group flex items-center gap-5 p-5 rounded-[24px] transition-all text-left border ${
                      activeSignIndex === index 
                        ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20" 
                        : "bg-white border-slate-50 hover:border-blue-200 hover:bg-blue-50/30 text-slate-600"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${
                      activeSignIndex === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-lg group-hover:translate-x-1 transition-transform">{sign.signWord}</div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${activeSignIndex === index ? "text-slate-400" : "text-slate-300"}`}>
                        {sign.region || "Toàn quốc"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-10 space-y-4">
                <Link 
                   href="/lessons/ai-preview/quiz"
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[24px] font-black transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group active:scale-95"
                >
                  Bắt đầu kiểm tra
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center justify-center gap-8 py-2">
                   <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-slate-900">15p</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời lượng</span>
                   </div>
                   <div className="w-px h-6 bg-slate-100" />
                   <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-slate-900">Dynamic</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cấp độ</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
