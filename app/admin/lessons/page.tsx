"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Archive,
  BookOpen,
  CheckCircle2,
  Edit,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { lessonService } from "@/services/lessonService";
import type { Lesson, LessonLevel, LessonStatus } from "@/types/lesson";

const statusLabels: Record<LessonStatus, string> = {
  DRAFT: "Bản nháp",
  SCHEDULED: "Đã lên lịch",
  PUBLISHED: "Công khai",
  UNPUBLISHED: "Tạm ẩn",
  ARCHIVED: "Lưu trữ",
};

const levelLabels: Record<LessonLevel, string> = {
  BASIC: "Cơ bản",
  INTERMEDIATE: "Trung bình",
  ADVANCED: "Nâng cao",
};

const statusStyles: Record<LessonStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SCHEDULED: "bg-sky-50 text-sky-700 border-sky-100",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  UNPUBLISHED: "bg-amber-50 text-amber-700 border-amber-100",
  ARCHIVED: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | LessonStatus>("ALL");
  const [levelFilter, setLevelFilter] = useState<"ALL" | LessonLevel>("ALL");

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await lessonService.adminGetAll();
      setLessons(data);
    } catch {
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;

    try {
      await lessonService.deleteLesson(id);
      toast.success("Đã xóa bài học thành công");
      fetchLessons();
    } catch {
      toast.error("Xóa bài học thất bại");
    }
  };

  const filteredLessons = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const matchesSearch =
        !keyword ||
        lesson.title.toLowerCase().includes(keyword) ||
        lesson.slug.toLowerCase().includes(keyword) ||
        lesson.description?.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === "ALL" || lesson.status === statusFilter;
      const matchesLevel = levelFilter === "ALL" || lesson.level === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [lessons, levelFilter, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const published = lessons.filter((lesson) => lesson.status === "PUBLISHED").length;
    const drafts = lessons.filter((lesson) => lesson.status === "DRAFT").length;
    const featured = lessons.filter((lesson) => lesson.isFeatured).length;

    return [
      { label: "Tổng bài học", value: lessons.length, icon: BookOpen, tone: "text-blue-700 bg-blue-50" },
      { label: "Đang công khai", value: published, icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50" },
      { label: "Bản nháp", value: drafts, icon: FileText, tone: "text-slate-700 bg-slate-100" },
      { label: "Nổi bật", value: featured, icon: Star, tone: "text-amber-700 bg-amber-50" },
    ];
  }, [lessons]);

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    const cleanBaseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
    return `${cleanBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Lesson Management</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Quản lý bài học</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
              Theo dõi nội dung, trạng thái phát hành và bài kiểm tra của từng bài học.
            </p>
          </div>
          <Link
            href="/admin/lessons/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Tạo bài học
          </Link>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
                    <Icon size={18} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên, slug hoặc mô tả"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <label className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as "ALL" | LessonStatus)}
                  className="h-11 min-w-44 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value as "ALL" | LessonLevel)}
                className="h-11 min-w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ALL">Tất cả cấp độ</option>
                {Object.entries(levelLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Bài học</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Phân loại</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Quiz</th>
                  <th className="px-5 py-3 text-right text-xs font-black uppercase tracking-widest text-slate-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-blue-700" size={32} />
                        <p className="text-sm font-bold">Đang tải bài học...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLessons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <AlertCircle size={36} />
                        <p className="text-sm font-bold">Không tìm thấy bài học phù hợp.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLessons.map((lesson) => (
                    <tr key={lesson.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {lesson.coverImage ? (
                              <img src={getFullUrl(lesson.coverImage)} alt={lesson.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <BookOpen size={22} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-black text-slate-950">{lesson.title}</p>
                              {lesson.isFeatured && <Star size={15} className="shrink-0 fill-amber-400 text-amber-400" />}
                            </div>
                            <p className="mt-1 max-w-md truncate text-xs font-semibold text-slate-500">{lesson.description || "Không có mô tả"}</p>
                            <p className="mt-1 text-[11px] font-bold text-slate-400">/{lesson.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">
                            {levelLabels[lesson.level] || lesson.level}
                          </span>
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">
                            {lesson.region || "TOAN_QUOC"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-black ${statusStyles[lesson.status] || statusStyles.DRAFT}`}>
                          {lesson.status === "ARCHIVED" ? <Archive size={13} /> : <CheckCircle2 size={13} />}
                          {statusLabels[lesson.status] || lesson.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-slate-900">{lesson.quiz?.questions?.length || 0}</span>
                        <span className="ml-1 text-xs font-semibold text-slate-400">câu hỏi</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/lessons/${lesson.slug}`}
                            target="_blank"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            title="Xem bài học"
                          >
                            <ExternalLink size={17} />
                          </Link>
                          <Link
                            href={`/admin/lessons/${lesson.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                            title="Chỉnh sửa"
                          >
                            <Edit size={17} />
                          </Link>
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            title="Xóa bài học"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
