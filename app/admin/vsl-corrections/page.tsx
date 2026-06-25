"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CalendarClock,
  Database,
  Download,
  FileSpreadsheet,
  FileJson,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getVslTranslationTrainingData,
  type VslTranslationCorrection,
} from "@/services/vslCorrectionService";
import { VSL_TRANSLATION_MODELS, type VslTranslationModel } from "@/services/vslTranslationService";

const ALL_MODELS = "all";

export default function AdminVslCorrectionsPage() {
  const [items, setItems] = useState<VslTranslationCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState<typeof ALL_MODELS | VslTranslationModel>(ALL_MODELS);
  const [limit, setLimit] = useState(500);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getVslTranslationTrainingData(limit);
      setItems(data);
    } catch {
      toast.error("Không thể tải lịch sử bản dịch đã lưu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesModel = modelFilter === ALL_MODELS || item.modelName === modelFilter;
      const haystack = [
        item.sourceText,
        item.modelTranslation,
        item.correctedTranslation,
        item.username,
        item.userFullName,
      ].join(" ").toLowerCase();

      return matchesModel && (!keyword || haystack.includes(keyword));
    });
  }, [items, modelFilter, searchTerm]);

  const changedCount = items.filter((item) => item.modelTranslation.trim() !== item.correctedTranslation.trim()).length;
  const uniqueUsers = new Set(items.map((item) => item.userId)).size;

  const exportJson = () => {
    const dataset = filteredItems.map((item) => ({
      input: item.sourceText,
      target: item.correctedTranslation,
      model_prediction: item.modelTranslation,
      model_name: item.modelName,
      user_id: item.userId,
      created_at: item.createdAt,
    }));

    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vsl-corrections-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const escapeCsvCell = (value: string | number | undefined) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportExcelCsv = () => {
    const headers = [
      "ID",
      "User ID",
      "Username",
      "Họ tên",
      "Chuỗi VSL",
      "Kết quả model",
      "Bản đã lưu",
      "Model",
      "Thời gian tạo",
    ];
    const rows = filteredItems.map((item) => [
      item.id,
      item.userId,
      item.username || "",
      item.userFullName || "",
      item.sourceText,
      item.modelTranslation,
      item.correctedTranslation,
      item.modelName,
      new Date(item.createdAt).toLocaleString("vi-VN"),
    ]);

    const csv = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ].join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vsl-corrections-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-slate-500">Đang tải lịch sử bản dịch...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-700">
              <BrainCircuit size={14} />
              VSL Training Data
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Lịch sử bản dịch đã lưu</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Theo dõi các câu VSL người dùng đã chỉnh sửa và lưu lại. Dữ liệu này có thể xuất ra JSON để chuẩn bị fine-tune mô hình dịch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={refreshing}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={exportJson}
              disabled={filteredItems.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <Download size={16} />
              Tải JSON
            </button>
            <button
              type="button"
              onClick={exportExcelCsv}
              disabled={filteredItems.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              Tải Excel
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Database} label="Bản đã lưu" value={items.length.toLocaleString("vi-VN")} />
        <StatCard icon={Sparkles} label="Có chỉnh sửa" value={changedCount.toLocaleString("vi-VN")} />
        <StatCard icon={User} label="Người đóng góp" value={uniqueUsers.toLocaleString("vi-VN")} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo câu VSL, bản dịch, người dùng..."
              className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
            />
          </div>
          <select
            value={modelFilter}
            onChange={(event) => setModelFilter(event.target.value as typeof ALL_MODELS | VslTranslationModel)}
            className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
          >
            <option value={ALL_MODELS}>Tất cả model</option>
            {VSL_TRANSLATION_MODELS.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
          >
            <option value={100}>100 dòng gần nhất</option>
            <option value={500}>500 dòng gần nhất</option>
            <option value={1000}>1000 dòng gần nhất</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {filteredItems.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Chưa có dữ liệu phù hợp</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">Thử đổi bộ lọc hoặc chờ người dùng lưu bản dịch mới.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Người lưu</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Chuỗi VSL</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Model trả về</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Bản đã lưu</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Model</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-slate-900">{item.userFullName || item.username || `User #${item.userId}`}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">@{item.username || item.userId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <TextBlock text={item.sourceText} tone="blue" />
                    </td>
                    <td className="px-5 py-4">
                      <TextBlock text={item.modelTranslation} tone="slate" />
                    </td>
                    <td className="px-5 py-4">
                      <TextBlock text={item.correctedTranslation} tone="emerald" />
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-black uppercase text-violet-700">
                        {item.modelName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <CalendarClock size={16} />
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
        <FileJson className="mr-2 inline-block" size={18} />
        File JSON dùng schema <code className="rounded bg-white/70 px-1">input</code> và <code className="rounded bg-white/70 px-1">target</code> cho pipeline train/fine-tune.
        File Excel được xuất dạng CSV UTF-8 có thể mở trực tiếp bằng Microsoft Excel.
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function TextBlock({ text, tone }: { text: string; tone: "blue" | "slate" | "emerald" }) {
  const toneClass = {
    blue: "border-blue-100 bg-blue-50 text-blue-950",
    slate: "border-slate-100 bg-slate-50 text-slate-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-950",
  }[tone];

  return (
    <p className={`max-w-xs rounded-lg border px-3 py-2 text-sm font-bold leading-6 ${toneClass}`}>
      {text}
    </p>
  );
}
