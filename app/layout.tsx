import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Universe V11 – Siêu Di Động",
  description: "Hệ điều hành AI dành riêng cho đội content Siêu Di Động",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
