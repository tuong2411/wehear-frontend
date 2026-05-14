"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { User as UserType } from "@/types/auth";
import { 
  User, Mail, Phone, Camera, Save, Calendar, 
  ShieldCheck, Loader2, Settings, Share2, 
  Lock, CheckCircle2, MapPin, Globe, ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setUser(data);
      setFormData({
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        avatarUrl: data.avatarUrl || "",
      });
    } catch (error) {
      toast.error("Không thể tải thông tin cá nhân.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatarUrl: res.url }));
      toast.success("Đã cập nhật ảnh đại diện.");
      // Refresh to sync with navbar
      window.location.reload();
    } catch (error) {
      toast.error("Tải ảnh thất bại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userService.updateProfile(formData);
      toast.success("Cập nhật hồ sơ thành công!");
      fetchProfile();
    } catch (error) {
      toast.error("Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Đang tải dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="relative h-[300px] w-full overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, 5, 0] 
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
           ></motion.div>
        </div>

        <div className="max-w-6xl mx-auto h-full relative px-6 flex items-end">
           <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Floating Avatar */}
                <div className="relative -mb-4 md:-mb-0">
                  <div className="h-32 w-32 md:h-40 md:w-40 rounded-[32px] overflow-hidden border-[6px] border-white shadow-2xl bg-slate-50 relative group">
                    {formData.avatarUrl ? (
                      <Image 
                        src={formData.avatarUrl} 
                        alt="Avatar" 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-600 font-black text-5xl">
                        {user?.fullName?.charAt(0) || user?.username?.charAt(0)}
                      </div>
                    )}
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="text-white animate-spin" size={32} />
                      </div>
                    )}

                    {/* Change Avatar Overlay */}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-20">
                       <Camera className="text-white" size={28} />
                       <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                    </label>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
                </div>

                <div className="text-center md:text-left text-white space-y-2">
                   <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user?.fullName || "Người dùng mới"}</h1>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/20">
                         {user?.roleName === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                      </span>
                   </div>
                   <div className="flex items-center justify-center md:justify-start gap-4 text-white/70 text-sm font-bold">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} /> {user?.email}
                      </span>
                      <span className="hidden md:flex items-center gap-1.5">
                        <Calendar size={14} /> Gia nhập {new Date(user?.createdAt!).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      </span>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-bold border border-white/20 transition-all flex items-center justify-center gap-2">
                    <Share2 size={16} /> Chia sẻ
                 </button>
                 <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white text-blue-600 text-sm font-black shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <Settings size={16} /> Cài đặt
                 </button>
              </div>
           </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Personal Info & Edit Form */}
            <div className="lg:col-span-8 space-y-10">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm"
               >
                  <div className="flex items-center justify-between mb-10">
                     <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-900">Thông tin cá nhân</h2>
                        <p className="text-sm text-slate-400 font-medium">Cập nhật thông tin cơ bản và chi tiết hồ sơ của bạn.</p>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                           <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                 <User size={18} />
                              </div>
                              <input 
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder="Nhập họ và tên của bạn"
                              />
                           </div>
                        </div>

                        <div className="space-y-2.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                           <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                 <Phone size={18} />
                              </div>
                              <input 
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder="Nhập số điện thoại"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-medium italic">Các thay đổi sẽ được lưu ngay lập tức sau khi nhấn nút.</p>
                        <button 
                          type="submit"
                          disabled={isSaving}
                          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                           {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                           Lưu thay đổi
                        </button>
                     </div>
                  </form>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm"
               >
                  <div className="flex items-center justify-between mb-8">
                     <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                           Bảo mật & Xác thực
                        </h2>
                        <p className="text-sm text-slate-400 font-medium">Quản lý mật khẩu và bảo mật tài khoản của bạn.</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-100 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                              <Lock size={22} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">Đổi mật khẩu</p>
                              <p className="text-xs text-slate-400 font-medium">Nên cập nhật mật khẩu định kỳ mỗi 6 tháng.</p>
                           </div>
                        </div>
                        <button className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-600 transition-all">
                           <ArrowRight size={18} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                              <ShieldCheck size={22} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">Xác thực 2 yếu tố</p>
                              <p className="text-xs text-slate-400 font-medium">Hiện đang tắt. Bật để tăng cường bảo mật.</p>
                           </div>
                        </div>
                        <button className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                           Kích hoạt
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>

            {/* Right Column: Account Details */}
            <div className="lg:col-span-4 space-y-10">
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8"
               >
                  <h3 className="text-lg font-black text-slate-900 px-1">Chi tiết tài khoản</h3>

                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <User size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Tên đăng nhập</p>
                           <p className="text-sm font-bold text-slate-700">@{user?.username}</p>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                           <CheckCircle2 size={12} />
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <Mail size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Email chính</p>
                           <p className="text-sm font-bold text-slate-700">{user?.email}</p>
                        </div>
                        <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-md">Đã xác thực</span>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <ShieldCheck size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Vai trò</p>
                           <p className="text-sm font-bold text-slate-700">{user?.roleName === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Trạng thái</p>
                           <p className="text-sm font-bold text-slate-700">{user?.status === 1 ? 'Đang hoạt động' : 'Đã bị khóa'}</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                     <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                           <Globe size={14} />
                           <span className="text-[10px] font-black uppercase tracking-wider">Hồ sơ công khai</span>
                        </div>
                        <p className="text-xs text-blue-600/80 font-medium leading-relaxed">
                           Hồ sơ của bạn hiển thị với các thành viên khác trên bảng tin cộng đồng.
                        </p>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 }}
                 className="p-8 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-900/20"
               >
                  <h3 className="text-lg font-black mb-4">WeHear Premium</h3>
                  <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                     Mở khóa các mô hình dịch nâng cao và các khóa học ngôn ngữ ký hiệu độc quyền.
                  </p>
                  <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-900/20">
                     Nâng cấp ngay
                  </button>
               </motion.div>
            </div>
         </div>
      </main>
    </div>
  );
}

