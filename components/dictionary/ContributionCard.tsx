"use client";

import { DictionaryContribution } from "@/types/contribution";
import { AlertCircle, ArrowRight, Calendar, CheckCircle, Clock, Edit3, Plus, Video, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ContributionCardProps {
  item: DictionaryContribution;
  index: number;
}

const statusConfig = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    icon: <Clock size={14} />,
    label: "Chờ duyệt",
  },
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    icon: <CheckCircle size={14} />,
    label: "Đã duyệt",
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
    icon: <XCircle size={14} />,
    label: "Từ chối",
  },
};

export const ContributionCard = ({ item, index }: ContributionCardProps) => {
  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const isNew = item.type === "NEW";
  const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Chưa rõ ngày";
  const typeLabel = isNew
    ? "Từ mới được đề xuất"
    : item.targetDictionaryId
      ? `Chỉnh sửa từ ID: #${item.targetDictionaryId}`
      : "Chỉnh sửa từ đã bị xóa";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {item.videoUrl ? (
          <>
            <video
              src={getFullUrl(item.videoUrl)}
              className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-transparent">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-md transition-transform group-hover:scale-110">
                <Video className="text-white" size={24} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
            <Video size={40} />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md ${
              isNew ? "bg-blue-600/90" : "bg-purple-600/90"
            }`}
          >
            {isNew ? <Plus size={10} strokeWidth={3} /> : <Edit3 size={10} strokeWidth={3} />}
            {isNew ? "Mới" : "Sửa"}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="flex items-center gap-1 rounded-lg bg-black/30 px-2 py-1 text-[10px] font-bold text-white/90 backdrop-blur">
            <Calendar size={12} />
            {createdDate}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="line-clamp-1 text-xl font-black text-slate-900 transition-colors group-hover:text-blue-600">
              {item.word}
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-tight text-slate-400">{typeLabel}</p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-tight shadow-sm ${status.bg} ${status.text} ${status.border}`}
          >
            {status.icon}
            {status.label}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {item.description || "Chưa có mô tả cho đóng góp này."}
        </p>

        {item.example && (
          <p className="mb-4 line-clamp-1 rounded-xl bg-slate-50 px-3 py-2 text-xs italic text-slate-500">
            “{item.example}”
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
          {item.status === "REJECTED" && item.adminNote ? (
            <div className="group/note relative">
              <div className="flex cursor-help items-center gap-1.5 text-rose-500 transition-colors hover:text-rose-600">
                <AlertCircle size={14} />
                <span className="text-[11px] font-bold uppercase tracking-tighter">Lý do từ chối</span>
              </div>
              <div className="absolute bottom-full left-0 z-20 mb-3 w-64 translate-y-1 rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-white opacity-0 shadow-2xl transition-all group-hover/note:translate-y-0 group-hover/note:opacity-100">
                <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-blue-300">Phản hồi từ admin</p>
                {item.adminNote}
                <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-slate-900" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
                {item.userId}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cộng tác viên</span>
            </div>
          )}

          <span className="text-slate-300 transition-colors group-hover:text-blue-500">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
