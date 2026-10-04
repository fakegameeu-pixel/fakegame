import type { Metadata } from "next";
import { PrivacyHeader } from "../components/layout/Header";
import { I18nProvider } from "../lib/i18n";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — Фейковая свадьба",
  description:
    "Политика обработки персональных данных проекта «Фейковая свадьба».",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="privacyPage">
      <I18nProvider>
        <PrivacyHeader />
        <PrivacyPolicyContent />
      </I18nProvider>
    </main>
  );
}
