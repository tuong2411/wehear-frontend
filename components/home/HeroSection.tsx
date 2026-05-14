"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40">
      {/* Nền mờ nghệ thuật */}
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
              <span>AI nhận diện ngôn ngữ ký hiệu VSL</span>
            </div>

            <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
              Lắng nghe bằng <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Đôi bàn tay
              </span>
            </h1>

            <p className="mt-8 text-xl leading-relaxed text-slate-600 md:max-w-xl">
              WeHear xóa bỏ rào cản giao tiếp cho cộng đồng người khiếm thính Việt Nam 
              bằng công nghệ AI dịch thuật thời gian thực và hệ sinh thái học tập toàn diện.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/translate"
                className="group flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-2xl active:scale-95"
              >
                Trải nghiệm ngay
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/dictionary"
                className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95"
              >
                Tra cứu từ điển
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
                  ))}
               </div>
               <p><span className="font-bold text-slate-900">+500</span> người đã tham gia cộng đồng</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 overflow-hidden rounded-[40px] bg-slate-900 p-4 shadow-2xl ring-1 ring-slate-800">
               <div className="aspect-video w-full rounded-[32px] bg-slate-800 flex items-center justify-center overflow-hidden group cursor-pointer">
                  <div className="h-20 w-20 rounded-full bg-blue-600/90 flex items-center justify-center text-white transition-transform group-hover:scale-110">
                     <Play className="h-8 w-8 fill-current ml-1" />
                  </div>
                  {/* Overlay giả lập UI AI */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                     <div className="flex justify-end items-end">
                        <div className="h-24 w-1 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Decor Elements */}
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-3xl bg-blue-100/50 -z-10 blur-xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-100/50 -z-10 blur-2xl" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
