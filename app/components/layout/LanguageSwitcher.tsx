"use client";

import { useEffect, useRef, useState } from "react";
import { Locale, useI18n } from "../../lib/i18n";

const languages: { value: Locale; label: string }[] = [
  { value: "lv", label: "LV" },
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const availableLanguages = languages.filter((language) => language.value !== locale);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const selectLanguage = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setIsOpen(false);
  };

  return (
    <div className="languageSwitchControl" ref={switcherRef}>
      <button
        className="languageSwitchTrigger"
        type="button"
        aria-label="Choose language"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="languageSwitchGlobe">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.9 12h16.2M12 3.5c2.15 2.3 3.25 5.13 3.25 8.5S14.15 18.2 12 20.5C9.85 18.2 8.75 15.37 8.75 12S9.85 5.8 12 3.5Z" />
        </svg>
        <span>{locale.toUpperCase()}</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="languageSwitchChevron">
          <path d="m3.5 5.75 4.5 4.5 4.5-4.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="languageSwitchMenu" role="menu" aria-label="Available languages">
          {availableLanguages.map((language) => (
            <button
              type="button"
              key={language.value}
              role="menuitem"
              onClick={() => selectLanguage(language.value)}
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
