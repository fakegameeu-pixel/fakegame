"use client";
import { useI18n } from "../i18n";
const icons = ["masks", "glasses", "people"];

function FeatureIcon({ name }: { name: string }) {
  if (name === "masks") return <svg viewBox="0 0 80 58" aria-hidden="true"><path d="M7 10c15-7 26-5 32 1v28c-10 13-25 8-32-2V10Z M41 12c13-6 24-4 32 1v25c-7 11-22 14-32 2V12Z" /><path d="M15 25c3 4 7 4 10 0M50 27c3 4 7 4 10 0M17 35c4 4 10 4 14 0M51 36c4 3 10 3 14-1" /></svg>;
  if (name === "glasses") return <svg viewBox="0 0 80 58" aria-hidden="true"><path d="m16 7 22 7-7 22c-6 5-14 2-17-5l2-24ZM63 7 41 14l7 22c7 5 15 2 18-5L63 7ZM24 43l12 7M56 43 44 50M36 15l8 0" /><path d="M24 5c-1-5 7-6 7 0M46 5c-1-5 7-6 7 0M39 5c-1-5 7-6 7 0" /></svg>;
  return <svg viewBox="0 0 80 58" aria-hidden="true"><circle cx="40" cy="15" r="9" /><circle cx="17" cy="20" r="7" /><circle cx="63" cy="20" r="7" /><path d="M24 49V37c0-8 7-13 16-13s16 5 16 13v12H24ZM3 48v-9c0-7 6-11 14-11s13 4 13 11v9H3ZM50 48v-9c0-7 6-11 13-11s14 4 14 11v9H50Z" /></svg>;
}

export function Perks() { const { t } = useI18n(); return <section className="perks wrap">{t.perks.map((title, index) => <article className="perk" key={title}><div className="perkIcon"><FeatureIcon name={icons[index]} /></div><h2>{title.split("\n").map((line) => <span key={line}>{line}</span>)}</h2></article>)}</section>; }
