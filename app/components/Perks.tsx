"use client";
import { useI18n } from "../lib/i18n";
const icons = ["theatre", "glasses", "people"];

export function Perks() {
  const { t } = useI18n();
  return (
    <section className="perks wrap">
      {t.perks.map((title, index) => (
        <article className="perk" key={title}>
          <div className="perkIcon">
            <img src={`/${icons[index]}.png`} alt="" />
          </div>
          <h2>
            {title.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </article>
      ))}
    </section>
  );
}
