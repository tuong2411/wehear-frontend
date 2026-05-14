"use client";

import { useEffect, useState } from "react";
import { communityService } from "@/services/communityService";
import { CommunityPost, CommunityReport } from "@/types/community";
import { Shield, EyeOff, Eye, CheckCircle, AlertTriangle, MessageSquare, Trash2, Clock, User, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCommunityManager() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [view, setView] = useState<'POSTS' | 'REPORTS'>('POSTS');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (view === 'POSTS') fetchPosts();
    else fetchReports();
  }, [view]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await communityService.adminGetPosts(0, 50);
      if (res.success) setPosts(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách bài viết.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await communityService.getReports();
      if (res.success) setReports(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách báo cáo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHidePost = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn ẩn bài viết này và tất cả bình luận liên quan?")) return;
    try {
      const res = await communityService.hidePost(id);
      if (res.success) {
        toast.success("Đã ẩn bài viết.");
        setPosts(posts.map(p => p.id === id ? { ...p, status: 'HIDDEN' } : p));
      }
    } catch (error) {
      toast.error("Thao tác thất bại.");
    }
  };

  const handleShowPost = async (id: number) => {
    try {
      const res = await communityService.showPost(id);
      if (res.success) {
        toast.success("Đã hiện lại bài viết.");
        setPosts(posts.map(p => p.id === id ? { ...p, status: 'ACTIVE' } : p));
      }
    } catch (error) {
      toast.error("Thao tác thất bại.");
    }
  };

  const handleResolveReport = async (id: number) => {
    try {
      const res = await communityService.resolveReport(id);
      if (res.success) {
        toast.success("Đã xử lý báo cáo.");
        setReports(reports.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
      }
    } catch (error) {
      toast.error("Thao tác thất bại.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
           <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Shield className="text-blue-600" size={28} />
              Quản lý Cộng đồng
           </h2>
           <p className="text-slate-400 text-sm font-medium">Kiểm duyệt bài viết và xử lý báo cáo từ người dùng</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
           <button 
             onClick={() => setView('POSTS')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${view === 'POSTS' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
           >
              <MessageSquare size={18} /> Bài viết
           </button>
           <button 
             onClick={() => setView('REPORTS')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${view === 'REPORTS' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
           >
              <AlertTriangle size={18} /> Báo cáo
              {reports.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
         {isLoading ? (
           <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
           </div>
         ) : view === 'POSTS' ? (
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người đăng</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tương tác</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50/30 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                  {post.userFullName?.charAt(0)}
                               </div>
                               <span className="text-sm font-bold text-slate-700">{post.userFullName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="max-w-md">
                               <h4 className="text-sm font-black text-slate-900 line-clamp-1">{post.title}</h4>
                               <p className="text-xs text-slate-400 line-clamp-1">{post.content}</p>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
                               <span className="flex items-center gap-1">❤️ {post.likeCount}</span>
                               <span className="flex items-center gap-1">💬 {post.commentCount}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${post.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                               {post.status === 'ACTIVE' ? 'Công khai' : 'Đã ẩn'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-blue-600 transition-all shadow-sm">
                                  <Clock size={18} />
                               </button>
                               {post.status === 'ACTIVE' ? (
                                 <button 
                                   onClick={() => handleHidePost(post.id!)}
                                   className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                   title="Ẩn bài viết"
                                 >
                                    <EyeOff size={18} />
                                 </button>
                               ) : (
                                 <button 
                                   onClick={() => handleShowPost(post.id!)}
                                   className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                   title="Hiện bài viết"
                                 >
                                    <Eye size={18} />
                                 </button>
                               )}
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         ) : (
           <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {reports.map(report => (
                   <div key={report.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${report.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                               {report.status === 'PENDING' ? 'Đang chờ' : 'Đã xong'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(report.createdAt!).toLocaleDateString()}</span>
                         </div>
                         {report.status === 'PENDING' && (
                           <button 
                             onClick={() => handleResolveReport(report.id!)}
                             className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
                           >
                              Xong <CheckCircle size={14} />
                           </button>
                         )}
                      </div>
                      
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <User size={12} /> Người báo cáo: #{report.reporterId}
                         </div>
                         <div className="p-4 rounded-2xl bg-white border border-slate-100">
                            <p className="text-sm text-slate-600 font-medium">"{report.reason}"</p>
                         </div>
                      </div>

                      <div className="pt-4 flex items-center gap-4">
                         <button className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
                            Xem nội dung gốc
                         </button>
                         <button className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 shadow-lg shadow-red-200 transition-all">
                            Ẩn nội dung bị báo
                         </button>
                      </div>
                   </div>
                 ))}
                 {reports.length === 0 && (
                   <div className="col-span-full py-20 text-center text-slate-400">
                      <CheckCircle size={60} className="mx-auto mb-4 text-green-100" />
                      <p className="font-bold">Tuyệt vời! Không có báo cáo nào cần xử lý.</p>
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
