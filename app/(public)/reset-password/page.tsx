'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, password);
      setMessage('Mật khẩu đã được thay đổi thành công!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-blue-100/50 ring-1 ring-slate-100"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
        {!message && <p className="mt-2 text-slate-500 font-medium text-sm">Nhập mật khẩu mới của bạn bên dưới</p>}
      </div>

      {message ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-50 p-3 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <p className="text-emerald-600 font-bold">{message}</p>
          <p className="text-slate-500 text-sm font-medium">Đang chuyển hướng về trang đăng nhập...</p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
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
            className="relative flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 text-white font-bold transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 disabled:active:scale-100 shadow-lg shadow-blue-200"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Cập nhật mật khẩu <ArrowRight className="ml-2 w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-indigo-50 blur-[120px]" />
      </div>
      
      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 flex justify-center items-center shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
