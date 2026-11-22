import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import { INSTAGRAM_URL, pastWeddingImgs } from "./content";
import "./PastWeddings.css";

// Кадры идут бесконечной лентой: копия списка повторяется, анимация сдвигает ровно на одну копию.
function Frames({ hidden, captions }: { hidden?: boolean; captions: string[] }) {
  return (
    <ul className="fwStripFrames" aria-hidden={hidden || undefined}>
      {pastWeddingImgs.map((img, i) => (
        <li key={img} className="fwStripFrame">
          <div className="fwStripImg" style={{ backgroundImage: `url(${img})` }} role={hidden ? undefined : "img"} aria-label={hidden ? undefined : captions[i]} />
        </li>
      ))}
    </ul>
  );
}

export function PastWeddings() {
  const { locale } = useI18n();
  const c = landingCopy[locale].past;
  return (
    <section className="fwSection fwPast" id="gallery">
      <div className="fwWrap">
        <div className="fwSplitHead">
          <h2>
            {c.title} <em>{c.titleAccent}</em>
          </h2>
          <a className="fwLink" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Instagram @fakeweddingeu →
          </a>
        </div>
      </div>

      <div className="fwStrip">
        <div className="fwStripTrack">
          <Frames captions={c.captions} />
          <Frames hidden captions={c.captions} />
          <Frames hidden captions={c.captions} />
        </div>
      </div>
    </section>
  );
}
