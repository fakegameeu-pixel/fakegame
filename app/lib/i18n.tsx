"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { translations, type Translation } from "../locales";

export type Locale = "lv" | "ru" | "en";

const pageMetadata: Record<Locale, { title: string; description: string }> = {
  lv: {
    title: "Mākslīgās kāzas Rīgā | Teātra spēle un jaunas iepazīšanās",
    description: "Mākslīgās kāzas Rīgā — teatrāla lomu spēle, neparasts vakars un jaunas iepazīšanās.",
  },
  ru: {
    title: "Фейковая свадьба в Риге | Театральная игра и новые знакомства",
    description: "Фейковая свадьба в Риге — театральная ролевая игра, необычная вечеринка и новые знакомства.",
  },
  en: {
    title: "Fake Wedding Riga | A theatrical game and new connections",
    description: "Fake Wedding Riga is a theatrical role-playing social event for new connections and a memorable night out.",
  },
};

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
} | null>(null);

export function I18nProvider({
  children,
  initialLocale = "lv",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const selectLocale = (next: Locale) => setLocale(next);
  useEffect(() => {
    const { title, description } = pageMetadata[locale];
    document.title = title;
    document.documentElement.lang = locale;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [locale]);
  return (
    <I18nContext.Provider
      value={{ locale, setLocale: selectLocale, t: translations[locale] }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
