"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "@/services/authService";
import type { User } from "@/types/auth";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  LogOut,
  Search,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/admin": {
    title: "Tổng quan",
    description: "Theo dõi nhanh hoạt động và số liệu chính của hệ thống.",
  },
  "/admin/users": {
    title: "Quản lý người dùng",
    description: "Quản lý tài khoản, trạng thái và vai trò người dùng.",
  },
  "/admin/dictionary": {
    title: "Quản lý từ điển",
    description: "Cập nhật từ vựng, video và dữ liệu ký hiệu.",
  },
  "/admin/dictionary/new": {
    title: "Thêm từ vựng",
    description: "Tạo mục từ điển mới cho hệ thống WeHear.",
  },
  "/admin/dictionary/contributions": {
    title: "Quản lý đóng góp",
    description: "Duyệt, từ chối và kiểm tra các đóng góp từ cộng đồng.",
  },
  "/admin/lessons": {
    title: "Quản lý bài học",
    description: "Tạo và chỉnh sửa nội dung học ngôn ngữ ký hiệu.",
  },
  "/admin/lessons/new": {
    title: "Thêm bài học",
    description: "Xây dựng bài học mới từ kho từ điển hiện có.",
  },
  "/admin/news": {
    title: "Quản lý tin tức",
    description: "Biên tập, xuất bản và theo dõi bài viết.",
  },
  "/admin/news/new": {
    title: "Thêm tin tức",
    description: "Tạo bài viết mới cho chuyên mục tin tức.",
  },
  "/admin/community": {
    title: "Quản lý cộng đồng",
    description: "Kiểm duyệt bài viết, bình luận và báo cáo.",
  },
  "/admin/quizzes": {
    title: "Quản lý câu đố",
    description: "Theo dõi nội dung luyện tập và câu hỏi kiểm tra.",
  },
};

function getPageMeta(pathname: string) {
  if (pageMeta[pathname]) {
    return pageMeta[pathname];
  }
  if (pathname.startsWith("/admin/dictionary/")) {
    return {
      title: "Chi tiết từ vựng",
      description: "Xem và cập nhật thông tin chi tiết của mục từ điển.",
    };
  }
  if (pathname.startsWith("/admin/lessons/")) {
    return {
      title: "Chi tiết bài học",
      description: "Xem và cập nhật nội dung bài học.",
    };
  }
  if (pathname.startsWith("/admin/news/")) {
    return {
      title: "Chi tiết tin tức",
      description: "Xem và chỉnh sửa nội dung bài viết.",
    };
  }
  return {
    title: "Quản trị hệ thống",
    description: "Không gian điều hành và quản lý dữ liệu WeHear.",
  };
}

export default function AdminHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const meta = useMemo(() => getPageMeta(pathname), [pathname]);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-5 px-6 py-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
            <ShieldCheck size={14} />
            <span>WeHear Admin</span>
          </div>
          <h1 className="truncate text-2xl font-black text-slate-950">{meta.title}</h1>
          <p className="mt-1 hidden text-sm font-medium text-slate-500 md:block">
            {meta.description}
          </p>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="relative hidden w-72 items-center rounded-2xl bg-slate-100 px-4 py-3 ring-1 ring-slate-200 transition focus-within:bg-white focus-within:ring-blue-500 lg:flex">
            <Search size={18} className="mr-3 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trong quản trị..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <Link
            href="/lessons"
            className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 md:flex"
          >
            <ExternalLink size={16} />
            Xem trang người dùng
          </Link>

          <button
            type="button"
            onClick={() => authService.logout()}
            className="hidden items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-100 md:flex"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>

          <button
            type="button"
            className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
            aria-label="Thông báo"
          >
            <Bell size={19} />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((value) => !value)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-1.5 pl-3 shadow-sm transition hover:bg-slate-50"
            >
              <div className="hidden text-right sm:block">
                <p className="max-w-36 truncate text-sm font-black text-slate-900">
                  {user?.fullName || user?.username || "Admin"}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {user?.roleName || "Quản trị viên"}
                </p>
              </div>
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-blue-600 ring-1 ring-blue-100">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="Ảnh đại diện" fill className="object-cover" />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <ChevronDown
                size={16}
                className={`mr-1 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/70">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                >
                  <UserIcon size={16} />
                  Trang cá nhân
                </Link>
                <Link
                  href="/lessons"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 md:hidden"
                >
                  <ExternalLink size={16} />
                  Xem trang người dùng
                </Link>
                <button
                  type="button"
                  onClick={() => authService.logout()}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 md:hidden"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
