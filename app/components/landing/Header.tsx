"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, type Locale } from "../../lib/i18n";
import { landingCopy } from "./copy";
import "./HeaderMenu.css";
import "./HeaderMobile.css";
import "./HeaderRoleLink.css";
import "./HeaderAnketa.css";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "lv", label: "LV" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

const anketaLabel: Record<Locale, string> = {
  lv: "Piedalīties",
  ru: "Принять участие",
  en: "Take part",
};

function ChevronIcon() {
  return (
    <svg className="fwChevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

type HeaderProps = { onReserve: () => void; homeHref?: string };

// homeHref нужен на других страницах: якоря меню ведут на главную.
export function Header({ onReserve, homeHref = "" }: HeaderProps) {
  const { locale, setLocale } = useI18n();
  const c = landingCopy[locale].header;
  const nav = [
    { href: "#about", label: c.nav.concept },
    { href: "#how", label: c.nav.how },
    { href: "#roles", label: c.nav.roles },
    { href: "#gallery", label: c.nav.gallery },
    { href: "#faq", label: c.nav.faq },
  ];
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Клик вне выбора языка закрывает список.
  useEffect(() => {
    if (!langOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [langOpen]);

  // Esc закрывает боковое меню.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="fwHeader">
        <a className="fwLogo" href={`${homeHref}#top`} aria-label="Fake Wedding">
          <svg viewBox="0 0 40 26" aria-hidden="true">
            <circle cx="13" cy="13" r="11" />
            <circle cx="27" cy="13" r="11" />
          </svg>
          FAKE WEDDING
        </a>

        <div className="fwHeaderRight">
          <button className="fwBtnGold fwBtnSmall fwHeaderCta" onClick={onReserve}>
            {c.cta}
          </button>

          <div className="fwLangSel" ref={langRef}>
            <button
              type="button"
              className="fwLangBtn"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={c.language}
              onClick={() => setLangOpen((open) => !open)}
            >
              <span>{locale.toUpperCase()}</span>
              <ChevronIcon />
            </button>
            {langOpen && (
              <ul className="fwLangMenu" role="listbox" aria-label={c.language}>
                {LOCALES.map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={locale === l.code}
                      onClick={() => {
                        setLocale(l.code);
                        setLangOpen(false);
                      }}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className="fwBurger"
            aria-label={c.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fwDrawerBackdrop" onClick={closeMenu} aria-hidden="true" />
          <aside className="fwDrawer" aria-label={c.navLabel}>
            <button type="button" className="fwDrawerClose" aria-label={c.closeMenu} onClick={closeMenu}>
              ×
            </button>
            <nav className="fwDrawerNav">
              {nav.map((item) => (
                <a key={item.href} href={`${homeHref}${item.href}`} onClick={closeMenu}>
                  {item.label}
                </a>
              ))}
            </nav>
            <a className="fwDrawerRole" href="/choose-role" onClick={closeMenu}>
              {c.chooseRole}
            </a>
            <a className="fwBtnGold fwDrawerAnketa" href="/anketa" onClick={closeMenu}>
              {anketaLabel[locale]}
            </a>
          </aside>
        </>
      )}
    </>
  );
}
