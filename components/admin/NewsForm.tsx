"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, ArrowLeft, LayoutGrid, CheckCircle2, 
  Upload, Image as ImageIcon, Link as LinkIcon, Loader2, AlertCircle, Calendar, Tag, Globe, User
} from "lucide-react";
import { createNews, updateNews, getNewsSources } from "@/services/newsService";
import { ExternalNewsArticle, NewsSource } from "@/types/news";
import toast from "react-hot-toast";

interface NewsFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function NewsForm({ initialData, isEdit = false }: NewsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<NewsSource[]>([]);
  
  const [formData, setFormData] = useState<Partial<ExternalNewsArticle>>({
    title: "",
    slug: "",
    summary: "",
    articleUrl: "",
    thumbnailUrl: "",
    sourceId: 0,
    authorName: "",
    category: "",
    tags: "",
    languageCode: "vi",
    status: 'ACTIVE',
    relevanceScore: 1.0
  });

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const data = await getNewsSources();
        setSources(data);
        if (data.length > 0 && !isEdit && !formData.sourceId) {
          setFormData(prev => ({ ...prev, sourceId: data[0].id }));
        }
      } catch (error) {
        console.error("Failed to fetch sources", error);
      }
    };
    fetchSources();
  }, [isEdit, formData.sourceId]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || "",
        slug: initialData.slug || "",
        summary: initialData.summary || "",
        articleUrl: initialData.articleUrl || "",
        thumbnailUrl: initialData.thumbnailUrl || "",
        sourceId: initialData.sourceId || 0,
        authorName: initialData.authorName || "",
        category: initialData.category || "",
        tags: initialData.tags || "",
        languageCode: initialData.languageCode || "vi",
        status: initialData.status || 'ACTIVE',
        relevanceScore: initialData.relevanceScore || 1.0,
        publishedAt: initialData.publishedAt
      });
    }
  }, [initialData]);

  // Auto generate slug
  useEffect(() => {
    if (formData.title && !isEdit) {
      const slug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.articleUrl || !formData.sourceId) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && formData.id) {
        await updateNews(formData.id, formData);
        toast.success("Cập nhật tin tức thành công!");
      } else {
        await createNews(formData);
        toast.success("Tạo tin tức thành công!");
      }
      router.push("/admin/news");
      router.refresh();
    } catch (error) {
      toast.error("Lỗi khi lưu tin tức");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 font-bold hover:text-slate-900 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
               <ArrowLeft size={18} />
            </div>
            Quay lại
          </button>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:block px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest">
                {isEdit ? "Chỉnh sửa tin tức" : "Soạn thảo tin tức"}
             </div>
             <button 
               onClick={handleSubmit}
               disabled={loading}
               className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
             >
               {loading ? "Đang xử lý..." : <><Save size={20} /> {isEdit ? "Cập nhật" : "Lưu tin tức"}</>}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <LayoutGrid size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nội dung tin tức</h2>
              </div>

              <div className="space-y-6">
                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Tiêu đề tin tức *</label>
                    <input 
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Nhập tiêu đề tin tức..."
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-lg focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Tóm tắt</label>
                    <textarea 
                      rows={4}
                      value={formData.summary || ""}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      placeholder="Nhập tóm tắt tin tức..."
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium text-slate-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Đường dẫn (Slug) *</label>
                      <input 
                        type="text"
                        value={formData.slug || ""}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-mono text-xs text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Nguồn tin tức *</label>
                      <select 
                        value={formData.sourceId || ""}
                        onChange={(e) => setFormData({...formData, sourceId: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none"
                      >
                        <option value="">Chọn nguồn tin...</option>
                        {sources.map(source => (
                          <option key={source.id} value={source.id}>{source.sourceName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Link bài viết gốc *</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <LinkIcon size={18} />
                      </div>
                      <input 
                        type="url"
                        value={formData.articleUrl || ""}
                        onChange={(e) => setFormData({...formData, articleUrl: e.target.value})}
                        placeholder="https://example.com/news/article"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-medium text-slate-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Link ảnh bìa (Thumbnail)</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <ImageIcon size={18} />
                      </div>
                      <input 
                        type="url"
                        value={formData.thumbnailUrl || ""}
                        onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                        placeholder="https://example.com/images/thumb.jpg"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-medium text-slate-600 outline-none"
                      />
                    </div>
                    {formData.thumbnailUrl && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 max-w-xs">
                        <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-auto" onError={(e) => (e.currentTarget.src = "/images/default/news.svg")} />
                      </div>
                    )}
                  </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Tag size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Phân loại & Chi tiết</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Tác giả</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text"
                        value={formData.authorName || ""}
                        onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                        placeholder="Tên tác giả..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Danh mục</label>
                    <input 
                      type="text"
                      value={formData.category || ""}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="VD: Giáo dục, Công nghệ..."
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none"
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Tags (cách nhau bởi dấu phẩy)</label>
                    <input 
                      type="text"
                      value={formData.tags || ""}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="tag1, tag2..."
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium text-slate-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Mã ngôn ngữ</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <Globe size={18} />
                      </div>
                      <input 
                        type="text"
                        value={formData.languageCode || "vi"}
                        onChange={(e) => setFormData({...formData, languageCode: e.target.value})}
                        placeholder="vi, en..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-700 outline-none"
                      />
                    </div>
                  </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                   <CheckCircle2 size={20} className="text-emerald-500" /> Xuất bản
                </h3>
                
                <div className="space-y-4">
                   <div className="p-4 rounded-2xl bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                         <span className="text-slate-400">Trạng thái</span>
                         <select 
                            value={formData.status || 'ACTIVE'}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="bg-transparent border-none font-bold text-blue-600 outline-none cursor-pointer p-0 text-right"
                         >
                            <option value="ACTIVE">HOẠT ĐỘNG</option>
                            <option value="INACTIVE">ẨN</option>
                            <option value="DRAFT">BẢN NHÁP</option>
                         </select>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                         <span className="text-slate-400">Độ ưu tiên</span>
                         <input 
                            type="number"
                            step="0.1"
                            value={formData.relevanceScore || 1.0}
                            onChange={(e) => setFormData({...formData, relevanceScore: parseFloat(e.target.value)})}
                            className="bg-transparent border-none font-bold text-slate-700 outline-none w-16 text-right"
                         />
                      </div>
                   </div>

                   <button 
                     onClick={handleSubmit}
                     disabled={loading}
                     className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                   >
                      {loading ? "Đang lưu..." : (isEdit ? "Cập nhật thay đổi" : "Tạo tin tức mới")}
                   </button>
                </div>
             </div>

             <div className="p-8 rounded-[40px] bg-slate-900 text-white space-y-4 shadow-xl">
                <h4 className="font-black flex items-center gap-2">
                   <AlertCircle size={18} className="text-amber-400" /> Lưu ý
                </h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                   Hãy đảm bảo đường dẫn (Slug) là duy nhất và không chứa ký tự đặc biệt. Nguồn tin tức và đường dẫn bài viết gốc là bắt buộc.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
