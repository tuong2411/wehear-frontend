"use client";

import { useState } from "react";
import { communityService } from "@/services/communityService";
import { toast } from "react-hot-toast";
import { Image, Video, Send, X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommunityPostFormProps {
  onPostCreated: () => void;
}

export default function CommunityPostForm({ onPostCreated }: CommunityPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMediaType(file.type.startsWith('video') ? 'VIDEO' : 'IMAGE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalMediaUrl = mediaUrl;
      if (selectedFile) {
        const uploadRes = await communityService.uploadMedia(selectedFile);
        if (uploadRes.success) {
          finalMediaUrl = uploadRes.url;
        } else {
          throw new Error("Upload media thất bại");
        }
      }

      const res = await communityService.createPost({
        title,
        content,
        mediaUrl: finalMediaUrl || undefined,
        mediaType: finalMediaUrl ? mediaType : undefined,
      });
      if (res.success) {
        toast.success("Đã đăng bài viết mới!");
        setTitle("");
        setContent("");
        setMediaUrl("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowForm(false);
        onPostCreated();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Đăng bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full bg-white rounded-3xl border border-slate-100 p-4 flex items-center gap-4 hover:border-blue-200 transition-all text-slate-400 group shadow-sm"
        >
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
             <Camera size={20} />
          </div>
          <span className="font-medium">Bạn có câu hỏi hay chia sẻ gì không?</span>
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border-2 border-blue-100 p-6 shadow-xl shadow-blue-500/5"
        >
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-black text-slate-900">Tạo bài viết mới</h3>
             <button onClick={() => {
                setShowForm(false);
                setSelectedFile(null);
                setPreviewUrl(null);
             }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Tiêu đề câu hỏi hoặc chủ đề..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
              />
            </div>
            
            <div>
              <textarea 
                placeholder="Mô tả chi tiết nội dung của bạn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full text-slate-600 placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                 {mediaType === 'IMAGE' ? (
                   <img src={previewUrl} alt="Preview media" className="max-h-[420px] w-full object-contain" />
                 ) : (
                   <video src={previewUrl} className="max-h-[420px] w-full object-contain" controls />
                 )}
                 <button 
                   type="button"
                   onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                   className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                 >
                    <X size={16} />
                 </button>
              </div>
            )}

            {/* Media Inputs */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
               <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
                  <Image size={18} />
                  <span className="text-xs font-bold">Hình ảnh</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
               </label>
               <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
                  <Video size={18} />
                  <span className="text-xs font-bold">Video</span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
               </label>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Đăng ngay <Send size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
