"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  Database,
  Download,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  User,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getVslUploadVideoTrainingData,
  type VslUploadVideoRecord,
} from "@/services/vslUploadVideoService";

export default function AdminVslUploadVideosPage() {
  const [items, setItems] = useState<VslUploadVideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(500);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getVslUploadVideoTrainingData(limit);
      setItems(data);
    } catch {
      toast.error("Không thể tải video VSL đã lưu.");
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
    if (!keyword) return items;

    return items.filter((item) => [
      item.selectedLabel,
      item.videoUrl,
      item.username,
      item.userFullName,
    ].join(" ").toLowerCase().includes(keyword));
  }, [items, searchTerm]);

  const uniqueUsers = new Set(items.map((item) => item.userId)).size;
  const averageConfidence = items.length
    ? items.reduce((sum, item) => sum + Number(item.confidence ?? 0), 0) / items.length
    : 0;

  const escapeCsvCell = (value: string | number | null | undefined) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportJson = () => {
    const dataset = filteredItems.map((item) => ({
      video_url: item.videoUrl,
      label: item.selectedLabel,
      confidence: item.confidence,
      user_id: item.userId,
      username: item.username,
      created_at: item.createdAt,
    }));

    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vsl-upload-videos-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "User ID",
      "Username",
      "Họ tên",
      "Từ đã chọn",
      "Confidence",
      "Video URL",
      "Thời gian tạo",
    ];
    const rows = filteredItems.map((item) => [
      item.id,
      item.userId,
      item.username || "",
      item.userFullName || "",
      item.selectedLabel,
      item.confidence ?? "",
      item.videoUrl,
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
    link.download = `vsl-upload-videos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-slate-500">Đang tải video VSL đã lưu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-700">
              <Video size={14} />
              VSL Upload Training Data
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Video upload đã lưu</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Theo dõi video người dùng upload, từ người dùng chọn và URL Cloudinary để chuẩn bị dữ liệu kiểm thử hoặc train nhận diện.
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
              onClick={exportCsv}
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
        <StatCard icon={Database} label="Video đã lưu" value={items.length.toLocaleString("vi-VN")} />
        <StatCard icon={User} label="Người đóng góp" value={uniqueUsers.toLocaleString("vi-VN")} />
        <StatCard icon={Video} label="Độ tin cậy TB" value={`${averageConfidence.toFixed(1)}%`} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo từ đã chọn, URL video, người dùng..."
              className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
            />
          </div>
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
              <p className="mt-1 text-sm font-semibold text-slate-500">Thử đổi bộ lọc hoặc chờ người dùng lưu video mới.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Video</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Từ đã chọn</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Độ tin cậy</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Người lưu</th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="space-y-3">
                        <video
                          src={item.videoUrl}
                          controls
                          muted
                          className="aspect-video w-52 rounded-lg bg-slate-900 object-cover"
                        />
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink size={13} />
                          Mở Cloudinary
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-blue-950">
                        {item.selectedLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-emerald-600">
                        {typeof item.confidence === "number" ? `${item.confidence.toFixed(1)}%` : "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-slate-900">{item.userFullName || item.username || `User #${item.userId}`}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">@{item.username || item.userId}</p>
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
        File JSON gồm <code className="rounded bg-white/70 px-1">video_url</code>, <code className="rounded bg-white/70 px-1">label</code> và <code className="rounded bg-white/70 px-1">confidence</code>.
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
