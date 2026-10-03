"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Locale = "lv" | "ru" | "en";

const translations = {
  lv: {
    hero: { title: "Mākslīgās", script: "kāzas", subtitle: "nepazīstamiem cilvēkiem", cta: "Saņemt ielūgumu", noteTop: "Līgava un līgavainis", noteMiddle: "ieraudzīs viens otru", noteFirst: "pirmo reizi", noteBottom: "tieši šajās kāzās" },
    nav: { about: "Par notikumu", details: "Detaļas" },
    intro: "Varbūt tieši šeit\natradīsi savu mīlestību",
    perks: ["Teātra\nspēle", "Iejūties\nlomā", "Jaunas\npažīšanās"],
    story: { eyebrow: "Ne tikai ballīte", title: "Vienas kāzas.", script: "Daudz stāstu.", text: "Tu saņemsi ielūgumu, lomu un iemeslu saposties. Pārējais notiks pats — vakariņās, mūzikā un sarunās līdz vēlai naktij." },
    details: { eyebrow: "Saglabā datumu", date: "datums", place: "vieta", guests: "viesu skaits", price: "no personas", reserve: "Rezervēt vietu", city: "Rīga", limited: "Ierobežots" },
    footer: { contact: "Saziņa un jautājumi", privacy: "Privātuma politika" },
    modal: { eyebrow: "Tavs ielūgums", title: "Atstāj kontaktus", text: "Nosūtīsim tev slepeno kāzu detaļas.", name: "Tavs vārds", email: "E-pasts", phone: "Tālrunis", consentStart: "Piekrītu", policyLink: "personas datu apstrādes politikai", submit: "Saņemt ielūgumu", sending: "Sūta...", error: "Neizdevās nosūtīt. Lūdzu, mēģini vēlreiz.", success: "Tiksimies kāzās!", successText: "Mēs ar tevi sazināsimies un pastāstīsim par nākamo soli." },
  },
  ru: {
    hero: { title: "Фейковая", script: "свадьба", subtitle: "для незнакомых людей", cta: "Получить приглашение", noteTop: "Невеста и жених", noteMiddle: "увидят друг друга", noteFirst: "впервые", noteBottom: "именно на этой свадьбе" },
    nav: { about: "О событии", details: "Детали" }, intro: "Возможно, и ты здесь\nнайдёшь свою любовь", perks: ["Театральная\nигра", "Вжиться\nв роль", "Новые\nзнакомства"],
    story: { eyebrow: "Не просто вечеринка", title: "Одна свадьба.", script: "Много историй.", text: "Вы получите приглашение, роль и повод нарядиться. Остальное случится само — за ужином, под музыку и в разговорах до поздней ночи." },
    details: { eyebrow: "Сохраните дату", date: "дата", place: "локация", guests: "количество гостей", price: "с человека", reserve: "Забронировать место", city: "Рига", limited: "Ограничено" }, footer: { contact: "Связь и вопросы", privacy: "Политика обработки данных" },
    modal: { eyebrow: "Ваше приглашение", title: "Оставьте контакты", text: "И мы отправим вам детали тайной свадьбы.", name: "Ваше имя", email: "E-mail", phone: "Телефон", consentStart: "Я согласен(-на) с", policyLink: "политикой обработки персональных данных", submit: "Получить приглашение", sending: "Отправляем...", error: "Не удалось отправить. Попробуйте ещё раз.", success: "До встречи на свадьбе!", successText: "Мы свяжемся с вами, чтобы рассказать о следующем шаге." },
  },
  en: {
    hero: { title: "A fake", script: "wedding", subtitle: "for strangers", cta: "Get an invitation", noteTop: "The bride and groom", noteMiddle: "will meet each other", noteFirst: "for the first time", noteBottom: "at this very wedding" },
    nav: { about: "About", details: "Details" }, intro: "Perhaps this is where\nyou'll find your love", perks: ["Theatrical\nplay", "Step into\na role", "New\nconnections"],
    story: { eyebrow: "More than a party", title: "One wedding.", script: "Many stories.", text: "You will receive an invitation, a role, and a reason to dress up. The rest will happen naturally — over dinner, music, and conversations late into the night." },
    details: { eyebrow: "Save the date", date: "date", place: "location", guests: "guest count", price: "per person", reserve: "Reserve a place", city: "Riga", limited: "Limited" }, footer: { contact: "Contact & questions", privacy: "Privacy policy" },
    modal: { eyebrow: "Your invitation", title: "Leave your details", text: "We will send you the details of the secret wedding.", name: "Your name", email: "Email", phone: "Phone", consentStart: "I agree to the", policyLink: "personal data processing policy", submit: "Get an invitation", sending: "Sending...", error: "Could not send your request. Please try again.", success: "See you at the wedding!", successText: "We will contact you with the next step." },
  },
};

type Translation = (typeof translations)["lv"];
const I18nContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: Translation } | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("lv");
  useEffect(() => {
    const saved = window.localStorage.getItem("fakewedding-locale") as Locale | null;
    if (saved && saved in translations) { setLocale(saved); return; }
    const browser = navigator.language.toLowerCase();
    setLocale(browser.startsWith("ru") ? "ru" : browser.startsWith("en") ? "en" : "lv");
  }, []);
  const selectLocale = (next: Locale) => { window.localStorage.setItem("fakewedding-locale", next); setLocale(next); };
  return <I18nContext.Provider value={{ locale, setLocale: selectLocale, t: translations[locale] }}>{children}</I18nContext.Provider>;
}

export function useI18n() { const value = useContext(I18nContext); if (!value) throw new Error("useI18n must be used inside I18nProvider"); return value; }
