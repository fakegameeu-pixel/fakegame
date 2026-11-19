const phrase =
  "vienas kāzas ♥ simts noslēpumu ♥ katrs stāsts ir īpašs ♥ visi ir uzaicināti ♥ viens vakars ♥ jaunas pazīšanās ♥ ";

export function Ribbon() {
  return (
    <div className="fwRibbon" aria-hidden="true">
      <div className="fwTrack">
        <span>{phrase}</span>
        <span>{phrase}</span>
      </div>
    </div>
  );
}
