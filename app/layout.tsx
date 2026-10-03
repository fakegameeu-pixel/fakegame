import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Фейковая свадьба — Рига",
  description: "Театральное знакомство для тех, кто готов к красивой истории.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
