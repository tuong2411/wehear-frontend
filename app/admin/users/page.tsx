"use client";

import { useEffect, useState, useMemo } from "react";
import { userService } from "@/services/userService";
import { RegisterRequest, User } from "@/types/auth";
import { 
  Search, UserPlus, MoreVertical, Trash2, Shield, 
  Lock, Unlock, RotateCcw, Eye, Mail, CheckCircle2, 
  XCircle, Filter, ChevronDown, UserCheck, Trash,
  Loader2, ShieldAlert, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { authService } from "@/services/authService";

type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "amber" | "rose" | "blue";
  onConfirm: () => Promise<void>;
};

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
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [createForm, setCreateForm] = useState<RegisterRequest>({
    username: "",
    password: "123456",
    email: "",
    fullName: "",
    phoneNumber: "",
  });

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
    if (user.id === me?.id && newStatus === 0) {
      return toast.error("Bạn không thể tự khóa tài khoản của chính mình");
    }

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
    const targetUser = users.find(user => user.id === id);
    setConfirmAction({
      title: "Đặt lại mật khẩu",
      description: `WeHear sẽ đặt mật khẩu của ${targetUser?.fullName || "người dùng này"} về mặc định: 123456.`,
      confirmLabel: "Đặt lại mật khẩu",
      tone: "amber",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await userService.resetPassword(id);
          toast.success("Đã đặt lại mật khẩu thành 123456");
          setLastUpdatedId(id);
          setConfirmAction(null);
        } catch (error) {
          toast.error("Đặt lại mật khẩu thất bại");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDelete = async (id: number) => {
    if (id === me?.id) return toast.error("Bạn không thể xóa chính mình");
    const targetUser = users.find(user => user.id === id);
    setConfirmAction({
      title: "Xóa người dùng",
      description: `Tài khoản ${targetUser?.fullName || "này"} sẽ bị vô hiệu hóa và ẩn thông tin cá nhân. Các đóng góp, bài viết và lịch sử liên quan vẫn được giữ để tránh lỗi dữ liệu.`,
      confirmLabel: "Xóa người dùng",
      tone: "rose",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await userService.deleteUser(id);
          toast.success("Đã vô hiệu hóa và ẩn thông tin người dùng");
          setConfirmAction(null);
          fetchData();
        } catch (error) {
          toast.error("Xóa người dùng thất bại");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleCreateUser = async () => {
    if (!createForm.username.trim() || !createForm.email.trim() || !createForm.fullName.trim() || !createForm.password.trim()) {
      return toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }

    try {
      setActionLoading(true);
      await userService.createUser(createForm);
      toast.success("Đã thêm thành viên mới");
      setIsCreateOpen(false);
      setCreateForm({ username: "", password: "123456", email: "", fullName: "", phoneNumber: "" });
      fetchData();
    } catch (error) {
      toast.error("Thêm thành viên thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (user: User, roleId: number) => {
    if (user.id === me?.id) return toast.error("Bạn không thể đổi vai trò của chính mình");

    try {
      setActionLoading(true);
      await userService.updateUserRole(user.id, roleId);
      toast.success("Đã cập nhật vai trò");
      setRoleUser(null);
      setLastUpdatedId(user.id);
      fetchData();
    } catch (error) {
      toast.error("Cập nhật vai trò thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (action === "lock" && selectedIds.includes(me?.id as number)) {
      return toast.error("Danh sách chọn chứa tài khoản của bạn. Vui lòng bỏ chọn chính mình trước khi khóa.");
    }

    if (action === "delete" && selectedIds.includes(me?.id as number)) {
      return toast.error("Danh sách chọn chứa tài khoản của bạn. Vui lòng bỏ chọn chính mình trước khi xóa.");
    }

    const actionCopy: Record<string, { title: string; label: string; tone: "amber" | "rose" | "blue"; verb: string }> = {
      lock: { title: "Khóa tài khoản đã chọn", label: "Khóa tài khoản", tone: "amber", verb: "khóa" },
      unlock: { title: "Mở khóa tài khoản đã chọn", label: "Mở khóa", tone: "blue", verb: "mở khóa" },
      delete: { title: "Xóa người dùng đã chọn", label: "Xóa hàng loạt", tone: "rose", verb: "vô hiệu hóa và ẩn thông tin" },
    };
    const copy = actionCopy[action] || actionCopy.lock;

    setConfirmAction({
      title: copy.title,
      description: `WeHear sẽ ${copy.verb} ${selectedIds.length} tài khoản đang được chọn.`,
      confirmLabel: copy.label,
      tone: copy.tone,
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await userService.bulkAction(selectedIds, action);
          toast.success("Thực hiện thao tác hàng loạt thành công");
          setSelectedIds([]);
          setConfirmAction(null);
          fetchData();
        } catch (error) {
          toast.error("Thao tác hàng loạt thất bại");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const toggleSelect = (id: number) => {
    if (id === me?.id) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const selectableIds = filteredUsers.filter(u => u.id !== me?.id).map(u => u.id);
    if (selectableIds.length > 0 && selectedIds.length === selectableIds.length) setSelectedIds([]);
    else setSelectedIds(selectableIds);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Người dùng</h1>
          <p className="text-slate-500 font-medium mt-1">Hệ thống có tổng cộng {users.length} thành viên tham gia.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 group"
        >
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
                    checked={
                      filteredUsers.some(user => user.id !== me?.id) &&
                      selectedIds.length === filteredUsers.filter(user => user.id !== me?.id).length
                    }
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
                      className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-40" 
                      disabled={user.id === me?.id}
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
                    <UserActionMenu2 
                      user={user} 
                      isSelf={user.id === me?.id}
                      onView={() => setDetailUser(user)}
                      onChangeRole={() => setRoleUser(user)}
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

      {detailUser && (
        <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />
      )}

      {roleUser && (
        <RoleModal
          user={roleUser}
          loading={actionLoading}
          onClose={() => setRoleUser(null)}
          onSubmit={(roleId) => handleChangeRole(roleUser, roleId)}
        />
      )}

      {isCreateOpen && (
        <CreateUserModal
          form={createForm}
          loading={actionLoading}
          onChange={setCreateForm}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {confirmAction && (
        <ConfirmActionModal
          action={confirmAction}
          loading={actionLoading}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

// Sub-component Menu dropdown cho từng user
function UserActionMenu({ user, isSelf, onView, onChangeRole, onToggleStatus, onResetPassword, onDelete }: any) {
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

function UserActionMenu2({ user, isSelf, onView, onChangeRole, onToggleStatus, onResetPassword, onDelete }: any) {
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
            <button
              onClick={() => { onView(); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Eye size={16} className="text-blue-500" /> Xem chi tiết
            </button>
            <button
              disabled={isSelf}
              onClick={() => { onChangeRole(); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${
                isSelf ? "text-slate-300 cursor-not-allowed" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ShieldAlert size={16} className="text-indigo-500" /> Đổi vai trò
            </button>
            <button
              disabled={isSelf}
              onClick={() => { onToggleStatus(); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors hover:bg-slate-50 ${
                isSelf ? "text-slate-300 cursor-not-allowed" : user.status === 1 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {user.status === 1 ? <Lock size={16} /> : <Unlock size={16} />}
              {isSelf ? "Không thể tự khóa" : user.status === 1 ? "Khóa tài khoản" : "Mở khóa tài khoản"}
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
                isSelf ? "text-slate-300 cursor-not-allowed" : "text-rose-600 hover:bg-rose-50"
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

function ConfirmActionModal({ action, loading, onClose }: { action: ConfirmAction; loading: boolean; onClose: () => void }) {
  const toneClass = {
    amber: {
      icon: "bg-amber-50 text-amber-600 ring-amber-100",
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600 ring-rose-100",
      button: "bg-rose-600 hover:bg-rose-700 shadow-rose-100",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600 ring-blue-100",
      button: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
    },
  }[action.tone];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start gap-4">
          <div className={`rounded-2xl p-3 ring-8 ${toneClass.icon}`}>
            <ShieldAlert size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">WeHear Admin</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{action.title}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{action.description}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
          Hãy kiểm tra kỹ trước khi xác nhận. Thao tác này sẽ được ghi nhận trong hệ thống WeHear.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={action.onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${toneClass.button}`}
          >
            {loading ? "Đang xử lý..." : action.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <XCircle size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const rows = [
    ["Họ tên", user.fullName],
    ["Username", user.username],
    ["Email", user.email],
    ["Số điện thoại", user.phoneNumber || "Chưa cập nhật"],
    ["Vai trò", user.roleName],
    ["Trạng thái", user.status === 1 ? "Đang hoạt động" : "Đã bị khóa"],
    ["Ngày tham gia", new Date(user.createdAt).toLocaleDateString("vi-VN")],
  ];

  return (
    <ModalShell title="Chi tiết người dùng" onClose={onClose}>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-right text-sm font-bold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function RoleModal({ user, loading, onClose, onSubmit }: { user: User; loading: boolean; onClose: () => void; onSubmit: (roleId: number) => void }) {
  const [roleId, setRoleId] = useState(user.roleId);

  return (
    <ModalShell title="Đổi vai trò" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm font-medium text-slate-500">Chọn vai trò mới cho <span className="font-bold text-slate-900">{user.fullName}</span>.</p>
        <select
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
          className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-blue-500"
        >
          <option value={1}>ADMIN</option>
          <option value={2}>USER</option>
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">Hủy</button>
          <button disabled={loading} onClick={() => onSubmit(roleId)} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function CreateUserModal({ form, loading, onChange, onClose, onSubmit }: {
  form: RegisterRequest;
  loading: boolean;
  onChange: (form: RegisterRequest) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const setField = (key: keyof RegisterRequest, value: string) => onChange({ ...form, [key]: value });

  return (
    <ModalShell title="Thêm thành viên mới" onClose={onClose}>
      <div className="space-y-4">
        <input value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Họ tên" className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-blue-500" />
        <input value={form.username} onChange={(e) => setField("username", e.target.value)} placeholder="Username" className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-blue-500" />
        <input value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="Email" type="email" className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-blue-500" />
        <input value={form.phoneNumber || ""} onChange={(e) => setField("phoneNumber", e.target.value)} placeholder="Số điện thoại" className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-blue-500" />
        <input value={form.password} onChange={(e) => setField("password", e.target.value)} placeholder="Mật khẩu" type="text" className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-blue-500" />
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">Hủy</button>
          <button disabled={loading} onClick={onSubmit} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? "Đang tạo..." : "Tạo thành viên"}
          </button>
        </div>
      </div>
    </ModalShell>
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
