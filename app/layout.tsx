import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeHear",
  description:
    "N\u1ec1n t\u1ea3ng d\u1ecbch ng\u00f4n ng\u1eef k\u00fd hi\u1ec7u ti\u1ebfng Vi\u1ec7t b\u1eb1ng AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
