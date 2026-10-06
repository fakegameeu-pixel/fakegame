import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingLanding } from "../components/WeddingLanding";
import { I18nProvider, type Locale } from "../lib/i18n";

const seo: Record<Locale, { title: string; description: string; keywords: string[] }> = {
  lv: {
    title: "Mākslīgās kāzas Rīgā | Teātra spēle un jaunas iepazīšanās",
    description: "Mākslīgās kāzas Rīgā — teatrāla lomu spēle, neparasts vakars un jaunas iepazīšanās. Piesakies pasākumam un pavadi laiku īpašā kompānijā.",
    keywords: ["Mākslīgās kāzas Rīga", "iepazīšanās pasākums Rīgā", "teātra spēle Rīgā", "ko darīt Rīgā", "neparasta ballīte Rīgā"],
  },
  ru: {
    title: "Фейковая свадьба в Риге | Театральная игра и новые знакомства",
    description: "Фейковая свадьба в Риге — театральная ролевая игра, необычная вечеринка и новые знакомства. Проведите приятный вечер в красивой компании.",
    keywords: ["фейковая свадьба Рига", "игра в Риге", "театральная игра Рига", "куда сходить в Риге", "интересно провести время Рига", "знакомства Рига", "необычная вечеринка Рига"],
  },
  en: {
    title: "Fake Wedding Riga | A theatrical game and new connections",
    description: "Fake Wedding Riga is a theatrical role-playing social event for new connections, a memorable party and a wonderful night out in Riga.",
    keywords: ["Fake Wedding Riga", "things to do in Riga", "social event Riga", "theatrical game Riga", "meet new people Riga", "unique party Riga"],
  },
};

function isLocale(value: string): value is Locale {
  return value === "lv" || value === "ru" || value === "en";
}

export function generateStaticParams() {
  return ["lv", "ru", "en"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const data = seo[locale];
  const languages = { lv: "/lv", ru: "/ru", en: "/en", "x-default": "/lv" };
  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    alternates: { canonical: `/${locale}`, languages },
    openGraph: { type: "website", title: data.title, description: data.description, locale: locale === "lv" ? "lv_LV" : locale === "ru" ? "ru_RU" : "en_US", alternateLocale: ["lv_LV", "ru_RU", "en_US"].filter((item) => !item.startsWith(locale)) },
  };
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <I18nProvider initialLocale={locale}><WeddingLanding /></I18nProvider>;
}
