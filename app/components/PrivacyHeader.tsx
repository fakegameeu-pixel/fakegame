"use client";

import { I18nProvider, useI18n } from "../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

function PrivacyHeaderContent() {
  const { t } = useI18n();

  return (
    <header className="privacyHeader">
      <a className="privacyBrand" href="/" aria-label="Fake Wedding">Fake Wedding</a>
      <div className="heroTools privacyTools">
        <a className="headerReserve privacyReserve" href="/">{t.hero.cta}</a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

export function PrivacyHeader() {
  return <I18nProvider><PrivacyHeaderContent /></I18nProvider>;
}
