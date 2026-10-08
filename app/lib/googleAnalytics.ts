const measurementId = process.env.NEXT_PUBLIC_GA_ID;

type GoogleWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function startGoogleAnalytics() {
  if (!measurementId || typeof window === "undefined") return;

  const googleWindow = window as GoogleWindow;
  googleWindow.dataLayer = googleWindow.dataLayer || [];
  googleWindow.gtag = googleWindow.gtag || function gtag(...args: unknown[]) {
    googleWindow.dataLayer?.push(args);
  };

  googleWindow.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  googleWindow.gtag("consent", "update", {
    analytics_storage: "granted",
  });
  googleWindow.gtag("js", new Date());
  googleWindow.gtag("config", measurementId);

  if (document.querySelector(`script[data-google-analytics="${measurementId}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.dataset.googleAnalytics = measurementId;
  document.head.appendChild(script);
}
