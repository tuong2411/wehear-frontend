"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  History,
  Info,
  ChevronRight,
  HelpCircle,
  Video
} from "lucide-react";
import { dictionaryService } from "@/services/dictionaryService";
import { SignDictionary } from "@/types/dictionary";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function QuickTranslate() {
  const [inputText, setInputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedWords, setTranslatedWords] = useState<SignDictionary[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Tách từ từ câu nhập vào
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setTranslatedWords([]);
    setCurrentWordIndex(0);
    setIsPlaying(false);

    // Lưu vào lịch sử
    if (!history.includes(inputText.trim())) {
      setHistory(prev => [inputText.trim(), ...prev].slice(0, 5));
    }

    try {
      // 1. Chuẩn hóa câu: xóa dấu câu, chuyển về chữ thường
      const cleanText = inputText.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");
      
      const words = cleanText.split(" ");
      const foundSigns: SignDictionary[] = [];

      // 2. Tra cứu từng từ trong từ điển
      for (const word of words) {
        if (!word) continue;
        
        // Tìm kiếm từ trong từ điển
        const response = await dictionaryService.getAllSigns(0, 5, word, "all");
        
        // Tìm từ khớp chính xác nhất
        const exactMatch = response.items.find(
          item => item.signWord.toLowerCase() === word
        );

        if (exactMatch && exactMatch.media && exactMatch.media.length > 0) {
          foundSigns.push(exactMatch);
        } else {
          // 3. Nếu không thấy từ, thực hiện "đánh vần" từng chữ cái
          // (Giả định từ điển có các ký hiệu cho chữ cái a, b, c...)
          const letters = word.split("");
          for (const letter of letters) {
            const letterResponse = await dictionaryService.getAllSigns(0, 5, letter, "all");
            const letterMatch = letterResponse.items.find(
              item => item.signWord.toLowerCase() === letter
            );
            if (letterMatch && letterMatch.media && letterMatch.media.length > 0) {
              foundSigns.push(letterMatch);
            }
          }
        }
      }

      if (foundSigns.length === 0) {
        toast.error("Không tìm thấy ký hiệu phù hợp cho câu này.");
      } else {
        setTranslatedWords(foundSigns);
        setIsPlaying(true);
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối đến hệ thống dịch.");
    } finally {
      setIsTranslating(false);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    return `${baseUrl}${url}`;
  };

  const handleVideoEnd = () => {
    if (currentWordIndex < translatedWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentWordIndex]);

  const isVideoMedia = (mediaType?: string) => mediaType?.toLowerCase() === "video";
  const currentMedia = translatedWords[currentWordIndex]?.media?.find(m => isVideoMedia(m.mediaType) && m.isPrimary)
    || translatedWords[currentWordIndex]?.media?.find(m => isVideoMedia(m.mediaType))
    || translatedWords[currentWordIndex]?.media?.[0];

  return (
    <div className="space-y-10">
      {/* Input Section */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-6">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập câu bạn muốn dịch sang ký hiệu (VD: Xin chào bạn)..."
              className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[160px] outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
            />
            <div className="absolute bottom-6 right-6 flex items-center gap-3">
               <button 
                 onClick={() => setInputText("")}
                 className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
               >
                 <Trash2 size={24} />
               </button>
               <button 
                 onClick={handleTranslate}
                 disabled={isTranslating || !inputText.trim()}
                 className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
               >
                 {isTranslating ? "Đang dịch..." : <><Search size={22} /> Dịch ngay</>}
               </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                <History size={14} /> Gần đây:
             </div>
             {history.map((h, i) => (
               <button 
                key={i}
                onClick={() => setInputText(h)}
                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
               >
                 {h}
               </button>
             ))}
             {history.length === 0 && <span className="text-xs text-slate-300 italic font-medium">Chưa có lịch sử dịch</span>}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Video Player */}
        <div className="lg:col-span-8">
           <div className="bg-slate-900 rounded-[48px] overflow-hidden aspect-video relative group shadow-2xl ring-8 ring-white">
              {translatedWords.length > 0 && currentMedia ? (
                <>
                  <video 
                    ref={videoRef}
                    key={currentMedia.id}
                    src={getFullUrl(currentMedia.mediaUrl)}
                    className="w-full h-full object-contain"
                    onEnded={handleVideoEnd}
                    playsInline
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <button onClick={() => setCurrentWordIndex(prev => Math.max(0, prev - 1))} className="text-white hover:text-blue-400 transition-colors">
                               <SkipBack size={28} fill="currentColor" />
                            </button>
                            <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 hover:scale-110 transition-transform">
                               {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
                            </button>
                            <button onClick={() => setCurrentWordIndex(prev => Math.min(translatedWords.length - 1, prev + 1))} className="text-white hover:text-blue-400 transition-colors">
                               <SkipForward size={28} fill="currentColor" />
                            </button>
                         </div>
                         
                         <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                            <p className="text-white font-black text-xl tracking-tight">
                               {translatedWords[currentWordIndex]?.signWord}
                            </p>
                         </div>
                      </div>
                  </div>

                  {/* Progress Dots */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2">
                     {translatedWords.map((_, i) => (
                       <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentWordIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`}
                       />
                     ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-6">
                  <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                    <Video size={40} className="text-slate-700" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-500">Sẵn sàng phiên dịch</p>
                    <p className="text-sm font-bold text-slate-700 mt-2">Nhập văn bản phía trên và nhấn "Dịch ngay"</p>
                  </div>
                </div>
              )}

              {isTranslating && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white gap-6">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xl font-black tracking-widest animate-pulse">ĐANG PHÂN TÍCH...</p>
                </div>
              )}
           </div>
        </div>

        {/* Word Sequence List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                   <ChevronRight size={24} className="text-blue-600" /> Trình tự ký hiệu
                 </h3>
                 <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">
                   {translatedWords.length} TỪ
                 </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                 {translatedWords.map((word, i) => (
                   <button
                    key={i}
                    onClick={() => {
                      setCurrentWordIndex(i);
                      setIsPlaying(true);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border ${
                      i === currentWordIndex 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]" 
                      : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                   >
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                       i === currentWordIndex ? "bg-white/20" : "bg-white text-slate-300"
                     }`}>
                        {(i + 1).toString().padStart(2, '0')}
                     </div>
                     <span className="font-black text-lg text-left flex-1">{word.signWord}</span>
                     {i === currentWordIndex && isPlaying && (
                       <div className="flex gap-1 items-end h-4">
                          <div className="w-1 bg-white animate-music-bar-1 rounded-full"></div>
                          <div className="w-1 bg-white animate-music-bar-2 rounded-full"></div>
                          <div className="w-1 bg-white animate-music-bar-3 rounded-full"></div>
                       </div>
                     )}
                   </button>
                 ))}

                 {translatedWords.length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                      <HelpCircle size={48} />
                      <p className="font-bold text-center px-6">Danh sách từ sẽ hiển thị tại đây sau khi dịch</p>
                   </div>
                 )}
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                 <div className="flex items-center gap-2 text-amber-700 font-black text-xs">
                    <Info size={16} /> LƯU Ý
                 </div>
                 <p className="text-[11px] text-amber-600 font-bold leading-relaxed">
                   Hệ thống đang sử dụng dữ liệu từ điển. Nếu không tìm thấy từ nguyên câu, chúng tôi sẽ thực hiện đánh vần từng chữ cái.
                 </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
