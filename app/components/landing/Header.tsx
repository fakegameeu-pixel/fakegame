"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, type Locale } from "../../lib/i18n";
import "./HeaderMenu.css";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "lv", label: "LV" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

const NAV = [
  { href: "#about", label: "Koncepcija" },
  { href: "#how", label: "Kā tas notiek" },
  { href: "#roles", label: "Lomas" },
  { href: "#gallery", label: "Galerija" },
  { href: "#faq", label: "BUJ" },
];

function ChevronIcon() {
  return (
    <svg className="fwChevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

type HeaderProps = { onReserve: () => void };

export function Header({ onReserve }: HeaderProps) {
  const { locale, setLocale } = useI18n();
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
        <a className="fwLogo" href="#top" aria-label="Fake Wedding">
          <svg viewBox="0 0 40 26" aria-hidden="true">
            <circle cx="13" cy="13" r="11" />
            <circle cx="27" cy="13" r="11" />
          </svg>
          FAKE WEDDING
        </a>

        <div className="fwHeaderRight">
          <button className="fwBtnGold fwBtnSmall" onClick={onReserve}>
            Saņemt ielūgumu
          </button>

          <div className="fwLangSel" ref={langRef}>
            <button
              type="button"
              className="fwLangBtn"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Valoda"
              onClick={() => setLangOpen((open) => !open)}
            >
              <span>{locale.toUpperCase()}</span>
              <ChevronIcon />
            </button>
            {langOpen && (
              <ul className="fwLangMenu" role="listbox" aria-label="Valoda">
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
            aria-label="Atvērt izvēlni"
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
          <aside className="fwDrawer" aria-label="Navigācija">
            <button type="button" className="fwDrawerClose" aria-label="Aizvērt izvēlni" onClick={closeMenu}>
              ×
            </button>
            <nav className="fwDrawerNav">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} onClick={closeMenu}>
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
