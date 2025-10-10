import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 👇 import thêm phần Providers (bỏ Navbar)
import Providers from "@/lib/providers";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EV Service Center",
  description: "EV Service Center Web Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Bọc toàn bộ app trong React Query Provider */}
        <Providers>
          <ErrorBoundary>
            {/* ✅ CHỈ CHỨA CHILDREN - KHÔNG CÒN NAVBAR */}
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
