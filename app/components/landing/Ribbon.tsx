import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";

export function Ribbon() {
  const { locale } = useI18n();
  const phrase = landingCopy[locale].ribbon;
  return (
    <div className="fwRibbon" aria-hidden="true">
      <div className="fwTrack">
        <span>{phrase}</span>
        <span>{phrase}</span>
      </div>
    </div>
  );
}
