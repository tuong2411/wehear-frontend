"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, ArrowLeft, LayoutGrid, Globe, 
  Book, Info, Video, Plus, X, Eye, 
  CheckCircle2, MapPin, Play, Volume2, 
  Share2, Bookmark, Loader2, ChevronRight,
  Activity
} from "lucide-react";
import { dictionaryService } from "@/services/dictionaryService";
import { SignDictionary } from "@/types/dictionary";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function NewDictionaryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  
  const [formData, setFormData] = useState<Partial<SignDictionary>>({
    signWord: "",
    labelCode: "",
    description: "",
    region: "Toàn quốc",
    difficultyLevel: "Dễ",
    exampleSentence: "",
    isActive: true
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Vui lòng chọn một file video!");
        return;
      }
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    if (!formData.signWord || !formData.labelCode) {
      toast.error("Vui lòng nhập Từ vựng và Mã nhãn");
      return false;
    }
    if (!videoFile) {
      toast.error("Vui lòng chọn video minh họa");
      return false;
    }
    return true;
  };

  const handleGoToPreview = () => {
    if (validateForm()) {
      setIsPreviewMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Đang khởi tạo từ vựng...");
    try {
      // 1. Tạo thông tin cơ bản và lấy ID
      const newSignId = await dictionaryService.createSign(formData);
      
      if (!newSignId || typeof newSignId !== 'number') {
        throw new Error("Không nhận được ID từ hệ thống");
      }

      toast.loading("Đang tải lên video minh họa...", { id: toastId });
      
      // 2. Tải lên video nếu có
      if (videoFile) {
        await dictionaryService.uploadMedia(newSignId, videoFile, "VIDEO");
      }
      
      toast.success("Tạo từ vựng mới thành công!", { id: toastId });
      router.push("/admin/dictionary");
      
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage = error.response?.data || error.message || "Lưu từ vựng thất bại";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // UI cho trang Preview
  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-slate-50 pb-32 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-10">
            <button 
              onClick={() => setIsPreviewMode(false)} 
              className="flex items-center gap-3 text-slate-500 font-bold hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={18} /> Quay lại chỉnh sửa
            </button>
            <div className="flex items-center gap-4">
               <span className="text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-full border border-amber-100 flex items-center gap-2">
                  <Eye size={14} /> Chế độ xem trước
               </span>
               <button 
                 onClick={handleConfirmSave}
                 disabled={saving}
                 className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
               >
                 {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Xác nhận & Lưu</>}
               </button>
            </div>
          </div>

          <div className="bg-white rounded-[50px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Video Player Preview */}
                <div className="lg:col-span-7">
                  <div className="relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-50">
                    <video src={videoPreviewUrl} className="w-full h-full object-contain" controls autoPlay loop />
                    <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/20">
                      <MapPin size={14} /> {formData.region}
                    </div>
                  </div>
                </div>

                {/* Info Preview */}
                <div className="lg:col-span-5 space-y-8">
                   <div>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        Xem trước hiển thị
                      </span>
                      <h1 className="text-5xl font-black text-slate-900 tracking-tight mt-4 leading-none">{formData.signWord}</h1>
                      <div className="flex items-center gap-3 mt-4">
                         <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Hệ thống xác thực
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <Book size={14} /> Ý nghĩa & Mô tả
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          {formData.description || "Chưa có mô tả cho từ vựng này."}
                        </p>
                      </div>

                      {formData.exampleSentence && (
                        <div className="p-6 border-l-4 border-blue-600 bg-white shadow-sm rounded-r-3xl">
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Info size={14} /> Câu ví dụ
                           </h3>
                           <p className="text-slate-700 italic text-lg leading-relaxed">"{formData.exampleSentence}"</p>
                        </div>
                      )}
                   </div>

                   <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Độ khó</p>
                        <p className="font-bold text-slate-800">{formData.difficultyLevel}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mã Nhãn</p>
                        <p className="font-bold text-slate-800 font-mono">{formData.labelCode}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 pb-32 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Hidden File Input */}
        <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />

        {/* Top Actions */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 text-slate-500 font-bold hover:text-slate-900 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
               <ArrowLeft size={18} />
            </div>
            Quay lại
          </button>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={handleGoToPreview}
               className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
             >
               <span>Tiếp theo: Xem trước</span>
               <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                     <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thông tin ký hiệu</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Bước 1: Nhập liệu thông tin cơ bản</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Từ vựng ký hiệu <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="VD: Xin chào, Cảm ơn..."
                      value={formData.signWord}
                      onChange={(e) => setFormData({...formData, signWord: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Mã nhãn <span className="text-rose-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="xin_chao"
                        value={formData.labelCode}
                        onChange={(e) => setFormData({...formData, labelCode: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-mono font-bold text-slate-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Vùng miền</label>
                      <select 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none"
                      >
                        <option value="Toàn quốc">Toàn quốc</option>
                        <option value="Miền Bắc">Miền Bắc</option>
                        <option value="Miền Trung">Miền Trung</option>
                        <option value="Miền Nam">Miền Nam</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Mô tả & Câu ví dụ</label>
                    <textarea 
                      rows={3}
                      placeholder="Mô tả ý nghĩa..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium text-slate-600 outline-none mb-4"
                    />
                    <input 
                      type="text"
                      placeholder="Nhập câu ví dụ..."
                      value={formData.exampleSentence}
                      onChange={(e) => setFormData({...formData, exampleSentence: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium italic text-slate-600 outline-none"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Video Upload Section */}
          <div className="lg:col-span-5 space-y-8">
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 flex items-center gap-3">
                    <Video size={20} className="text-blue-500" /> Video minh họa
                  </h3>
                  {videoFile && (
                    <button onClick={removeVideo} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
                
                {videoFile ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-lg border border-slate-100">
                      <video src={videoPreviewUrl} className="w-full h-full object-contain" controls />
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                       <CheckCircle2 className="text-emerald-500" size={20} />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-emerald-900 truncate">{videoFile.name}</p>
                          <p className="text-[10px] font-black text-emerald-600 uppercase">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-20 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">
                       <Plus size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-600">Nhấn để tải Video</p>
                      <p className="text-xs font-medium text-slate-400 mt-1">Hỗ trợ định dạng MP4, MOV, WebM</p>
                    </div>
                  </button>
                )}
             </div>

             <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                   <Activity size={24} />
                </div>
                <h3 className="font-black text-indigo-900 tracking-tight">Quy trình</h3>
                <div className="space-y-3">
                   {[
                     "Nhập thông tin cơ bản",
                     "Tải lên video ký hiệu",
                     "Kiểm tra ở chế độ Preview",
                     "Lưu vào hệ thống"
                   ].map((step, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-600">
                           {i + 1}
                        </div>
                        <span className="text-xs font-bold text-indigo-700/80">{step}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

