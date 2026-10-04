"use client";

import { I18nProvider, useI18n } from "../../i18n";
import { LanguageSwitcher } from "../LanguageSwitcher";

function HeaderContent() {
  const { t } = useI18n();

  return (
    <header className="privacyHeader">
      <a className="privacyBrand" href="/" aria-label="Fake Wedding">
        Fake Wedding
      </a>
      <div className="heroTools privacyTools">
        <a className="headerReserve privacyReserve" href="/">
          {t.hero.cta}
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

export function Header() {
  return (
    <I18nProvider>
      <HeaderContent />
    </I18nProvider>
  );
}
