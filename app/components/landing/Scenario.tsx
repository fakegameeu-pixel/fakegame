import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import { stepsMeta } from "./content";
import "./Scenario.css";

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 8h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V8Z" />
      <path d="M14.5 8v1.5M14.5 11v2M14.5 14.5V16" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function MaskIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="12" r="3.2" />
      <circle cx="16" cy="12" r="3.2" />
      <path d="M11.2 12h1.6" />
    </svg>
  );
}

function GlassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h10l-1.2 8a3.8 3.8 0 0 1-7.6 0L7 3Z" />
      <path d="M12 14.8V21M8.5 21h7" />
    </svg>
  );
}

const icons = [TicketIcon, EnvelopeIcon, MaskIcon, GlassIcon];

export function Scenario() {
  const { locale } = useI18n();
  const c = landingCopy[locale].steps;
  return (
    <section className="fwScenario" id="how">
      <div className="fwScenarioInner">
        <p className="fwEyebrow fwEyebrowLight fwCenter">{c.eyebrow}</p>
        <h2 className="fwCenter">
          {c.title} <em>{c.titleAccent}</em>
        </h2>
        <ol className="fwSteps">
          {stepsMeta.map((s, i) => {
            const Icon = icons[i];
            return (
              <li key={s.n} className={`fwStep${s.final ? " fwStepFinal" : ""}`}>
                <span className="fwStepDot">
                  <Icon />
                </span>
                <p className="fwStepNum">{s.final ? `${s.n} · ${c.final}` : s.n}</p>
                <h3>{c.items[i].title}</h3>
                <p>{c.items[i].text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
