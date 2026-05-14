import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Đăng nhập | Wehear",
  description: "Đăng nhập vào hệ thống Wehear",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-indigo-50 blur-[120px]" />
      </div>
      
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={<div className="w-full max-w-md h-96 bg-white animate-pulse rounded-2xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
