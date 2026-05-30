import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家族の教育・老後資金プランナー",
  description: "教育費（4人分）と老後2,000万円目標をリアルタイムにシミュレーション",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
