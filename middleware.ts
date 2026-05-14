import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bảo vệ các route bắt đầu bằng /admin
  if (pathname.startsWith('/admin')) {
    // Lấy cookie hoặc token (ở đây ta giả định token/user lưu trong cookie để Middleware đọc được)
    // Nếu dùng localStorage, Middleware sẽ không đọc được (vì chạy ở Server).
    // Giải pháp tạm thời cho Client-side: Kiểm tra ở Layout hoặc dùng Cookie.
    
    // Tuy nhiên, Next.js Middleware thường dùng Cookie để bảo mật hơn.
    // Tạm thời tôi sẽ để đây là cấu trúc mẫu, ta sẽ dùng Client-side check ở Layout Admin cho đơn giản với logic hiện tại của bạn.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
