"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Book, 
  HelpCircle, 
  Newspaper
} from "lucide-react";

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
    <aside className="sticky top-20 flex h-[calc(100vh-5rem)] w-64 flex-col border-r bg-white">
      <div className="p-6 border-b">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          WeHear Admin
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
    </aside>
  );
}
