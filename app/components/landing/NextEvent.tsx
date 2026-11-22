"use client";

import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import { NEXT_EVENT } from "./content";
import "./NextEvent.css";

type NextEventProps = {
  onReserve: () => void;
};

export function NextEvent({ onReserve }: NextEventProps) {
  const { locale } = useI18n();
  const c = landingCopy[locale].next;
  return (
    <section className="fwWrap fwNextWrap">
      <p className="fwEyebrow">{c.eyebrow}</p>
      <h2>
        {c.title} <em>{c.titleAccent}</em>
      </h2>
      <div className="fwNext">
        <div className="fwNextLeft">
          <div className="fwNextMeta">
            <div>
              <small>{c.date}</small>
              <strong>{NEXT_EVENT.date}</strong>
            </div>
            <div>
              <small>{c.start}</small>
              <strong>{NEXT_EVENT.time}</strong>
            </div>
            <div>
              <small>{c.place}</small>
              <strong className="fwCity">{c.city}</strong>
            </div>
          </div>
          <ul className="fwChecks">
            {c.checks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="fwNextRight">
          <small>{c.price}</small>
          <p className="fwPrice">{NEXT_EVENT.price}</p>
          <p className="fwMuted">{c.perPerson}</p>
          <p className="fwMuted">{c.adults}</p>
          <button className="fwBtnDark" onClick={onReserve}>
            {c.reserve}
          </button>
        </div>
      </div>
    </section>
  );
}
