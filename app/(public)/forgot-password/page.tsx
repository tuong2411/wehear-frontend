'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';
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
      setMessage('Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn để nhận link khôi phục.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-indigo-50 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-blue-100/50 ring-1 ring-slate-100"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Quên mật khẩu?</h1>
          <p className="mt-2 text-slate-500 font-medium">
            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        {message ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-50 p-3 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
            </div>
            <p className="text-emerald-600 font-bold">{message}</p>
            <div className="pt-4 border-t border-slate-100">
              <Link href="/login" className="flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại đăng nhập
              </Link>
            </div>
          </motion.div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email của bạn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                  Gửi yêu cầu <Send className="ml-2 w-4 h-4" />
                </span>
              )}
            </button>

            <div className="text-center">
              <Link href="/login" className="flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
