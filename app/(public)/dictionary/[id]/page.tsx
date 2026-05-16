"use client";

export const runtime = "edge";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, BookOpen, Info, 
  Share2, Play, Volume2, Bookmark, CheckCircle2
} from "lucide-react";
import { dictionaryService } from "@/services/dictionaryService";
import { SignDictionary } from "@/types/dictionary";
import { motion } from "framer-motion";

export default function SignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [sign, setSign] = useState<SignDictionary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dictionaryService.getSignById(Number(resolvedParams.id));
        setSign(data);
      } catch (error) {
        console.error("Failed to load sign detail");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams.id]);

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
      ? process.env.NEXT_PUBLIC_API_BASE_URL.replace("/api", "") 
      : "https://wehear-backend-production.up.railway.app";
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Đang tải ký hiệu...</p>
        </div>
      </div>
    );
  }

  if (!sign) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black text-slate-900">Không tìm thấy ký hiệu này</h2>
        <button onClick={() => router.back()} className="mt-4 flex items-center gap-2 text-blue-600 font-bold">
          <ArrowLeft size={20} /> Quay lại
        </button>
      </div>
    );
  }

  const primaryVideo = sign.media?.find(m => m.mediaType === "video") || sign.media?.[0];

  return (
    <div className="bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
        {/* Breadcrumbs / Back button */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors group"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-blue-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Quay lại Từ điển
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Video Player Section */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white"
            >
              {primaryVideo ? (
                <video 
                  src={getFullUrl(primaryVideo.mediaUrl)} 
                  className="w-full h-full object-contain" 
                  controls 
                  autoPlay 
                  loop 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Play size={64} />
                </div>
              )}
              
              {/* Region Badge overlay */}
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/20">
                <MapPin size={14} />
                {sign.region || "Toàn quốc"}
              </div>
            </motion.div>

            {/* Sub-media list if any */}
            {sign.media && sign.media.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {sign.media.map((m, idx) => (
                  <div key={m.id} className="aspect-video bg-white rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-blue-400 cursor-pointer transition-all">
                     {m.mediaType === "video" ? (
                       <video src={getFullUrl(m.mediaUrl)} className="w-full h-full object-cover" />
                     ) : (
                       <img src={getFullUrl(m.mediaUrl)} className="w-full h-full object-cover" alt="Media" />
                     )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Ký hiệu Việt Nam (VSL)
                  </span>
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Share2 size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Bookmark size={20} />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                  {sign.signWord}
                </h1>
                
                <div className="flex items-center gap-4 text-slate-500 font-bold">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-xs">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Hệ thống xác thực
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-xs">
                    <Volume2 size={16} />
                    Phát âm
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest mb-3">
                    <BookOpen size={18} className="text-blue-500" /> Ý nghĩa
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {(!sign.description || sign.description === "Imported from dataset") 
                      ? `Ký hiệu này diễn tả khái niệm "${sign.signWord}" trong ngôn ngữ ký hiệu. Nó được cộng đồng người khiếm thính Việt Nam sử dụng phổ biến.`
                      : sign.description}
                  </p>
                </div>

                {sign.exampleSentence && (
                  <div className="p-6 border-l-4 border-blue-600 bg-white shadow-sm rounded-r-3xl">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest mb-3">
                      <Info size={18} className="text-blue-500" /> Câu ví dụ
                    </h3>
                    <p className="text-slate-700 italic text-lg leading-relaxed">
                      "{sign.exampleSentence}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Độ khó</p>
                  <p className="font-bold text-slate-800">{sign.difficultyLevel || "Trung bình"}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mã Nhãn</p>
                  <p className="font-bold text-slate-800 font-mono">{sign.labelCode}</p>
                </div>
              </div>
            </motion.div>

            {/* Interaction Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-xl shadow-blue-200">
              <h3 className="text-xl font-black mb-2 tracking-tight">Học cùng WeHear AI</h3>
              <p className="text-blue-100 text-sm font-medium mb-6 leading-relaxed">
                Bạn muốn kiểm tra xem mình đã làm đúng ký hiệu này chưa? Hãy thử chức năng Nhận diện AI của chúng tôi.
              </p>
              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                Bắt đầu luyện tập ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
