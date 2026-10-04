import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mākslīgās kāzas — Rīga | Фейковая свадьба — Рига | Fake Wedding — Riga",
  description:
    "Mākslīgās kāzas Rīgā — teatralizēts iepazīšanās pasākums. Фейковая свадьба в Риге — театральное знакомство. Fake Wedding in Riga — a theatrical social event.",
  keywords: [
    "Mākslīgās kāzas Rīga",
    "mākslīgās kāzas",
    "iepazīšanās pasākums Rīgā",
    "Фейковая свадьба Рига",
    "знакомства Рига",
    "театральное мероприятие Рига",
    "Fake Wedding Riga",
    "Riga social event",
    "theatrical event Riga",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "Mākslīgās kāzas — Rīga | Fake Wedding — Riga",
    description:
      "Theatrical social event for people ready for a beautiful story.",
    locale: "lv_LV",
    alternateLocale: ["ru_RU", "en_US"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
