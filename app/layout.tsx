import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "WeHear",
  description: "Nền tảng dịch ngôn ngữ ký hiệu tiếng Việt bằng AI",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* Navbar và Footer đã được dời vào Layout của từng nhóm Route (public/user) */}
        {children}
      </body>
    </html>
  );
}
