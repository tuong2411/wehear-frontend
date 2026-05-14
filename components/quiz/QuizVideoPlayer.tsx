"use client";

import { useState, useRef, useEffect } from "react";
import { Video, Play, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizVideoPlayerProps {
  videoUrl: string;
  className?: string;
  hideAnswer?: boolean; // Mặc định là true để che chữ
}

export default function QuizVideoPlayer({ 
  videoUrl, 
  className = "", 
  hideAnswer = true 
}: QuizVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state khi đổi videoUrl
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [videoUrl]);

  return (
    <div className={`relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-100 group ${className}`}>
      
      {/* 1. Trình phát Video chính */}
      {!hasError ? (
        <video
          key={videoUrl}
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50">
          <AlertCircle size={48} className="mb-4 text-rose-400 opacity-50" />
          <p className="font-black text-slate-400 text-sm">Không thể tải video bài tập</p>
        </div>
      )}

      {/* 2. OVERLAY CHE CHỮ PHIÊN DỊCH (Góc trên bên phải) */}
      {hideAnswer && !isLoading && !hasError && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 w-1/4 h-1/6 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center z-10 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Đang kiểm tra</span>
          </div>
        </motion.div>
      )}

      {/* 3. Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900 flex items-center justify-center z-20"
          >
            <Loader2 size={40} className="text-blue-500 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Decorative Play Icon Overlay */}
      <div className="absolute bottom-6 right-6 bg-black/20 backdrop-blur-md p-3 rounded-2xl pointer-events-none">
        <Play size={20} className="text-white fill-white opacity-50" />
      </div>
    </div>
  );
}
