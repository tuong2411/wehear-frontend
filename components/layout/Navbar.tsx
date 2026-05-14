"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/services/authService";
import { User, LogOut, ChevronDown, Menu, X, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch ký hiệu", href: "/translate" },
  { label: "Từ điển", href: "/dictionary" },
  { label: "Bài học", href: "/lessons" },
  { label: "Cộng đồng", href: "/community" },
  { label: "Tin tức", href: "/news" },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200">
            W
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 leading-tight">WeHear</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Vietnamese VSL</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions / User Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-3 transition hover:bg-slate-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 overflow-hidden relative">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">
                  {user.fullName || user.username}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/50"
                  >
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} /> Trang cá nhân
                    </Link>
                    <Link 
                      href="/history" 
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <History size={16} /> Lịch sử đóng góp
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:text-blue-600"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button 
            className="rounded-lg p-2 text-slate-600 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-2 p-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg py-3 text-base font-bold text-slate-600 transition hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Link
                    href="/login"
                    className="flex justify-center rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="flex justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
