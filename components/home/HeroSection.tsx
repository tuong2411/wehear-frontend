"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const strengths = [
  "Hoàn toàn miễn phí",
  "Mở dùng ngay",
  "Phản hồi nhanh",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-32 lg:pb-40">
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 opacity-20 blur-3xl [background:radial-gradient(50%_50%_at_50%_50%,#3b82f6_0%,rgba(255,255,255,0)_100%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 ring-1 ring-blue-100">
              <Sparkles className="h-4 w-4" />
              <span>Công cụ học và chia sẻ ngôn ngữ ký hiệu</span>
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-8 sm:text-4xl md:text-5xl lg:text-6xl">
              Kết nối cộng đồng <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                bằng đôi bàn tay
              </span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:mt-8 sm:text-xl md:max-w-xl">
              WeHear giúp mọi người tra cứu ký hiệu, thử dịch nhanh và tham gia cộng đồng
              mà không cần trả phí hay qua nhiều bước phức tạp.
            </p>

            <div className="mt-8 grid gap-3 sm:mt-10 sm:flex sm:flex-wrap sm:gap-4">
              <Link
                href="/community"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-2xl active:scale-95 sm:px-8 sm:text-lg"
              >
                Tham gia ngay
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/translate"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95 sm:px-8 sm:text-lg"
              >
                Dịch thử ngay
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-sm font-bold text-slate-700 sm:mt-10 sm:gap-3">
              {strengths.map((strength) => (
                <span
                  key={strength}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 ring-1 ring-slate-100 sm:px-4"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {strength}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 overflow-hidden rounded-[28px] bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-800 sm:rounded-[40px] sm:p-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-[22px] bg-slate-800 sm:rounded-[32px]">
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
