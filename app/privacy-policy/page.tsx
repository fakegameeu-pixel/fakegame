import { PrivacyHeader } from "../components/layout/Header";
import { I18nProvider } from "../lib/i18n";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";

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
