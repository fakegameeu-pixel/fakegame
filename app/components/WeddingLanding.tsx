"use client";

import { useState } from "react";
import "./fakeWedding.css";
import { useI18n } from "../lib/i18n";
import { InvitationModal } from "./InvitationModal";
import { CookieBanner } from "./CookieBanner";
import { Header } from "./landing/Header";
import { Hero } from "./landing/Hero";
import { Ribbon } from "./landing/Ribbon";
import { Programme } from "./landing/Programme";
import { Scenario } from "./landing/Scenario";
import { PastWeddings } from "./landing/PastWeddings";
import { Aftermovie } from "./landing/Aftermovie";
import { Roles } from "./landing/Roles";
import { NextEvent } from "./landing/NextEvent";
import { Faq } from "./landing/Faq";
import { Closing } from "./landing/Closing";
import "./landing/Buttons.css";
import "./landing/FullWidth.css";

export function WeddingLanding() {
  const { t } = useI18n();
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const openInvitation = () => {
    setIsInvitationOpen(true);
  };

  return (
    <main className="fw" id="top">
      <Header onReserve={openInvitation} />
      <Hero onReserve={openInvitation} />
      <Ribbon />
      <Programme />
      <Scenario />
      <PastWeddings />
      <Aftermovie />
      <Roles />
      <NextEvent onReserve={openInvitation} />
      <Faq />
      <Closing />

      <section className="srOnly" aria-label={t.seo.heading}>
        <h2>{t.seo.heading}</h2>
        <p>{t.seo.description}</p>
      </section>

      {isInvitationOpen && (
        <InvitationModal onClose={() => setIsInvitationOpen(false)} />
      )}
      <CookieBanner />
    </main>
  );
}
