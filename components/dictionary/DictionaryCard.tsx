"use client";

import { useState, useRef, useEffect } from "react";
import { SignDictionary } from "@/types/dictionary";
import { Play, MapPin, Video, X, Info, BookOpen, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DictionaryCardProps {
  item: SignDictionary;
  onEdit?: (item: SignDictionary) => void;
}

export default function DictionaryCard({ item, onEdit }: DictionaryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  
  const primaryVideo = item.media?.find(m => m.mediaType === "video" && m.isPrimary) || item.media?.[0];

  const handleEditClick = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      toast.error("Vui lòng đăng nhập để góp ý chỉnh sửa.");
      router.push("/login?redirect=/dictionary");
      return;
    }
    if (onEdit) {
      setIsModalOpen(false);
      onEdit(item);
    }
  };
  
  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    if (videoRef.current && !isModalOpen) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, isModalOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
        className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 transition-all hover:border-blue-500 hover:shadow-lg group"
      >
        {/* Video Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          {primaryVideo ? (
            <video 
              ref={videoRef}
              src={getFullUrl(primaryVideo.mediaUrl)}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Video className="h-10 w-10" />
            </div>
          )}

          {/* Video Overlay */}
          {!isHovered && primaryVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <div className="rounded-full bg-white/30 p-2 backdrop-blur-sm">
                  <Play className="h-6 w-6 text-white fill-current" />
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
              Click xem chi tiết
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {item.signWord}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <MapPin className="h-4 w-4 text-blue-500" />
            {item.region || "Toàn quốc"}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-slate-500 backdrop-blur hover:bg-white hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Modal Video Section */}
                <div className="w-full md:w-3/5 bg-slate-900 aspect-video md:aspect-auto flex items-center justify-center">
                  {primaryVideo ? (
                    <video 
                      ref={modalVideoRef}
                      src={getFullUrl(primaryVideo.mediaUrl)}
                      className="h-full w-full object-contain"
                      controls
                      autoPlay
                      loop
                    />
                  ) : (
                    <Video className="h-20 w-20 text-slate-700" />
                  )}
                </div>

                {/* Modal Info Section */}
                <div className="w-full md:w-2/5 p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                  <div className="mb-6">
                    <span className="inline-block rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                      Từ điển ký hiệu
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900">{item.signWord}</h2>
                    <div className="mt-2 flex items-center gap-2 text-slate-500 font-medium">
                      <MapPin size={16} className="text-blue-500" />
                      {item.region || "Toàn quốc"}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
                        <BookOpen size={18} className="text-blue-500" />
                        Ý nghĩa & Định nghĩa
                      </div>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {(!item.description || item.description === "Imported from dataset") 
                          ? `Ký hiệu diễn tả từ "${item.signWord}" trong Ngôn ngữ ký hiệu Việt Nam (VSL). Đây là một phần trong bộ từ điển giúp người nghe và người khiếm thính kết nối với nhau dễ dàng hơn.`
                          : item.description}
                      </p>
                    </div>

                    {item.exampleSentence ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
                          <Info size={18} className="text-blue-500" />
                          Câu ví dụ
                        </div>
                        <p className="text-slate-600 italic border-l-4 border-blue-200 pl-4 py-1">
                          "{item.exampleSentence}"
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-amber-50 p-4 border border-amber-100/50">
                        <p className="text-amber-700 text-xs font-medium flex items-center gap-2">
                          <Info size={14} />
                          Hiện tại chưa có câu ví dụ cụ thể cho từ này.
                        </p>
                      </div>
                    )}

                    <div className="pt-4 flex flex-wrap gap-3">
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                          Mã: {item.labelCode}
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                          Độ khó: {item.difficultyLevel}
                        </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={handleEditClick}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white hover:bg-slate-800 transition-all active:scale-95"
                      >
                        <Edit3 size={18} />
                        Góp ý chỉnh sửa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
