"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40">
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 opacity-20 blur-3xl [background:radial-gradient(50%_50%_at_50%_50%,#3b82f6_0%,rgba(255,255,255,0)_100%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 ring-1 ring-blue-100">
              <Sparkles className="h-4 w-4" />
              <span>Cộng đồng chia sẻ ngôn ngữ ký hiệu</span>
            </div>

            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Kết nối cộng đồng <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                bằng đôi bàn tay
              </span>
            </h1>

            <p className="mt-8 text-xl leading-relaxed text-slate-600 md:max-w-xl">
              WeHear giúp mọi người hỏi đáp, tra từ điển ký hiệu và dùng AI để
              hỗ trợ giao tiếp hằng ngày.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/community"
                className="group flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-2xl active:scale-95"
              >
                Tham gia cộng đồng
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/translate"
                className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95"
              >
                Dịch thử bằng AI
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 shadow-sm"
                  />
                ))}
              </div>
              <p>
                <span className="font-bold text-slate-900">+500</span> người
                đã tham gia cộng đồng
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 overflow-hidden rounded-[40px] bg-slate-900 p-4 shadow-2xl ring-1 ring-slate-800">
              <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-slate-800">
                <video
                  src="/videos/hero-sign-language.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/10" />
              </div>
            </div>

            <div className="absolute -top-6 -right-6 -z-10 h-24 w-24 rounded-3xl bg-blue-100/50 blur-xl" />
            <div className="absolute -bottom-10 -left-10 -z-10 h-32 w-32 rounded-full bg-cyan-100/50 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
