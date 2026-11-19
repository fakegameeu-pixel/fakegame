import { useI18n } from "../../lib/i18n";
import { INSTAGRAM_URL, WHATSAPP_URL } from "./content";
import "./ClosingFooter.css";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="fwFootDot" cx="17.3" cy="6.7" r="0.9" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 20.5l1.1-3.9A8.5 8.5 0 1 1 7.4 19.4l-3.9 1.1Z" />
      <path d="M9 8.8c.2 2.4 2.7 4.9 5.2 5.2l1-1.3 2 .9c.2.6-.1 1.6-.9 2-1.1.5-2.6.2-4.2-.6-2.2-1.1-3.9-2.9-4.9-5.1-.4-.9-.2-1.8.4-2.2l1.2-.8 1 2Z" />
    </svg>
  );
}

export function Closing() {
  const { t } = useI18n();
  return (
    <section className="fwClose">
      <div className="fwWrap">
        <h2>
          Uz redzēšanos
          <br />
          <em>pie altāra.</em>
        </h2>
        <footer className="fwFoot">
          <div className="fwFootIcons">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
          </div>
          <div className="fwFootLinks">
            <a href="/privacy-policy">{t.footer.privacy}</a>
            <span className="fwGold">© Fake Wedding, Rīga</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
