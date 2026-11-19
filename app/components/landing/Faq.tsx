"use client";

import { useState } from "react";
import { faq, PHONE, WHATSAPP_URL } from "./content";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="fwSection fwFaq" id="faq">
      <div className="fwWrap fwFaqGrid">
        <div>
          <p className="fwEyebrow">BUJ · Pirms došanās uz kāzām</p>
          <h2>
            Biežāk <em>jautātais</em>
          </h2>
          <p className="fwLead fwLeadDark">Viss, ko viesi parasti grib zināt, pirms saņem savu lomu.</p>
          <div className="fwAsk">
            <p className="fwAskTitle">Neatradi atbildi?</p>
            <p className="fwMuted">Uzraksti vai piezvani — atbildēsim pirms tu palūdz.</p>
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
          {faq.map((item, i) => {
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
                {isOpen && <p className="fwQAnswer">{item.a}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
