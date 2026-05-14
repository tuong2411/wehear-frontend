"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/auth";
import { authService } from "@/services/authService";
import { Bell, Search, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default function AdminHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-96">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent border-none outline-none w-full text-sm"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.fullName || "Admin"}</p>
            <p className="text-xs text-gray-500 uppercase">{user?.roleName || "Quản trị viên"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt="Avatar" width={40} height={40} />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
