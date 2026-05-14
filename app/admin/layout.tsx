"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { authService } from "@/services/authService";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      
      const isAdmin = user && (
        user.roleName?.toUpperCase() === "ADMIN" || 
        user.roleId === 1
      );

      if (!isAdmin) {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-bold animate-pulse text-slate-500 uppercase tracking-widest text-xs">Đang kiểm tra quyền quản trị...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Sidebar - Tách biệt hoàn toàn */}
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Chỉ của Admin */}
        <AdminHeader />
        
        {/* Content Area */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Tag Nhận diện Khu vực Quản trị */}
          <div className="max-w-7xl mx-auto mb-6 flex items-center space-x-2 text-blue-600">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Khu vực Quản trị Hệ thống
            </span>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
