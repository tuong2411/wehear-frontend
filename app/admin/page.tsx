"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Book,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileQuestion,
  Loader2,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { dashboardService, DashboardStats } from "@/services/dashboardService";

type StatCard = {
  label: string;
  value: string;
  helper: string;
  icon: typeof Users;
  tone: string;
  href: string;
};

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    fetchDashboardData();

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      const data = await dashboardService.getStats();
      setStatsData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatNumber = (value?: number) => (value || 0).toLocaleString("vi-VN");

  const stats: StatCard[] = useMemo(
    () => [
      {
        label: "Người dùng",
        value: formatNumber(statsData?.totalUsers),
        helper: "Tài khoản trong hệ thống",
        icon: Users,
        tone: "bg-blue-50 text-blue-700 border-blue-100",
        href: "/admin/users",
      },
      {
        label: "Bài học",
        value: formatNumber(statsData?.totalLessons),
        helper: "Nội dung học tập",
        icon: BookOpen,
        tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
        href: "/admin/lessons",
      },
      {
        label: "Từ điển",
        value: formatNumber(statsData?.totalSigns),
        helper: "Ký hiệu đã nhập",
        icon: Book,
        tone: "bg-violet-50 text-violet-700 border-violet-100",
        href: "/admin/dictionary",
      },
      {
        label: "Quiz",
        value: formatNumber(statsData?.totalQuizzes),
        helper: "Bộ câu hỏi đánh giá",
        icon: FileQuestion,
        tone: "bg-amber-50 text-amber-700 border-amber-100",
        href: "/admin/quizzes",
      },
    ],
    [statsData],
  );

  const totalLearningAssets = (statsData?.totalLessons || 0) + (statsData?.totalSigns || 0) + (statsData?.totalQuizzes || 0);
  const quizCoverage = statsData?.totalLessons
    ? Math.min(100, Math.round(((statsData.totalQuizzes || 0) / statsData.totalLessons) * 100))
    : 0;

  const operations = [
    {
      label: "Nội dung học tập",
      value: `${formatNumber(totalLearningAssets)} mục`,
      note: "Bài học, từ điển và quiz",
      icon: Sparkles,
    },
    {
      label: "Mức phủ quiz",
      value: `${quizCoverage}%`,
      note: "Tỉ lệ quiz trên số bài học",
      icon: CheckCircle2,
    },
    {
      label: "Bài mới gần đây",
      value: `${statsData?.recentLessons?.length || 0}/5`,
      note: "Dữ liệu lấy từ API dashboard",
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-11 w-11 animate-spin text-blue-700" />
        <p className="text-sm font-bold text-slate-500">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900">Đã xảy ra lỗi</h3>
          <p className="max-w-md text-sm font-medium text-slate-500">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
              <ShieldCheck size={14} />
              Admin Overview
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Dashboard quản trị</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Theo dõi nhanh dữ liệu học tập, từ điển ký hiệu và các nội dung cần quản lý trong WeHear.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700">
              <Clock size={17} className="text-slate-400" />
              {currentTime}
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${stat.tone}`}>
                  <Icon size={21} />
                </div>
                <ArrowUpRight className="text-slate-300 transition group-hover:text-blue-600" size={18} />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h2 className="text-3xl font-black tracking-tight text-slate-950">{stat.value}</h2>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-500">{stat.helper}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Bài học vừa cập nhật</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">5 bài học mới nhất trong hệ thống</p>
            </div>
            <Link href="/admin/lessons" className="inline-flex items-center gap-1 text-sm font-black text-blue-700 hover:text-blue-800">
              Xem tất cả
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {statsData?.recentLessons && statsData.recentLessons.length > 0 ? (
              statsData.recentLessons.map((lesson) => (
                <div key={lesson.id} className="grid gap-4 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{lesson.title}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        <span className="rounded-md bg-slate-100 px-2 py-1">{lesson.level || "BASIC"}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-1">{lesson.status || "DRAFT"}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-1">
                          {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString("vi-VN") : "Chưa rõ ngày"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:justify-end">
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                    >
                      Chỉnh sửa
                    </Link>
                    <Link
                      href={`/lessons/${lesson.slug}`}
                      target="_blank"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                      title="Xem trang người dùng"
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <BookOpen className="mx-auto text-slate-300" size={40} />
                <p className="mt-3 text-sm font-bold text-slate-400">Chưa có bài học nào được tạo.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Tình trạng vận hành</h2>
            <div className="mt-5 space-y-3">
              {operations.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-black text-slate-900">{item.label}</p>
                        <span className="text-sm font-black text-blue-700">{item.value}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{item.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Thao tác nhanh</h2>
            <div className="mt-5 grid gap-3">
              <QuickAction href="/admin/lessons/new" icon={Plus} label="Tạo bài học" />
              <QuickAction href="/admin/dictionary/new" icon={Book} label="Thêm từ vựng" />
              <QuickAction href="/admin/news/new" icon={Newspaper} label="Viết tin tức" />
              <QuickAction href="/admin/dictionary" icon={Search} label="Kiểm tra từ điển" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-12 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
    >
      <span className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </span>
      <ChevronRight size={16} className="text-slate-400" />
    </Link>
  );
}
