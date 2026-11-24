import type { Metadata } from "next";
import { ChooseRole } from "../components/ChooseRole";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "Izvēlies lomu",
  description: "Ievadi biļetes numuru un izvēlies brīvo lomu Fake Wedding pasākumā.",
  robots: { index: false, follow: false },
};

export default function ChooseRolePage() {
  return (
    <I18nProvider>
      <ChooseRole />
    </I18nProvider>
  );
}
