"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Loader2, User, Mail, Lock, Phone, UserCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authService.register(formData);
      setSuccess("Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl shadow-blue-100/50 ring-1 ring-slate-100"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Tạo tài khoản mới</h1>
        <p className="mt-2 text-slate-500 font-medium">Tham gia cùng cộng đồng WeHear ngay hôm nay</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <UserCircle className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="0912345678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="an@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 my-2 pt-2"></div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <User className="h-5 w-5" />
            </div>
            <input
              type="text"
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-600 border border-emerald-100">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 text-white font-bold transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 disabled:active:scale-100 shadow-lg shadow-blue-200"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Đăng ký tài khoản"
          )}
        </button>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
            Đăng nhập tại đây
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
