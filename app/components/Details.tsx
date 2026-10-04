"use client";
import { useI18n } from "../lib/i18n";
type DetailsProps = { onReserve: () => void };
function DetailIcon({ type }: { type: "date" | "place" | "guests" | "price" }) {
  if (type === "date")
    return (
      <svg viewBox="0 0 50 50">
        <rect x="7" y="10" width="36" height="33" rx="2" />
        <path d="M7 20h36M16 5v10M34 5v10M16 28h4M25 28h4M16 36h4M25 36h4" />
      </svg>
    );
  if (type === "place")
    return (
      <svg viewBox="0 0 50 50">
        <path d="M25 45S10 29 10 19a15 15 0 1 1 30 0c0 10-15 26-15 26Z" />
        <circle cx="25" cy="19" r="5" />
      </svg>
    );
  if (type === "guests")
    return (
      <svg viewBox="0 0 54 50">
        <circle cx="27" cy="14" r="8" />
        <circle cx="10" cy="19" r="6" />
        <circle cx="44" cy="19" r="6" />
        <path d="M13 45v-9c0-8 6-13 14-13s14 5 14 13v9H13ZM0 45v-7c0-7 4-11 11-11 3 0 5 1 7 3-3 3-4 6-4 11v4H0ZM40 45v-4c0-5-1-8-4-11 2-2 4-3 7-3 7 0 11 4 11 11v7H40Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 50 50">
      <ellipse cx="23" cy="12" rx="13" ry="6" />
      <path d="M10 12v9c0 8 26 8 26 0v-9M10 20v9c0 8 26 8 26 0v-9" />
      <ellipse cx="37" cy="31" rx="9" ry="4" />
      <path d="M28 31v8c0 5 18 5 18 0v-8" />
    </svg>
  );
}

export function Details({ onReserve }: DetailsProps) {
  const { t } = useI18n();
  const details = [
    { type: "date" as const, value: "14.11.26", label: t.details.date },
    { type: "place" as const, value: t.details.city, label: t.details.place },
    {
      type: "guests" as const,
      value: t.details.limited,
      label: t.details.guests,
    },
    { type: "price" as const, value: "120€", label: t.details.price },
  ];
  return (
    <section className="details" id="details">
      <div className="detailsPaper">
        <div className="wrap">
          <div className="detailsGrid">
            {details.map((detail) => (
              <div className="detail" key={detail.label}>
                <span className="detailIcon">
                  <DetailIcon type={detail.type} />
                </span>
                <strong>{detail.value}</strong>
                <small>{detail.label}</small>
              </div>
            ))}
          </div>
          <button className="primaryButton centered" onClick={onReserve}>
            {t.details.reserve} <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
