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
    title: "Mākslīgās kāzas — Rīga",
    description: "Teatralizēts iepazīšanās pasākums tiem, kuri ir gatavi skaistam stāstam.",
  },
  ru: {
    title: "Фейковая свадьба — Рига",
    description: "Театральное знакомство для тех, кто готов к красивой истории.",
  },
  en: {
    title: "Fake Wedding — Riga",
    description: "A theatrical social event for people ready for a beautiful story.",
  },
};

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
} | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("lv");
  useEffect(() => {
    const saved = window.localStorage.getItem(
      "fakewedding-locale",
    ) as Locale | null;
    if (saved && saved in translations) {
      setLocale(saved);
      return;
    }
    const browser = navigator.language.toLowerCase();
    setLocale(
      browser.startsWith("ru") ? "ru" : browser.startsWith("en") ? "en" : "lv",
    );
  }, []);
  const selectLocale = (next: Locale) => {
    window.localStorage.setItem("fakewedding-locale", next);
    setLocale(next);
  };
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
