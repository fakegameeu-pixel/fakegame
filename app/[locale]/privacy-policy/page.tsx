import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyHeader } from "../../components/layout/Header";
import { I18nProvider, type Locale } from "../../lib/i18n";
import { PrivacyPolicyContent } from "../../privacy-policy/PrivacyPolicyContent";

const metadataByLocale: Record<Locale, { title: string; description: string }> = {
  lv: { title: "Privātuma politika", description: "Fake Wedding personas datu apstrādes politika." },
  ru: { title: "Политика обработки персональных данных", description: "Политика обработки персональных данных проекта «Фейковая свадьба»." },
  en: { title: "Privacy policy", description: "Fake Wedding personal data processing policy." },
};

function isLocale(value: string): value is Locale {
  return value === "lv" || value === "ru" || value === "en";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const data = metadataByLocale[locale];
  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `/${locale}/privacy-policy`,
      languages: { lv: "/lv/privacy-policy", ru: "/ru/privacy-policy", en: "/en/privacy-policy" },
    },
  };
}

export default async function LocalizedPrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="privacyPage">
      <I18nProvider initialLocale={locale}>
        <PrivacyHeader />
        <PrivacyPolicyContent />
      </I18nProvider>
    </main>
  );
}
