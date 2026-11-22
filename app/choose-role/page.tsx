import type { Metadata } from "next";
import { ChooseRole } from "../components/ChooseRole";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "Izvēlies lomu",
  description: "Izvēlies savu lomu Fake Wedding pasākumā ar biļetes numuru.",
  robots: { index: false, follow: false },
};

export default function ChooseRolePage() {
  return (
    <I18nProvider>
      <ChooseRole />
    </I18nProvider>
  );
}
