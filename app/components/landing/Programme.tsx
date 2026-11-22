import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import { programmeMeta } from "./content";
import "./Programme.css";

export function Programme() {
  const { locale } = useI18n();
  const c = landingCopy[locale].programme;
  return (
    <section className="fwSection" id="about">
      <div className="fwWrap">
        <div className="fwSplitHead">
          <div>
            <p className="fwEyebrow">{c.eyebrow}</p>
            <h2>
              {c.title} <em>{c.titleAccent}</em>
            </h2>
          </div>
          <p className="fwSideText">{c.side}</p>
        </div>

        <div className="fwCards">
          {programmeMeta.map((meta, i) => (
            <article
              key={meta.num}
              className={`fwCard${meta.variant === "featured" ? " fwCardFeatured" : ""}${meta.variant === "arch" ? " fwCardArch" : ""}`}
            >
              <div className="fwCardImg" style={{ backgroundImage: `url(${meta.img})` }} aria-hidden="true" />
              {meta.variant === "featured" && <span className="fwBadge">{c.badge}</span>}
              <div className="fwCardBody">
                <span className="fwNum">{meta.num}</span>
                <h3>{c.items[i].title}</h3>
                <p>{c.items[i].text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
