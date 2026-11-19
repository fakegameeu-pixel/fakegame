import { programme } from "./content";
import "./Programme.css";

export function Programme() {
  return (
    <section className="fwSection" id="about">
      <div className="fwWrap">
        <div className="fwSplitHead">
          <div>
            <p className="fwEyebrow">Programma · 3 cēlieni</p>
            <h2>
              Ne tikai <em>ballīte.</em>
            </h2>
          </div>
          <p className="fwSideText">
            Vienas kāzas, daudz stāstu. Tu vari spēlēt drosmīgi, vari vienkārši vērot — vakars strādā abos gadījumos.
          </p>
        </div>

        <div className="fwCards">
          {programme.map((item) => (
            <article
              key={item.num}
              className={`fwCard${item.variant === "featured" ? " fwCardFeatured" : ""}${item.variant === "arch" ? " fwCardArch" : ""}`}
            >
              <div className="fwCardImg" style={{ backgroundImage: `url(${item.img})` }} aria-hidden="true" />
              {item.variant === "featured" && <span className="fwBadge">Galvenais cēliens</span>}
              <div className="fwCardBody">
                <span className="fwNum">{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
