"use client";

import { useState } from "react";
import { Details } from "./Details";
import { Footer } from "./layout/Footer";
import { Header } from "./layout/Header";
import { Hero } from "./Hero";
import { Introduction } from "./Introduction";
import { InvitationModal } from "./InvitationModal";
import { Perks } from "./Perks";
import { PhotoStrip } from "./PhotoStrip";
import { Story } from "./Story";
import { useI18n } from "../lib/i18n";
import { CookieBanner } from "./CookieBanner";

export function WeddingLanding() {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const { t } = useI18n();

  return (
    <main>
      <Header onReserve={() => setIsInvitationOpen(true)} />
      <Hero />
      <Introduction />
      <Perks />
      <PhotoStrip />
      <Story />
      <Details onReserve={() => setIsInvitationOpen(true)} />
      <section className="srOnly" aria-label={t.seo.heading}>
        <h2>{t.seo.heading}</h2>
        <p>{t.seo.description}</p>
      </section>
      <Footer />
      {isInvitationOpen && <InvitationModal onClose={() => setIsInvitationOpen(false)} />}
      <CookieBanner />
    </main>
  );
}
