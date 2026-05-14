"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  Book, 
  HelpCircle, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { dashboardService, DashboardStats } from "@/services/dashboardService";

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    
    fetchDashboardData();
    
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStatsData(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: "Tổng Người dùng", 
      value: statsData?.totalUsers?.toLocaleString() || "0", 
      icon: Users, 
      trend: "Hệ thống", 
      trendUp: true,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      label: "Bài học Hệ thống", 
      value: statsData?.totalLessons?.toLocaleString() || "0", 
      icon: BookOpen, 
      trend: "Đã tạo", 
      trendUp: true,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    { 
      label: "Từ điển Ký hiệu", 
      value: statsData?.totalSigns?.toLocaleString() || "0", 
      icon: Book, 
      trend: "Từ vựng", 
      trendUp: true,
      color: "text-violet-600",
      bg: "bg-violet-50"
    },
    { 
      label: "Câu hỏi Quiz", 
      value: statsData?.totalQuizzes?.toLocaleString() || "0", 
      icon: HelpCircle, 
      trend: "Tổng số", 
      trendUp: true,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-bold">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800">Đã xảy ra lỗi</h3>
          <p className="text-slate-500 font-medium max-w-md">{error}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Chào mừng quay trở lại hệ thống quản trị WeHear.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Clock size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{currentTime}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {stat.trend}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Updates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Bài học vừa cập nhật</h2>
              <Link href="/admin/lessons" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                Xem tất cả <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {statsData?.recentLessons && statsData.recentLessons.length > 0 ? (
                statsData.recentLessons.map((lesson) => (
                  <div key={lesson.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{lesson.title}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          Cấp độ: {lesson.level} • {new Date(lesson.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/lessons/${lesson.id}`} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm">
                        Sửa
                      </Link>
                      <Link href={`/lessons/${lesson.slug}`} target="_blank" className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-400 font-bold">
                  Chưa có bài học nào được tạo.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 tracking-tight mb-5">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/lessons/new" className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 group">
                <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                  <Plus size={18} />
                </div>
                <span>Thêm bài học mới</span>
              </Link>
              <Link href="/admin/dictionary/new" className="flex items-center gap-3 p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 group">
                <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                  <Plus size={18} />
                </div>
                <span>Thêm từ vựng mới</span>
              </Link>
              <Link href="/admin/news/new" className="flex items-center gap-3 p-4 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all active:scale-95 group">
                <div className="p-1.5 bg-slate-100 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                  <Plus size={18} />
                </div>
                <span>Tạo tin tức mới</span>
              </Link>
            </div>
          </div>

          {/* Quick Support Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-200">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-2 tracking-tight">Hỗ trợ Kỹ thuật</h3>
              <p className="text-blue-100 text-sm font-medium leading-relaxed mb-4">
                Nếu gặp lỗi trong quá trình quản trị, vui lòng liên hệ đội ngũ phát triển.
              </p>
              <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl text-sm font-black hover:bg-blue-50 transition-colors shadow-sm">
                Gửi báo cáo lỗi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
