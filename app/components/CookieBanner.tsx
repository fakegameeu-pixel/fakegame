"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { startGoogleAnalytics } from "../lib/googleAnalytics";

const COOKIE_CONSENT_KEY = "fake-wedding-cookie-consent";

export function CookieBanner() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedChoice = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedChoice === "accepted") startGoogleAnalytics();
    setIsVisible(!savedChoice);
  }, []);

  const saveChoice = (choice: "accepted" | "declined") => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    if (choice === "accepted") startGoogleAnalytics();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside className="cookieBanner" aria-label={t.cookies.title} role="dialog">
      <div className="cookieBannerCopy">
        <p className="cookieBannerTitle">{t.cookies.title}</p>
        <p>
          {t.cookies.text} <a href="/privacy-policy">{t.cookies.policyLink}</a>.
        </p>
      </div>
      <div className="cookieBannerActions">
        <button className="cookieDecline" type="button" onClick={() => saveChoice("declined")}>
          {t.cookies.decline}
        </button>
        <button className="cookieAccept" type="button" onClick={() => saveChoice("accepted")}>
          {t.cookies.accept}
        </button>
      </div>
    </aside>
  );
}
