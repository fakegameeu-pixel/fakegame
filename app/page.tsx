"use client";

import { useState } from "react";
import { Details } from "./components/Details";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/Hero";
import { Introduction } from "./components/Introduction";
import { InvitationModal } from "./components/InvitationModal";
import { Perks } from "./components/Perks";
import { PhotoStrip } from "./components/PhotoStrip";
import { Story } from "./components/Story";
import { I18nProvider } from "./i18n";

export default function Home() {
  return (
    <I18nProvider>
      <WeddingLanding />
    </I18nProvider>
  );
}

function WeddingLanding() {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);

  return (
    <main>
      <Hero onReserve={() => setIsInvitationOpen(true)} />
      <Introduction />
      <Perks />
      <PhotoStrip />
      <Story />
      <Details onReserve={() => setIsInvitationOpen(true)} />
      <Footer />
      {isInvitationOpen && (
        <InvitationModal onClose={() => setIsInvitationOpen(false)} />
      )}
    </main>
  );
}
