"use client";

import { useEffect, useState, useCallback } from "react";
import { dictionaryService, PaginatedResponse } from "@/services/dictionaryService";
import { SignDictionary } from "@/types/dictionary";
import { 
  Search, Plus, Filter, MoreVertical, Edit, Trash2, 
  CheckCircle2, XCircle, FileDown, Eye, ChevronLeft, 
  ChevronRight, Database, AlertCircle, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function AdminDictionaryPage() {
  const [data, setData] = useState<PaginatedResponse<SignDictionary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [region, setRegion] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lastUpdatedId, setLastUpdatedId] = useState<number | null>(null);

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    return `${baseUrl}${url}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dictionaryService.getAllSigns(page, 15, debouncedSearch, region);
      setData(response);
    } catch (error) {
      toast.error("Không thể tải danh sách từ điển");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, region]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleStatus = async (sign: SignDictionary) => {
    try {
      await dictionaryService.updateStatus(sign.id, !sign.isActive);
      toast.success(sign.isActive ? "Đã ẩn từ vựng" : "Đã hiển thị từ vựng");
      setLastUpdatedId(sign.id);
      fetchData();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa từ vựng này?")) {
      try {
        await dictionaryService.deleteSign(id);
        toast.success("Đã xóa từ vựng thành công");
        fetchData();
      } catch (error) {
        toast.error("Xóa từ vựng thất bại");
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (confirm(`Thực hiện '${action}' cho ${selectedIds.length} mục đã chọn?`)) {
      try {
        await dictionaryService.bulkAction(selectedIds, action);
        toast.success("Thao tác hàng loạt thành công");
        setSelectedIds([]);
        fetchData();
      } catch (error) {
        toast.error("Thao tác hàng loạt thất bại");
      }
    }
  };

  const handleImport = async () => {
    if (confirm("Bạn có muốn import dữ liệu từ dataset chuẩn? (Hành động này có thể mất thời gian)")) {
      const toastId = toast.loading("Đang import dữ liệu...");
      try {
        await dictionaryService.importDataset();
        toast.success("Import dữ liệu thành công", { id: toastId });
        fetchData();
      } catch (error) {
        toast.error("Import thất bại", { id: toastId });
      }
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (data && selectedIds.length === data.items.length) setSelectedIds([]);
    else if (data) setSelectedIds(data.items.map(s => s.id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Từ điển</h1>
          <p className="text-slate-500 font-medium mt-1">Quản lý hệ thống từ vựng và video ký hiệu ({data?.totalItems || 0} từ).</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleImport}
            className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <Database size={18} />
            <span>Import Dataset</span>
          </button>
          <Link 
            href="/admin/dictionary/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Thêm từ mới</span>
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-black px-3 py-1 bg-blue-600 rounded-lg">Đã chọn {selectedIds.length}</span>
            <div className="flex items-center gap-4">
              <button onClick={() => handleBulkAction("activate")} className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">
                <CheckCircle2 size={16} /> Hiện
              </button>
              <button onClick={() => handleBulkAction("deactivate")} className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300">
                <XCircle size={16} /> Ẩn
              </button>
              <button onClick={() => handleBulkAction("delete")} className="flex items-center gap-2 text-sm font-bold text-rose-400 hover:text-rose-300">
                <Trash2 size={16} /> Xóa hàng loạt
              </button>
            </div>
          </div>
          <button onClick={() => setSelectedIds([])} className="text-xs font-bold text-slate-500 hover:text-white uppercase">Hủy</button>
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm từ vựng hoặc mã nhãn..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="bg-transparent text-sm font-bold outline-none text-slate-700 cursor-pointer"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="all">Tất cả vùng miền</option>
              <option value="Miền Bắc">Miền Bắc</option>
              <option value="Miền Trung">Miền Trung</option>
              <option value="Miền Nam">Miền Nam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" 
                    checked={data ? selectedIds.length === data.items.length && data.items.length > 0 : false}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Từ vựng</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Video</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Vùng miền</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Độ khó</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-10"><div className="h-10 bg-slate-50 rounded-2xl w-full" /></td>
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="font-bold text-slate-400">Không tìm thấy từ vựng nào</p>
                  </td>
                </tr>
              ) : data?.items.map((sign) => (
                <tr 
                  key={sign.id} 
                  className={`group transition-all duration-500 ${
                    lastUpdatedId === sign.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-300 text-blue-600" 
                      checked={selectedIds.includes(sign.id)}
                      onChange={() => toggleSelect(sign.id)}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{sign.signWord}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{sign.labelCode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="w-16 h-10 bg-slate-100 rounded-lg mx-auto flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 relative group-hover:scale-110 transition-transform">
                      {sign.media?.[0] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                          <Eye size={16} className="text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <video src={getFullUrl(sign.media[0].mediaUrl)} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <AlertCircle size={16} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600 uppercase">
                    {sign.region}
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 bg-slate-100 text-[10px] font-black rounded uppercase text-slate-500">
                      {sign.difficultyLevel}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => handleToggleStatus(sign)}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                        (sign.isActive === true || String(sign.isActive) === "1") ? "text-emerald-600" : "text-amber-500"
                      }`}
                    >
                      {(sign.isActive === true || String(sign.isActive) === "1") ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {(sign.isActive === true || String(sign.isActive) === "1") ? "Hiển thị" : "Đang ẩn"}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Link 
                        href={`/dictionary/${sign.id}`} 
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link 
                        href={`/admin/dictionary/${sign.id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(sign.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">
              Trang {data.currentPage + 1} / {data.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={page === data.totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
