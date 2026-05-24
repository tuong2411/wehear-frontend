'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
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

    if (password.length < 6) {
      setError('Mật khẩu mới cần có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.');
      return;
    }

    if (!token) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, password);
      setMessage('Mật khẩu WeHear của bạn đã được cập nhật thành công.');
      setTimeout(() => router.push('/login'), 2200);
    } catch (err: any) {
      setError(err.response?.data || err.response?.data?.message || 'WeHear chưa thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Đặt lại mật khẩu</h1>
        {!message && (
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Tạo mật khẩu mới để tiếp tục sử dụng tài khoản WeHear của bạn.
          </p>
        )}
      </div>

      {message ? (
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-50 p-3 ring-8 ring-emerald-50/60">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">Cập nhật thành công</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{message}</p>
          </div>
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            WeHear đang chuyển bạn về trang đăng nhập.
          </p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Nhập lại mật khẩu mới"
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
              className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 disabled:active:scale-100"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Cập nhật mật khẩu <ArrowRight className="ml-2 h-4 w-4" />
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
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_35%)]" />

      <Suspense
        fallback={
          <div className="relative z-10 flex w-full max-w-md items-center justify-center rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
