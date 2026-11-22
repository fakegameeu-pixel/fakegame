import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import "./HeroBg.css";

type HeroProps = { onReserve: () => void };

export function Hero({ onReserve }: HeroProps) {
  const { locale } = useI18n();
  const c = landingCopy[locale].hero;
  const [first, second, third] = c.title;
  return (
    <section className="fwHero">
      <div className="fwHeroImg" aria-hidden="true" />
      <div className="fwHeroShade" aria-hidden="true" />
      <div className="fwHeroBody">
        <p className="fwEyebrow fwEyebrowLight">{c.eyebrow}</p>
        <h1>
          {first}
          <br />
          {second}
          <br />
          <em>{third}</em>
        </h1>
        <p className="fwLead">{c.lead}</p>
        <div className="fwCtas">
          <button className="fwBtnGold" onClick={onReserve}>
            {c.reserve}
          </button>
          <a className="fwBtnGhost" href="#how">
            {c.how}
          </a>
        </div>
      </div>
    </section>
  );
}
