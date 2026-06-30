"use client";

import { motion } from "framer-motion";
import { BookOpen, Hand, Newspaper, Sparkles } from "lucide-react";

const features = [
  {
    title: "Hỏi đáp trong cộng đồng",
    desc: "Đăng câu hỏi, chia sẻ tình huống giao tiếp và nhận góp ý từ những người cùng quan tâm đến VSL.",
    icon: Hand,
    color: "text-blue-600",
    bg: "bg-blue-50/50",
    border: "border-blue-100",
  },
  {
    title: "Cùng xây dựng từ điển",
    desc: "Đóng góp video ký hiệu, chỉnh sửa mô tả và giúp kho dữ liệu VSL ngày càng đầy đủ hơn.",
    icon: BookOpen,
    color: "text-cyan-600",
    bg: "bg-cyan-50/50",
    border: "border-cyan-100",
  },
  {
    title: "Dùng thử ngay",
    desc: "Mở camera hoặc tải video lên để kiểm tra ký hiệu nhanh, không cần cài thêm phần mềm.",
    icon: Sparkles,
    color: "text-violet-600",
    bg: "bg-violet-50/50",
    border: "border-violet-100",
  },
  {
    title: "Tin tức cộng đồng",
    desc: "Theo dõi các bài báo mới về người khiếm thính, công nghệ hỗ trợ và hoạt động xã hội liên quan.",
    icon: Newspaper,
    color: "text-emerald-600",
    bg: "bg-emerald-50/50",
    border: "border-emerald-100",
  },
];

export default function FeatureSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Vì một cộng đồng <span className="text-blue-600">không rào cản</span>
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-slate-500">
            WeHear tập trung vào những việc thiết thực: truy cập miễn phí, thao tác nhanh,
            dễ bắt đầu học và dễ trao đổi cùng cộng đồng.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border ${feature.border} ${feature.bg} p-8 transition-all hover:shadow-2xl hover:shadow-blue-100`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>

                <h3 className="mt-8 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {feature.desc}
                </p>

                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white opacity-50 blur-3xl transition-transform group-hover:scale-150" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
