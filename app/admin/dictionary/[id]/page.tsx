"use client";

export const runtime = "edge";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, ArrowLeft, LayoutGrid, Globe, 
  CheckCircle2, XCircle, Info, Book, 
  Activity, Video, Image as ImageIcon, AlertCircle,
  Plus as PlusIcon, Loader2
} from "lucide-react";
import { dictionaryService } from "@/services/dictionaryService";
import { SignDictionary } from "@/types/dictionary";
import toast from "react-hot-toast";

type DictionaryMedia = NonNullable<SignDictionary["media"]>[number] & {
  type?: string;
  url?: string;
};

export default function EditDictionaryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<SignDictionary>>({
    signWord: "",
    labelCode: "",
    description: "",
    region: "Toàn quốc",
    difficultyLevel: "Dễ",
    exampleSentence: "",
    isActive: true
  });

  const fetchData = async () => {
    try {
      const data = await dictionaryService.getSignById(Number(resolvedParams.id));
      setFormData(data);
    } catch (error) {
      toast.error("Không thể tải thông tin từ vựng");
      router.push("/admin/dictionary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dictionaryService.updateSign(Number(resolvedParams.id), formData);
      toast.success("Cập nhật từ vựng thành công");
      router.push("/admin/dictionary");
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng (Video hoặc Ảnh)
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Vui lòng chọn file video hoặc hình ảnh!");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Đang tải lên media...");
    
    try {
      await dictionaryService.uploadMedia(
        Number(resolvedParams.id), 
        file, 
        isVideo ? "VIDEO" : "IMAGE"
      );
      toast.success("Tải lên media thành công", { id: toastId });
      fetchData(); // Tải lại dữ liệu để cập nhật danh sách media
    } catch (error) {
      toast.error("Tải lên thất bại", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    return `${baseUrl}${url}`;
  };

  const getMediaUrl = (media: DictionaryMedia) => media.mediaUrl || media.url || "";

  const isVideoMedia = (media: DictionaryMedia) => {
    const mediaType = (media.mediaType || media.type || "").toLowerCase();
    const mediaUrl = getMediaUrl(media).toLowerCase();

    return (
      mediaType === "video" ||
      mediaUrl.includes("/video/upload/") ||
      mediaUrl.endsWith(".mp4")
    );
  };

  const uniqueMedia = ((formData.media || []) as DictionaryMedia[]).filter(
    (item, index, self) =>
      index === self.findIndex((media) => getMediaUrl(media) === getMediaUrl(item))
  );
  const currentMedia = uniqueMedia[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/*,image/*" 
          onChange={handleFileChange}
        />

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
             <div className="hidden md:block px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest">
                Chế độ chỉnh sửa
             </div>
             <button 
               onClick={handleSubmit}
               disabled={saving || uploading}
               className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
             >
               {saving ? "Đang lưu..." : <><Save size={20} /> Lưu thay đổi</>}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                     <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thông tin cơ bản</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID Hệ thống: #{resolvedParams.id}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Từ vựng ký hiệu</label>
                    <input 
                      type="text"
                      value={formData.signWord}
                      onChange={(e) => setFormData({...formData, signWord: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Mã nhãn (Label Code)</label>
                    <input 
                      type="text"
                      value={formData.labelCode}
                      onChange={(e) => setFormData({...formData, labelCode: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-mono font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Độ khó</label>
                    <select 
                      value={formData.difficultyLevel}
                      onChange={(e) => setFormData({...formData, difficultyLevel: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none"
                    >
                      <option value="Dễ">Dễ (Easy)</option>
                      <option value="Trung bình">Trung bình (Medium)</option>
                      <option value="Khó">Khó (Hard)</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                     <Book size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chi tiết & Ví dụ</h2>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Mô tả ký hiệu</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Câu ví dụ</label>
                    <input 
                      type="text"
                      value={formData.exampleSentence}
                      onChange={(e) => setFormData({...formData, exampleSentence: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium italic text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                   <Globe size={20} className="text-emerald-500" /> Cài đặt
                </h3>
                
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Vùng miền</label>
                      <select 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 outline-none"
                      >
                        <option value="Toàn quốc">Toàn quốc</option>
                        <option value="Miền Bắc">Miền Bắc</option>
                        <option value="Miền Trung">Miền Trung</option>
                        <option value="Miền Nam">Miền Nam</option>
                      </select>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">Trạng thái hiển thị</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Hiện/Ẩn trên app</span>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                        className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                   <Video size={20} className="text-blue-500" /> Media hiện tại
                </h3>
                
                <div className="space-y-4">
                   {currentMedia ? (
                     <div key={currentMedia.id} className="relative group rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                        <div className="aspect-video bg-slate-900">
                           {isVideoMedia(currentMedia) ? (
                             <video
                               src={getFullUrl(getMediaUrl(currentMedia))}
                               controls
                               preload="metadata"
                               className="w-full h-full object-cover rounded-xl"
                             />
                           ) : (
                             <img
                               src={getFullUrl(getMediaUrl(currentMedia))}
                               alt="Media"
                               className="w-full h-full object-cover rounded-xl"
                             />
                           )}
                        </div>
                        <div className="p-3 flex items-center justify-between bg-white border-t border-slate-50">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             #1 - {isVideoMedia(currentMedia) ? "video" : "image"}
                           </span>
                           {currentMedia.isPrimary && <CheckCircle2 size={16} className="text-emerald-500" />}
                        </div>
                     </div>
                   ) : (
                     <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                        <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-400">Chưa có media</p>
                     </div>
                   )}
                   
                   <button 
                     disabled={uploading}
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                   >
                      {uploading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <PlusIcon size={18} />
                      )}
                      {uploading ? "Đang tải lên..." : "Tải lên Media mới"}
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
