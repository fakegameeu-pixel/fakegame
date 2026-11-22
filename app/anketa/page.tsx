import type { Metadata } from "next";
import { CandidateForm } from "../components/CandidateForm";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "Анкета жениха и невесты",
  description: "Анкета и видеовизитка для участия в Fake Wedding.",
  robots: { index: false, follow: false },
};

export default function AnketaPage() {
  return (
    <I18nProvider>
      <CandidateForm />
    </I18nProvider>
  );
}
