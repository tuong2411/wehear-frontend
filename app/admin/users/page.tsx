"use client";

import { useEffect, useState, useMemo } from "react";
import { userService } from "@/services/userService";
import { User } from "@/types/auth";
import { 
  Search, UserPlus, MoreVertical, Trash2, Shield, 
  Lock, Unlock, RotateCcw, Eye, Mail, CheckCircle2, 
  XCircle, Filter, ChevronDown, UserCheck, Trash,
  Loader2, ShieldAlert, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { authService } from "@/services/authService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [lastUpdatedId, setLastUpdatedId] = useState<number | null>(null);
  const [me, setMe] = useState<User | null>(null);

  // Load Initial Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setMe(authService.getCurrentUser());
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtering & Sorting
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          user.username.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchRole = filterRole === "ALL" || user.roleName === filterRole;
      const matchStatus = filterStatus === "ALL" || user.status.toString() === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, debouncedSearch, filterRole, filterStatus]);

  // Actions
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 1 ? 0 : 1;
    try {
      await userService.updateUserStatus(user.id, newStatus);
      toast.success(newStatus === 1 ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      setLastUpdatedId(user.id);
      fetchData();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleResetPassword = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn đặt lại mật khẩu của người dùng này về mặc định?")) {
      try {
        await userService.resetPassword(id);
        toast.success("Đã đặt lại mật khẩu thành '123456'");
        setLastUpdatedId(id);
      } catch (error) {
        toast.error("Đặt lại mật khẩu thất bại");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (id === me?.id) return toast.error("Bạn không thể xóa chính mình!");
    if (confirm("Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?")) {
      try {
        await userService.deleteUser(id);
        toast.success("Đã xóa người dùng thành công");
        fetchData();
      } catch (error) {
        toast.error("Xóa người dùng thất bại");
      }
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (action === "delete" && selectedIds.includes(me?.id as number)) {
      return toast.error("Danh sách chọn chứa tài khoản của bạn. Vui lòng bỏ chọn chính mình trước khi xóa.");
    }
    
    if (confirm(`Thực hiện '${action}' cho ${selectedIds.length} mục đã chọn?`)) {
      try {
        await userService.bulkAction(selectedIds, action);
        toast.success("Thực hiện thao tác hàng loạt thành công");
        setSelectedIds([]);
        fetchData();
      } catch (error) {
        toast.error("Thao tác hàng loạt thất bại");
      }
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) setSelectedIds([]);
    else setSelectedIds(filteredUsers.map(u => u.id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Người dùng</h1>
          <p className="text-slate-500 font-medium mt-1">Hệ thống có tổng cộng {users.length} thành viên tham gia.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 group">
          <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
          <span>Thêm thành viên mới</span>
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-6">
            <span className="text-sm font-black px-3 py-1 bg-blue-500 rounded-lg">Đã chọn {selectedIds.length}</span>
            <div className="flex items-center gap-4">
              <button onClick={() => handleBulkAction("lock")} className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
                <Lock size={16} /> Khóa
              </button>
              <button onClick={() => handleBulkAction("unlock")} className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
                <Unlock size={16} /> Mở khóa
              </button>
              <button onClick={() => handleBulkAction("delete")} className="flex items-center gap-2 text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors">
                <Trash2 size={16} /> Xóa hàng loạt
              </button>
            </div>
          </div>
          <button onClick={() => setSelectedIds([])} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest">Hủy chọn</button>
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, username..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
            <Shield size={16} className="text-slate-400" />
            <select 
              className="bg-transparent text-sm font-bold outline-none text-slate-700 cursor-pointer"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="ALL">Tất cả Vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="USER">Người dùng</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
            <UserCheck size={16} className="text-slate-400" />
            <select 
              className="bg-transparent text-sm font-bold outline-none text-slate-700 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Trạng thái</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Đang bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" 
                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Thành viên</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Vai trò</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Ngày tham gia</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.15em] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-10 bg-slate-50 rounded-2xl w-full" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Search size={48} className="opacity-20" />
                      <p className="font-bold">Không tìm thấy người dùng nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`group transition-all duration-500 ${
                    lastUpdatedId === user.id ? 'bg-blue-50/80 ring-2 ring-inset ring-blue-100' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 cursor-pointer transition-all" 
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative ring-1 ring-slate-100 group-hover:scale-105 transition-transform">
                        {user.avatarUrl ? (
                          <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                        ) : (
                          <span className="text-lg font-black text-slate-300">{user.fullName[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                          {user.fullName}
                          {user.id === me?.id && <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-md">BẠN</span>}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">@{user.username} • {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      user.roleName === 'ADMIN' 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                      : 'bg-white text-slate-600 border-slate-200'
                    }`}>
                      {user.roleName === 'ADMIN' ? <ShieldCheck size={12} /> : <UserIcon size={12} />}
                      {user.roleName}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`flex items-center gap-2 text-xs font-bold ${user.status === 1 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${user.status === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {user.status === 1 ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ BỊ KHÓA'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500 italic">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <UserActionMenu 
                      user={user} 
                      isSelf={user.id === me?.id}
                      onToggleStatus={() => handleToggleStatus(user)}
                      onResetPassword={() => handleResetPassword(user.id)}
                      onDelete={() => handleDelete(user.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-component Menu dropdown cho từng user
function UserActionMenu({ user, isSelf, onToggleStatus, onResetPassword, onDelete }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-40 py-2 animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
              <Eye size={16} className="text-blue-500" /> Xem chi tiết
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
              <ShieldAlert size={16} className="text-indigo-500" /> Thay đổi vai trò
            </button>
            <button 
              onClick={() => { onToggleStatus(); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors hover:bg-slate-50 ${
                user.status === 1 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {user.status === 1 ? <Lock size={16} /> : <Unlock size={16} />}
              {user.status === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
            <button 
              onClick={() => { onResetPassword(); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <RotateCcw size={16} className="text-amber-500" /> Đặt lại mật khẩu
            </button>
            <div className="h-[1px] bg-slate-100 my-2" />
            <button 
              disabled={isSelf}
              onClick={() => { onDelete(); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${
                isSelf ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Trash2 size={16} /> Xóa người dùng
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function UserIcon({ size, className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
