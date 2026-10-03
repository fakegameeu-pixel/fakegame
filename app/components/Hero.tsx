"use client";

import { useI18n } from "../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

type HeroProps = { onReserve: () => void };

export function Hero({ onReserve }: HeroProps) {
  const { t } = useI18n();
  return <section className="hero" id="top"><div className="heroShade" /><div className="heroTools"><button className="headerReserve" onClick={onReserve}>{t.hero.cta}</button><LanguageSwitcher /></div><div className="heroContent wrap"><div className="rings" aria-hidden="true"><svg viewBox="0 0 106 84"><path d="M53 19c-8-13-24-4-17 8l17 16 17-16c7-12-9-21-17-8Z" /><circle cx="37" cy="49" r="26" /><circle cx="68" cy="49" r="26" /></svg></div><h1>{t.hero.title} <em>{t.hero.script}</em></h1><p className="heroSubtitle">{t.hero.subtitle}</p><div className="heroRule"><span>♡</span></div></div><div className="heroNote"><span className="noteSpark">⌁</span><p>{t.hero.noteTop}<br />{t.hero.noteMiddle}</p><strong>{t.hero.noteFirst}</strong><p>{t.hero.noteBottom}</p><span className="noteHeart">♡</span></div></section>;
}
