import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "投资智慧 - 顶级投资大佬的思想分享",
  description: "整理分享巴菲特、查理芒格等顶级投资大佬的文章、观点和建议",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
