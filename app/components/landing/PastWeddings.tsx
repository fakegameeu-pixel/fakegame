import { INSTAGRAM_URL, pastWeddings } from "./content";
import "./PastWeddings.css";

// Кадры идут бесконечной лентой: копия списка повторяется, анимация сдвигает ровно на одну копию.
function Frames({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="fwStripFrames" aria-hidden={hidden || undefined}>
      {pastWeddings.map((p) => (
        <li key={p.caption} className="fwStripFrame">
          <div className="fwStripImg" style={{ backgroundImage: `url(${p.img})` }} role={hidden ? undefined : "img"} aria-label={hidden ? undefined : p.caption} />
        </li>
      ))}
    </ul>
  );
}

export function PastWeddings() {
  return (
    <section className="fwSection fwPast" id="gallery">
      <div className="fwWrap">
        <div className="fwSplitHead">
          <h2>
            Iepriekšējās <em>kāzas</em>
          </h2>
          <a className="fwLink" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Instagram @fakeweddingeu →
          </a>
        </div>
      </div>

      <div className="fwStrip">
        <div className="fwStripTrack">
          <Frames />
          <Frames hidden />
          <Frames hidden />
        </div>
      </div>
    </section>
  );
}
