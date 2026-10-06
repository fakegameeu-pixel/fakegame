"use client";

import { useI18n } from "../../lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "../ui/button";

type HeaderProps = {
  onReserve: () => void;
};

export function Header({ onReserve }: HeaderProps) {
  const { t } = useI18n();

  return (
    <header className="siteHeader">
      <div className="heroTools siteHeaderTools">
        <Button className="siteHeaderReserve" onClick={onReserve}>
          {t.hero.cta}
        </Button>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

function PrivacyHeaderContent() {
  const { t, locale } = useI18n();

  return (
    <header className="privacyHeader">
      <a className="privacyBrand" href={`/${locale}`} aria-label="Fake Wedding">
        Fake Wedding
      </a>
      <div className="heroTools privacyTools">
        <a className="headerReserve privacyReserve" href={`/${locale}`}>
          {t.hero.cta}
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

export function PrivacyHeader() {
  return <PrivacyHeaderContent />;
}
