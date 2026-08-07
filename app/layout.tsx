import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Universe V26 – Siêu Di Động",
  description: "Hệ điều hành AI của Siêu Di Động · Thiết kế và phát triển bởi Nguyễn Khánh Hải",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
