"use client";

import { Locale, useI18n } from "../i18n";

const languages: { value: Locale; label: string }[] = [
  { value: "lv", label: "LV" },
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <label className="languageSwitcher">
      <span className="srOnly">Language</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
      >
        {languages.map((language) => (
          <option value={language.value} key={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
