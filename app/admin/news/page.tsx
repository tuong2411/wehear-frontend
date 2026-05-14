"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  Calendar, AlertCircle, Filter, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import { getAllNewsAdmin, deleteNews, getNewsSources } from "@/services/newsService";
import { ExternalNewsArticle, NewsSource } from "@/types/news";
import toast from "react-hot-toast";

export default function NewsManagementPage() {
  const [news, setNews] = useState<ExternalNewsArticle[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const fetchSources = async () => {
    try {
      const data = await getNewsSources();
      setSources(data);
    } catch (error) {
      console.error("Failed to fetch sources", error);
    }
  };

  const fetchNews = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data = await getAllNewsAdmin(page, pageSize);
      setNews(data.news);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.currentPage);
    } catch (error) {
      toast.error("Không thể tải danh sách tin tức");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
    fetchNews(currentPage);
  }, [currentPage, fetchNews]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin tức này?")) {
      try {
        await deleteNews(id);
        toast.success("Xóa tin tức thành công");
        fetchNews(currentPage);
      } catch (error) {
        toast.error("Lỗi khi xóa tin tức");
      }
    }
  };

  const getSourceName = (sourceId: number) => {
    const source = sources.find(s => s.id === sourceId);
    return source ? source.sourceName : `Nguồn #${sourceId}`;
  };

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Quản lý tin tức</h1>
            <p className="text-slate-500 font-medium">Xem và quản lý các bài viết tin tức trong hệ thống.</p>
          </div>
          <Link 
            href="/admin/news/new" 
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={20} />
            Thêm tin tức mới
          </Link>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tổng bài viết</p>
              <h3 className="text-3xl font-black text-slate-900">{totalItems}</h3>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center md:text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Trang hiện tại</p>
              <h3 className="text-3xl font-black text-blue-500">{currentPage} / {totalPages}</h3>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tin tức mỗi trang</p>
              <h3 className="text-3xl font-black text-slate-900">{pageSize}</h3>
           </div>
        </div>

        {/* Search and List */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="relative w-full md:w-96">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                   <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm trong trang hiện tại..."
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-3">
                <button className="p-4 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                   <Filter size={20} />
                </button>
             </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                 <Loader2 className="animate-spin text-blue-500" size={40} />
                 <p className="font-bold text-slate-400">Đang tải dữ liệu...</p>
              </div>
            ) : filteredNews.length > 0 ? (
              <>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tin tức</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nguồn & Tác giả</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredNews.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                                 <img 
                                   src={item.thumbnailUrl || "/images/default/news.svg"} 
                                   alt={item.title} 
                                   className="w-full h-full object-cover"
                                   onError={(e) => (e.currentTarget.src = "/images/default/news.svg")}
                                 />
                              </div>
                              <div className="max-w-md">
                                 <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                 <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-2">
                                    <Calendar size={12} />
                                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'Chưa rõ ngày'}
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1">
                              <p className="text-sm font-black text-slate-900">{getSourceName(item.sourceId)}</p>
                              <p className="text-xs font-bold text-slate-500">{item.authorName || "Ẩn danh"}</p>
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.category}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             item.status === 'ACTIVE' 
                             ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                             : 'bg-amber-50 text-amber-600 border border-amber-100'
                           }`}>
                             {item.status === 'ACTIVE' ? 'Hoạt động' : item.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <a 
                                href={item.articleUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                title="Xem bài viết gốc"
                              >
                                 <ExternalLink size={18} />
                              </a>
                              <Link 
                                href={`/admin/news/${item.id}`}
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                title="Chỉnh sửa"
                              >
                                 <Edit2 size={18} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Xóa"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                   <p className="text-sm font-bold text-slate-400">
                      Hiển thị <span className="text-slate-900">{filteredNews.length}</span> trên <span className="text-slate-900">{totalItems}</span> bài viết
                   </p>
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      >
                         <ChevronLeft size={20} />
                      </button>
                      
                      {/* Simple page numbers */}
                      <div className="flex items-center gap-1">
                         {[...Array(totalPages)].map((_, i) => (
                           <button
                             key={i + 1}
                             onClick={() => setCurrentPage(i + 1)}
                             className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                               currentPage === i + 1 
                               ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                               : 'text-slate-400 hover:bg-slate-50'
                             }`}
                           >
                             {i + 1}
                           </button>
                         )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      >
                         <ChevronRight size={20} />
                      </button>
                   </div>
                </div>
              </>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                    <AlertCircle size={40} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-2">Không tìm thấy tin tức nào</h3>
                 <p className="text-slate-500 font-medium max-w-xs mx-auto">Hãy thử thay đổi từ khóa tìm kiếm hoặc chuyển sang trang khác.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
