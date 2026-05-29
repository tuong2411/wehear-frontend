"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Book, 
  HelpCircle, 
  Newspaper,
  LogOut,
  ExternalLink
} from "lucide-react";
import { authService } from "@/services/authService";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  { icon: BookOpen, label: "Bài học", href: "/admin/lessons" },
  { icon: Book, label: "Từ điển", href: "/admin/dictionary" },
  { icon: HelpCircle, label: "Đóng góp", href: "/admin/dictionary/contributions" },
  { icon: Users, label: "Cộng đồng", href: "/admin/community" },
  { icon: HelpCircle, label: "Câu đố", href: "/admin/quizzes" },
  { icon: Newspaper, label: "Tin tức", href: "/admin/news" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          WeHear Admin
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/lessons"
          className="mb-2 flex items-center space-x-3 p-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ExternalLink size={20} />
          <span className="font-medium">Xem trang người dùng</span>
        </Link>
        <button
          onClick={() => authService.logout()}
          className="flex items-center space-x-3 p-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
