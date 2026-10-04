"use client";

import { useI18n } from "../../lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="footerCard">
        <span className="phoneIcon" aria-hidden="true">
          <svg viewBox="0 0 50 50">
            <path d="M15 6 7 12c-2 2 1 13 9 21s19 11 21 9l7-8-9-7-5 5c-5-2-10-7-12-12l5-5-8-9Z" />
          </svg>
        </span>
        <div className="footerDivider" />
        <div>
          <p className="footerTitle">{t.footer.contact}</p>
          <a href="tel:+37125172252">+371 25172252</a>
        </div>
      </div>
      <a className="privacyLink" href="/privacy-policy">
        {t.footer.privacy}
      </a>
    </footer>
  );
}
