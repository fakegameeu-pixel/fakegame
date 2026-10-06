import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["lv", "ru", "en"];
  return locales.flatMap((locale) => [
    {
    url: `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: {
        lv: `${siteUrl}/lv`,
        ru: `${siteUrl}/ru`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/lv`,
      },
    },
    },
    { url: `${siteUrl}/${locale}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ]);
}
