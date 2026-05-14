"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  Video, 
  X, 
  FileVideo, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  BrainCircuit,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function UploadTranslate() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("video/")) {
        toast.error("Vui lòng chọn tệp video!");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith("video/")) {
        toast.error("Vui lòng chọn tệp video!");
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
    }
  };

  const handleTranslate = async () => {
    if (!file) return;

    setIsUploading(true);
    // Giả lập quá trình tải lên và phân tích bằng AI
    setTimeout(() => {
      setIsUploading(false);
      setIsAnalyzing(true);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setResult("Xin chào, tôi tên là Tuấn. Rất vui được gặp bạn!");
        toast.success("Phân tích video thành công!");
      }, 3000);
    }, 2000);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Upload Box */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
             <Video size={24} className="text-blue-600" /> Tải video ký hiệu
          </h3>
          
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative aspect-square rounded-[48px] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
              file ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            {preview ? (
              <div className="relative w-full h-full group">
                <video src={preview} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                    onClick={clearFile}
                    className="p-4 bg-rose-500 text-white rounded-3xl shadow-xl transform transition-transform hover:scale-110"
                   >
                     <X size={24} />
                   </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10 flex flex-col items-center gap-6">
                 <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shadow-sm">
                    <Upload size={32} />
                 </div>
                 <div>
                    <p className="text-lg font-black text-slate-900">Kéo thả video vào đây</p>
                    <p className="text-sm font-bold text-slate-400 mt-2">Hỗ trợ MP4, MOV, AVI (Tối đa 50MB)</p>
                 </div>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/50"
                 >
                   Chọn từ máy tính
                 </button>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
          </div>

          <button 
            disabled={!file || isUploading || isAnalyzing}
            onClick={handleTranslate}
            className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isUploading ? <><Loader2 className="animate-spin" /> Đang tải lên...</> : 
             isAnalyzing ? <><Loader2 className="animate-spin" /> AI đang phân tích...</> : 
             <><BrainCircuit size={24} /> Bắt đầu dịch video</>}
          </button>
        </div>

        {/* Results Box */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
             <MessageSquare size={24} className="text-indigo-600" /> Kết quả dịch thuật
          </h3>

          <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 h-full min-h-[400px] flex flex-col">
             <AnimatePresence mode="wait">
               {result ? (
                 <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 space-y-8"
                 >
                    <div className="flex items-center gap-3 text-emerald-500">
                       <CheckCircle2 size={24} />
                       <span className="text-xs font-black uppercase tracking-widest">Phân tích hoàn tất</span>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                       <p className="text-2xl font-black text-slate-900 leading-tight">
                         "{result}"
                       </p>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Độ tin cậy</p>
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[94%] rounded-full shadow-sm"></div>
                       </div>
                       <div className="flex justify-between mt-2">
                          <span className="text-[10px] font-black text-emerald-600">94.2% CHÍNH XÁC</span>
                          <span className="text-[10px] font-black text-slate-400">AI MODEL V2.5</span>
                       </div>
                    </div>
                 </motion.div>
               ) : isAnalyzing || isUploading ? (
                 <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-8 text-center"
                 >
                    <div className="relative">
                       <div className="w-32 h-32 border-8 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <BrainCircuit size={40} className="text-blue-500 animate-pulse" />
                       </div>
                    </div>
                    <div>
                       <p className="text-xl font-black text-slate-900">AI đang xử lý video</p>
                       <p className="text-sm font-bold text-slate-400 mt-2 max-w-[240px]">
                          Chúng tôi đang phân tích các khung hình và chuyển động để dịch sang văn bản...
                       </p>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-6 text-center opacity-30"
                 >
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                       <AlertCircle size={32} className="text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-400 max-w-[200px]">
                       Kết quả dịch video sẽ hiển thị tại đây
                    </p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
