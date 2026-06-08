"use client";

import { useEffect, useMemo, useState } from "react";
import { contributionService } from "@/services/contributionService";
import { ContributionStatus, DictionaryContribution } from "@/types/contribution";
import { CheckCircle, Clock, Plus, Search, SlidersHorizontal, Video, XCircle } from "lucide-react";
import { ContributionCard } from "./ContributionCard";

const statusFilters: Array<{ value: "ALL" | ContributionStatus; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

export default function ContributionHistory() {
  const [contributions, setContributions] = useState<DictionaryContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ContributionStatus>("ALL");

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      const response = await contributionService.getMyContributions();
      if (response.success) {
        setContributions(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch contributions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: contributions.length,
      approved: contributions.filter((item) => item.status === "APPROVED").length,
      pending: contributions.filter((item) => item.status === "PENDING").length,
      rejected: contributions.filter((item) => item.status === "REJECTED").length,
    };
  }, [contributions]);

  const filteredContributions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return contributions.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        item.word?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.example?.toLowerCase().includes(keyword);

      return matchesStatus && matchesKeyword;
    });
  }, [contributions, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-72 w-full animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
        <div className="mb-6 rounded-2xl bg-blue-50 p-6 text-blue-500 shadow-inner">
          <Video size={48} strokeWidth={1.5} />
        </div>
        <h4 className="text-2xl font-black text-slate-900">Bạn chưa có đóng góp nào</h4>
        <p className="mt-3 max-w-sm text-slate-500 leading-relaxed">
          Hãy chia sẻ từ vựng và video ký hiệu của bạn để giúp cộng đồng học tập dễ hơn.
        </p>
        <button
          onClick={() => (window.location.href = "/dictionary")}
          className="mt-8 flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Đóng góp từ vựng ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-900">
              Tất cả đóng góp
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                {stats.total}
              </span>
            </h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Theo dõi trạng thái các từ vựng bạn đã gửi
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/dictionary")}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Đóng góp mới
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo từ vựng, mô tả hoặc ví dụ..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
            <SlidersHorizontal size={16} className="ml-2 shrink-0 text-slate-400" />
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black transition-all ${
                  statusFilter === filter.value
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredContributions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="font-bold text-slate-500">Không có đóng góp nào khớp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredContributions.map((item, index) => (
            <ContributionCard key={item.id ?? `${item.word}-${index}`} item={item} index={index} />
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-lg font-black uppercase tracking-widest text-blue-300">Thống kê cá nhân</h4>
            <p className="mt-1 text-sm text-slate-400">Tổng quan các đóng góp của bạn trên WeHear.</p>
          </div>
          <div className="grid grid-cols-4 gap-5 text-center">
            <StatItem icon={<Video size={16} />} value={stats.total} label="Tổng" color="text-white" />
            <StatItem icon={<CheckCircle size={16} />} value={stats.approved} label="Duyệt" color="text-emerald-300" />
            <StatItem icon={<Clock size={16} />} value={stats.pending} label="Chờ" color="text-amber-300" />
            <StatItem icon={<XCircle size={16} />} value={stats.rejected} label="Từ chối" color="text-rose-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div>
      <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ${color}`}>
        {icon}
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  );
}
