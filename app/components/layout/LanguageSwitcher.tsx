"use client";

import { Locale, useI18n } from "../../lib/i18n";
import { usePathname } from "next/navigation";

const languages: { value: Locale; label: string }[] = [
  { value: "lv", label: "LV" },
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const pathname = usePathname();

  const changeLocale = (next: Locale) => {
    setLocale(next);
    const suffix = pathname.endsWith("/privacy-policy") ? "/privacy-policy" : "";
    window.location.assign(`/${next}${suffix}`);
  };
  return (
    <label className="languageSwitcher">
      <span className="srOnly">Language</span>
      <select
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
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
