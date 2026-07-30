import "./globals.css";
export const metadata = { title: "Content Universe V6", description: "Siêu Di Động Content OS" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="vi"><body>{children}</body></html>;
}
