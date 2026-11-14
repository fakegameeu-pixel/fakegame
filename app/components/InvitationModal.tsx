"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "../lib/i18n";

type InvitationModalProps = { onClose: () => void };

export function InvitationModal({ onClose }: InvitationModalProps) {
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(false);
  const { locale, t } = useI18n();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSending(true);
    setError(false);
    try {
      const response = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
          locale,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose}>
          ×
        </button>
        {sent ? (
          <div className="success">
            <span>♡</span>
            <h2>{t.modal.success}</h2>
            <p>{t.modal.successText}</p>
          </div>
        ) : (
          <>
            <p className="eyebrow dark">{t.modal.eyebrow}</p>
            <h2>{t.modal.title}</h2>
            <p>{t.modal.text}</p>
            <form onSubmit={submit}>
              <input required name="name" placeholder={t.modal.name} />
              <input
                required
                name="email"
                type="email"
                placeholder={t.modal.email}
              />
              <input
                required
                name="phone"
                type="tel"
                placeholder={t.modal.phone}
              />
              <input
                className="honeypot"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
              <label className="consent">
                <input required name="consent" type="checkbox" />{" "}
                <span>
                  {t.modal.consentStart}{" "}
                  <a href="/privacy-policy" target="_blank" rel="noreferrer">
                    {t.modal.policyLink}
                  </a>
                  .
                </span>
              </label>
              {error && (
                <p className="formError" role="alert">
                  {t.modal.error}
                </p>
              )}
              <button
                className="primaryButton"
                type="submit"
                disabled={isSending}
              >
                {isSending ? (
                  t.modal.sending
                ) : (
                  <>
                    {t.modal.submit} <span>→</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
