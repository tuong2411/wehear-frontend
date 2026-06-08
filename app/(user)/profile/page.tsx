"use client";

import { useEffect, useMemo, useState } from "react";
import { userService } from "@/services/userService";
import { User as UserType } from "@/types/auth";
import {
  Calendar,
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

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
      localStorage.setItem("user", JSON.stringify(data));
    } catch {
      toast.error("Không thể tải thông tin cá nhân.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = formData.fullName || user?.username || "Người dùng";
  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return "Chưa rõ";
    return new Date(user.createdAt).toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  }, [user?.createdAt]);

  const isActive = user?.status === 1 || String(user?.status) === "1";
  const roleLabel = user?.roleName === "ADMIN" ? "Quản trị viên" : "Thành viên";

  const syncStoredUser = (updates: Partial<UserType>) => {
    setUser((current) => {
      if (!current) return current;
      const nextUser = { ...current, ...updates };
      localStorage.setItem("user", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await userService.uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatarUrl: response.url }));
      syncStoredUser({ avatarUrl: response.url });
      toast.success("Đã cập nhật ảnh đại diện.");
    } catch {
      toast.error("Tải ảnh thất bại.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên.");
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateProfile(formData);
      syncStoredUser({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        avatarUrl: formData.avatarUrl,
      });
      toast.success("Cập nhật hồ sơ thành công.");
    } catch {
      toast.error("Cập nhật hồ sơ thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-50 border-t-blue-600" />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Đang tải hồ sơ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-blue-700 bg-blue-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-xl">
                {formData.avatarUrl ? (
                  <Image src={formData.avatarUrl} alt={displayName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-black uppercase text-blue-600">
                    {displayName.charAt(0)}
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}

                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                  <Camera className="text-white" size={28} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>

            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                {roleLabel}
              </div>
              <h1 className="text-4xl font-black tracking-tight">{displayName}</h1>
              <div className="mt-3 flex flex-col gap-2 text-sm font-bold text-blue-100 md:flex-row md:items-center md:gap-5">
                <span className="flex items-center gap-2">
                  <Mail size={15} />
                  {user?.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={15} />
                  Gia nhập {joinedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-900">Thông tin cá nhân</h2>
              <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin cơ bản hiển thị trong tài khoản WeHear.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ProfileField
                  label="Họ và tên"
                  icon={<User size={18} />}
                  value={formData.fullName}
                  placeholder="Nhập họ và tên"
                  onChange={(value) => setFormData((prev) => ({ ...prev, fullName: value }))}
                />

                <ProfileField
                  label="Số điện thoại"
                  icon={<Phone size={18} />}
                  value={formData.phoneNumber}
                  placeholder="Nhập số điện thoại"
                  inputMode="tel"
                  onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))}
                />
              </div>

              <ReadonlyField label="Email" value={user?.email || ""} icon={<Mail size={18} />} />

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">Thông tin mới sẽ được lưu ngay sau khi bạn nhấn nút lưu.</p>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-black text-slate-900">Chi tiết tài khoản</h3>
            <div className="space-y-5">
              <AccountDetail icon={<ShieldCheck size={19} />} label="Vai trò" value={roleLabel} />
              <AccountDetail
                icon={<CheckCircle2 size={19} />}
                label="Trạng thái"
                value={isActive ? "Đang hoạt động" : "Đã bị khóa"}
                accent={isActive ? "text-emerald-600" : "text-slate-500"}
              />
              <AccountDetail icon={<Calendar size={19} />} label="Ngày tham gia" value={joinedDate} />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="text-lg font-black text-blue-900">Hồ sơ công khai</h3>
            <p className="mt-2 text-sm leading-relaxed text-blue-700">
              Ảnh đại diện, tên hiển thị và vai trò của bạn có thể xuất hiện trong các khu vực cộng đồng.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function ProfileField({
  label,
  icon,
  value,
  placeholder,
  inputMode,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <span className="relative block">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</span>
        <input
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50"
        />
      </span>
    </label>
  );
}

function ReadonlyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 font-bold text-slate-500">
        <span className="text-slate-300">{icon}</span>
        <span className="min-w-0 truncate">{value}</span>
      </div>
    </div>
  );
}

function AccountDetail({
  icon,
  label,
  value,
  accent = "text-slate-700",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</p>
        <p className={`truncate text-sm font-bold ${accent}`}>{value}</p>
      </div>
    </div>
  );
}
