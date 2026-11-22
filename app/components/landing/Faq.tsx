"use client";

import { useState } from "react";
import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import { PHONE, WHATSAPP_URL } from "./content";
import "./Faq.css";

export function Faq() {
  const { locale } = useI18n();
  const c = landingCopy[locale].faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="fwSection fwFaq" id="faq">
      <div className="fwWrap fwFaqGrid">
        <div>
          <p className="fwEyebrow">{c.eyebrow}</p>
          <h2>
            {c.title} <em>{c.titleAccent}</em>
          </h2>
          <p className="fwLead fwLeadDark">{c.lead}</p>
          <div className="fwAsk">
            <p className="fwAskTitle">{c.askTitle}</p>
            <p className="fwMuted">{c.askText}</p>
            <div className="fwCtas">
              <a className="fwBtnGold fwBtnSmall" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                WhatsApp →
              </a>
              <a className="fwBtnGhostDark fwBtnSmall" href={`tel:${PHONE}`}>
                {PHONE.replace("+371", "+371 ")}
              </a>
            </div>
          </div>
        </div>
        <ul className="fwQuestions">
          {c.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={item.q} className={`fwQ${isOpen ? " isOpen" : ""}`}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpenIndex(isOpen ? null : i)}>
                  <span className="fwQNum">0{i + 1}</span>
                  <span className="fwQText">{item.q}</span>
                  <span className="fwQIcon" aria-hidden="true">
                    {isOpen ? "×" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="fwQAnswer">
                    {item.a}
                    {item.href && item.linkLabel && (
                      <>
                        <br />
                        <a className="fwLink" href={item.href}>
                          {item.linkLabel}
                        </a>
                      </>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
