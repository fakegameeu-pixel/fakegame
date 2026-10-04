"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";

export function PrivacyPolicyContent() {
  const { t } = useI18n();
  const { privacy } = t;

  return (
    <article className="privacyCard">
      <header className="privacyIntro">
        <Link className="privacyBack" href="/">
          <span aria-hidden="true">←</span> {privacy.back}
        </Link>
        <p className="eyebrow dark">{privacy.eyebrow}</p>
        <h1>{privacy.title}</h1>
        <p className="privacyLead">{privacy.lead}</p>
        <p className="privacyUpdated">
          {privacy.updated} <time dateTime="2026-10-03">{privacy.date}</time>
        </p>
      </header>
      <div className="privacyContent">
        <aside className="privacyAside" aria-label={privacy.asideTitle}>
          <span>{privacy.asideTitle}</span>
          <p>{privacy.asideText}</p>
          <a href="tel:+37125172252">{privacy.contact} ↗</a>
        </aside>
        <div className="privacySections">
          {privacy.sections.map((section, index) => (
            <section key={section.title}>
              <h2>
                {index + 1}. {section.title}
              </h2>
              <p>
                {section.text}
                {index === 4 && (
                  <>
                    {" "}
                    <a href="tel:+37125172252">+371 25172252</a>.
                  </>
                )}
              </p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
