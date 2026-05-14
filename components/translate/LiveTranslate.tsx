"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Trash2, 
  Play, 
  Settings,
  MoreHorizontal,
  BrainCircuit,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function LiveTranslate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock function để mô phỏng nhận diện từ AI
  // Trong thực tế, bạn sẽ nhận dữ liệu từ WebSocket hoặc API của bên AI
  const simulateAIRecognition = () => {
    const mockPhrases = [
      "Xin chào", 
      "Tôi tên là", 
      "Người khiếm thính", 
      "Rất vui được gặp bạn", 
      "Cảm ơn bạn rất nhiều"
    ];
    
    let phraseIndex = 0;
    const interval = setInterval(() => {
      if (!isActive) {
        clearInterval(interval);
        return;
      }

      setIsAnalyzing(true);
      const nextWord = mockPhrases[phraseIndex % mockPhrases.length];
      setCurrentResult(nextWord);
      
      // Sau một lúc nhận diện xong 1 cụm từ
      setTimeout(() => {
        setTranscript(prev => [...prev, nextWord].slice(-10)); // Giữ 10 câu gần nhất
        speak(nextWord); // Phát âm thanh
        setCurrentResult("");
        setIsAnalyzing(false);
        phraseIndex++;
      }, 2000);

    }, 5000);

    return interval;
  };

  // Hàm phát âm thanh (Text-to-Speech)
  const speak = (text: string) => {
    if (!isAudioEnabled) return;
    
    // Hủy các câu đang phát dở
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Quản lý Camera
  const toggleCamera = async () => {
    if (isActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, facingMode: "user" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsActive(true);
        toast.success("Đã kết nối Camera và AI engine");
      } catch (err) {
        toast.error("Không thể truy cập Camera. Vui lòng kiểm tra quyền truy cập.");
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = simulateAIRecognition();
    }
    return () => {
      if (interval) clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [isActive]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Camera Viewport */}
        <div className="lg:col-span-8 space-y-6">
           <div className="relative bg-slate-900 rounded-[48px] overflow-hidden aspect-video shadow-2xl ring-8 ring-white group">
              {/* Giữ video luôn trong DOM để ref không bị null */}
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover scale-x-[-1] ${!isActive ? 'hidden' : 'block'}`}
              />

              {!isActive && (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-6">
                   <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                      <Camera size={40} className="text-slate-600" />
                   </div>
                   <div className="text-center">
                      <p className="text-xl font-black text-slate-400">Camera đang tắt</p>
                      <p className="text-sm font-bold text-slate-600 mt-2">Nhấn "Bắt đầu dịch" để kích hoạt AI</p>
                   </div>
                </div>
              )}

              {/* Real-time Subtitle Overlay */}
              <AnimatePresence>
                {currentResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
                  >
                    <div className="bg-black/40 backdrop-blur-xl px-10 py-5 rounded-[32px] border border-white/20 shadow-2xl">
                       <p className="text-3xl md:text-4xl font-black text-white tracking-tight text-center">
                          {currentResult}
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Indicators */}
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${isActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/10 border-white/10 text-white/50'}`}>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{isActive ? 'Live' : 'Offline'}</span>
                 </div>
                 {isAnalyzing && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full backdrop-blur-md text-blue-400">
                      <BrainCircuit size={14} className="animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Processing</span>
                   </div>
                 )}
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-8 right-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`p-4 rounded-3xl transition-all ${isAudioEnabled ? 'bg-white text-slate-900' : 'bg-rose-500 text-white'}`}
                  >
                    {isAudioEnabled ? <Volume2 size={24} /> : <MicOff size={24} />}
                  </button>
                  <button className="p-4 bg-white/20 backdrop-blur-md text-white rounded-3xl hover:bg-white/30 transition-all">
                    <Settings size={24} />
                  </button>
              </div>
           </div>

           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-6">
                 <button 
                  onClick={toggleCamera}
                  className={`flex items-center gap-3 px-10 py-5 rounded-[32px] font-black text-lg transition-all shadow-2xl ${
                    isActive 
                    ? "bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600" 
                    : "bg-slate-900 text-white shadow-slate-200 hover:bg-blue-600"
                  }`}
                 >
                   {isActive ? <><CameraOff size={24} /> Dừng phiên dịch</> : <><Play size={24} /> Bắt đầu dịch</>}
                 </button>
                 
                 <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                       <Mic size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Âm thanh đầu ra</p>
                       <p className="text-sm font-bold text-slate-700">{isAudioEnabled ? 'Tự động phát âm thanh' : 'Đã tắt tiếng'}</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setTranscript([])}
                className="flex items-center gap-2 text-slate-400 font-bold hover:text-rose-500 transition-colors"
              >
                <Trash2 size={20} /> Xóa lịch sử
              </button>
           </div>
        </div>

        {/* Transcript Sidebar */}
        <div className="lg:col-span-4 h-full">
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                   <MessageSquare size={24} className="text-rose-500" /> Nhật ký hội thoại
                 </h3>
                 <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black">
                   LIVE
                 </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar flex flex-col-reverse">
                 <AnimatePresence initial={false}>
                    {transcript.slice().reverse().map((text, i) => (
                      <motion.div
                        key={transcript.length - i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 group relative"
                      >
                         <p className="font-bold text-slate-800 text-lg leading-tight pr-8">{text}</p>
                         <button 
                          onClick={() => speak(text)}
                          className="absolute top-5 right-5 text-slate-300 hover:text-blue-500 transition-colors"
                         >
                            <Volume2 size={18} />
                         </button>
                         <span className="text-[10px] font-black text-slate-300 uppercase mt-2 block tracking-tighter">
                            {new Date().toLocaleTimeString('vi-VN')} • AI RECOGNIZED
                         </span>
                      </motion.div>
                    ))}
                 </AnimatePresence>

                 {transcript.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-30">
                       <MoreHorizontal size={48} className="text-slate-400" />
                       <p className="text-sm font-bold text-slate-400">Hội thoại sẽ được ghi lại tại đây theo thời gian thực</p>
                    </div>
                 )}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50">
                 <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-3xl border border-blue-100">
                    <BrainCircuit size={24} className="text-blue-500 flex-shrink-0" />
                    <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                       Hệ thống đang sử dụng Model nhận diện ngôn ngữ ký hiệu tự nhiên (Natural Sign Language).
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
