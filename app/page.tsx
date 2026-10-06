import { WeddingLanding } from "./components/WeddingLanding";
import { I18nProvider } from "./lib/i18n";

export default function Home() {
  return <I18nProvider><WeddingLanding /></I18nProvider>;
}
