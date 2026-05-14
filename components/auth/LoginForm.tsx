"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(formData);
      if (data.token && data.user) {
        // Kiểm tra quyền Admin
        const isAdmin = data.user.roleName?.toUpperCase() === "ADMIN" || data.user.roleId === 1;
        
        if (isAdmin) {
          // Nếu là Admin, ưu tiên vào trang quản lý
          window.location.href = "/admin";
        } else {
          // Nếu là User, vào trang yêu cầu trước đó hoặc trang chủ
          const returnUrl = searchParams.get("returnUrl") || "/";
          window.location.href = decodeURIComponent(returnUrl);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-blue-100/50 ring-1 ring-slate-100"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Chào mừng trở lại!</h1>
        <p className="mt-2 text-slate-500 font-medium">Đăng nhập để tiếp tục hành trình cùng Wehear</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="text"
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 text-white font-bold transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 disabled:active:scale-100"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Đăng nhập"
          )}
        </button>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
