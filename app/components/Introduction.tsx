"use client";
import { useI18n } from "../i18n";
export function Introduction() {
  const { t } = useI18n();
  return <section className="intro" id="about"><div className="paperTop" /><div className="featureHeading wrap"><i className="flourish flourishLeft" aria-hidden="true" /><p className="script">{t.intro.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</p><i className="flourish flourishRight" aria-hidden="true" /></div></section>;
}
