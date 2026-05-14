"use client";

import { useEffect, useState } from "react";
import { lessonService } from "@/services/lessonService";
import { Lesson } from "@/types/lesson";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  BookOpen, 
  Clock, 
  Eye,
  Star,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Filter
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await lessonService.adminGetAll();
      setLessons(data);
    } catch (error) {
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      try {
        await lessonService.deleteLesson(id);
        toast.success("Đã xóa bài học thành công");
        fetchLessons();
      } catch (error) {
        toast.error("Xóa bài học thất bại");
      }
    }
  };

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8668/api";
    const cleanBaseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
    return `${cleanBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Bài học</h1>
          <p className="text-sm font-medium text-slate-500">Tạo mới, chỉnh sửa và xuất bản các bài học ngôn ngữ ký hiệu.</p>
        </div>
        <Link href="/admin/lessons/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
          <Plus size={18} />
          <span>Tạo bài học mới</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm bài học..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={16} />
              Lọc
            </button>
            <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 outline-none focus:border-blue-500">
              <option value="">Trạng thái</option>
              <option value="1">Đã xuất bản</option>
              <option value="0">Nháp</option>
            </select>
          </div>
        </div>

        {/* Lessons List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Bài học</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Cấp độ / Vùng</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Nổi bật</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-blue-600">
                      <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-slate-400">Đang tải bài học...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-bold text-slate-400">Không tìm thấy bài học nào.</p>
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg bg-slate-100 flex-shrink-0 relative overflow-hidden border border-slate-200">
                          {lesson.coverImage ? (
                            <Image src={getFullUrl(lesson.coverImage)} alt={lesson.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <BookOpen size={16} />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">{lesson.title}</p>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{lesson.description || "Không có mô tả"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit">LV: {lesson.level}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{lesson.region || "Toàn quốc"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {lesson.isFeatured ? (
                        <Star size={16} className="mx-auto text-amber-500 fill-amber-500" />
                      ) : (
                        <Star size={16} className="mx-auto text-slate-200" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        lesson.status === 'PUBLISHED' 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-amber-50 text-amber-600"
                      }`}>
                        {lesson.status === 'PUBLISHED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {lesson.status === 'PUBLISHED' ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/lessons/${lesson.slug}`} 
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Xem ngoài trang chủ"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link 
                          href={`/admin/lessons/${lesson.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(lesson.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                          title="Xóa bài học"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
