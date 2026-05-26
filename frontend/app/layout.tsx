import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { LOGO_URL } from "./lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Thành Vinh Studio | Chuyển văn bản thành giọng nói tiếng Việt",
  description: "Ứng dụng tổng hợp giọng nói tiếng Việt tiên tiến. Hỗ trợ đa giọng nói, clone giọng, đối thoại nhiều người. Chạy hoàn toàn trên máy tính của bạn.",
  icons: {
    icon: LOGO_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
