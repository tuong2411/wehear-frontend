'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await authService.forgotPassword(email);
      setMessage('WeHear đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến hoặc thư rác của bạn.');
    } catch (err: any) {
      setError(err.response?.data || err.response?.data?.message || 'WeHear chưa thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_35%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Khôi phục mật khẩu</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Nhập email đã đăng ký. WeHear sẽ gửi cho bạn một liên kết bảo mật để tạo mật khẩu mới.
          </p>
        </div>

        {message ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 text-center"
          >
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-50 p-3 ring-8 ring-emerald-50/60">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">Email đã được gửi</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{message}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-left text-sm font-medium leading-6 text-blue-800">
              Liên kết sẽ mở trang WeHear chính thức. Nếu email chưa đến sau vài phút, hãy kiểm tra mục thư rác.
            </div>
            <Link href="/login" className="flex items-center justify-center text-sm font-bold text-blue-600 transition-colors hover:text-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
            </Link>
          </motion.div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Email của bạn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="ban@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                  Gửi liên kết đặt lại <Send className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>

            <div className="text-center">
              <Link href="/login" className="flex items-center justify-center text-sm font-bold text-blue-600 transition-colors hover:text-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
