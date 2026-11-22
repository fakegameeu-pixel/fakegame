import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import { getAdminServices } from "../../../lib/firebase-admin";
import { findActiveEventId, isValidTicket, normalizeTicket } from "../../../lib/tickets";

export const runtime = "nodejs";

type Locale = "lv" | "ru" | "en";

type ClaimRequest = {
  number?: string;
  roleId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  locale?: string;
};

// Тексты письма с ролью на языке, который гость выбрал на сайте.
const roleEmailCopy: Record<Locale, { subject: (title: string) => string; greeting: (name: string) => string; confirmed: string; roleLabel: string }> = {
  lv: { subject: (title) => `Tava loma Fake Wedding: ${title}`, greeting: (name) => `Sveiki, ${name}!`, confirmed: "Tava loma vakarā ir apstiprināta. Biļete", roleLabel: "Tava loma" },
  ru: { subject: (title) => `Твоя роль на Fake Wedding: ${title}`, greeting: (name) => `Здравствуйте, ${name}!`, confirmed: "Твоя роль на вечере подтверждена. Билет", roleLabel: "Твоя роль" },
  en: { subject: (title) => `Your Fake Wedding role: ${title}`, greeting: (name) => `Hello, ${name}!`, confirmed: "Your role for the evening is confirmed. Ticket", roleLabel: "Your role" },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

// Письмо с ролью, описанием и ссылкой для входа в гостевой кабинет.
// Возвращает false, если отправка не настроена (нет RESEND_API_KEY или RESEND_FROM_EMAIL).
async function sendRoleEmail(params: {
  adminAuth: ReturnType<typeof getAdminServices>["adminAuth"];
  origin: string;
  email: string;
  firstName: string;
  eventTitle: string;
  eventDate?: string;
  ticketNumber: string;
  roleTitle: string;
  roleDescription: string;
  locale: Locale;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const description = params.roleDescription ? escapeHtml(params.roleDescription).replace(/\n/g, "<br>") : "";
  const eventLine = [params.eventTitle, params.eventDate].filter(Boolean).map((item) => escapeHtml(String(item))).join(" · ");

  const texts = roleEmailCopy[params.locale];
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: [params.email],
    subject: texts.subject(params.roleTitle),
    html: `<!doctype html><html><body style="margin:0;padding:32px;background:#fff6ef;color:#4e0e18;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:36px;background:#fff;border:1px solid #e5c0b7"><p style="margin:0;color:#a12535;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Fake Wedding</p><h1 style="font-family:Georgia,serif;font-weight:500">${texts.greeting(escapeHtml(params.firstName))}</h1><p>${texts.confirmed} <b>${escapeHtml(params.ticketNumber)}</b>${eventLine ? ` · ${eventLine}` : ""}.</p><div style="margin:24px 0;padding:20px;background:#fdf3ee;border-left:3px solid #8d1f2f"><p style="margin:0 0 8px;color:#a12535;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">${texts.roleLabel}</p><h2 style="margin:0 0 10px;font-family:Georgia,serif;font-weight:500">${escapeHtml(params.roleTitle)}</h2><p style="margin:0;line-height:1.6">${description}</p></div></div></body></html>`,
  });
  if (result.error) throw new Error(result.error.message);
  return true;
}

// Шаг 3: закрепляем роль за билетом и сохраняем контакты. Всё в одной транзакции,
// поэтому роль не может достаться двум гостям одновременно.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ClaimRequest;
    const ticketNumber = normalizeTicket(body.number ?? "");
    const roleId = String(body.roleId ?? "").trim();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const locale: Locale = body.locale === "ru" || body.locale === "en" ? body.locale : "lv";

    if (!isValidTicket(ticketNumber) || !roleId) return NextResponse.json({ error: "Не хватает номера билета или роли.", code: "MISSING_FIELDS" }, { status: 400 });
    if (!firstName || !lastName || firstName.length > 60 || lastName.length > 60) return NextResponse.json({ error: "Введите имя и фамилию.", code: "NAME_REQUIRED" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Введите корректный e-mail.", code: "EMAIL_INVALID" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 6) return NextResponse.json({ error: "Введите корректный телефон.", code: "PHONE_INVALID" }, { status: 400 });

    const { adminAuth, adminDb } = getAdminServices();
    const eventId = await findActiveEventId(adminDb);
    if (!eventId) return NextResponse.json({ error: "Мероприятие сейчас не активно.", code: "EVENT_INACTIVE" }, { status: 404 });

    const eventRef = adminDb.collection("events").doc(eventId);
    const ticketRef = eventRef.collection("tickets").doc(ticketNumber);
    const roleRef = eventRef.collection("roles").doc(roleId);
    // Гостевой кабинет входит по e-mail только для записей из collection clients.
    // Если клиент с этим e-mail уже есть (например, оставил заявку с лендинга), дописываем ему мероприятие.
    // Если клиента нет, создаём новую запись сразу с мероприятием.
    const emailClientRef = adminDb.collection("clients").doc(email);
    const newClientRef = adminDb.collection("clients").doc(`ticket-${ticketNumber}`);

    const claimed = await adminDb.runTransaction(async (transaction) => {
      const ticket = await transaction.get(ticketRef);
      if (!ticket.exists) throw new Error("TICKET_NOT_FOUND");
      if (ticket.data()?.status === "claimed") throw new Error("TICKET_CLAIMED");

      const role = await transaction.get(roleRef);
      const roleData = role.data();
      if (!role.exists || roleData?.isActive === false || roleData?.claimedTicket) throw new Error("ROLE_TAKEN");

      const now = new Date();
      const existingClient = await transaction.get(emailClientRef);
      const clientRef = existingClient.exists ? emailClientRef : newClientRef;
      const clientId = clientRef.id;
      const participantRef = adminDb.collection("participants").doc(`ticket-${ticketNumber}`);
      transaction.update(roleRef, { isActive: false, claimedTicket: ticketNumber, assignedAt: now });
      transaction.set(clientRef, {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        eventId,
        eventIds: FieldValue.arrayUnion(eventId),
        source: "ticket",
        updatedAt: now,
      }, { merge: true });
      transaction.set(participantRef, {
        name: `${firstName} ${lastName}`,
        gender: roleData?.gender ?? "any",
        roleId,
        eventId,
        ticketNumber,
        email,
        phone,
        clientId,
        source: "ticket",
        createdAt: now,
      });
      transaction.update(eventRef, { participantCount: FieldValue.increment(1) });
      transaction.update(ticketRef, {
        status: "claimed",
        roleId,
        roleTitle: String(roleData?.title ?? ""),
        firstName,
        lastName,
        email,
        phone,
        claimedAt: now,
      });
      const translated = (roleData?.translations as Record<string, { title?: string; description?: string }> | undefined)?.[locale];
      return { title: String(translated?.title || roleData?.title || ""), description: String(translated?.description || roleData?.description || "") };
    });

    // Письмо отправляем после транзакции: если почта недоступна, выбор роли всё равно сохранён.
    let emailSent = false;
    try {
      const event = await eventRef.get();
      const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
      emailSent = await sendRoleEmail({
        adminAuth,
        origin,
        email,
        firstName,
        eventTitle: String(event.data()?.title ?? "Fake Wedding"),
        eventDate: event.data()?.date ? String(event.data()?.date) : undefined,
        ticketNumber,
        roleTitle: claimed.title,
        roleDescription: claimed.description,
        locale,
      });
    } catch (error) {
      console.error("Role email error", error);
    }

    return NextResponse.json({ ok: true, roleTitle: claimed.title, roleDescription: claimed.description, emailSent, email });
  } catch (error) {
    console.error("Ticket claim error", error);
    const message = error instanceof Error ? error.message : "";
    const status = message === "TICKET_NOT_FOUND" ? 404 : message === "TICKET_CLAIMED" || message === "ROLE_TAKEN" ? 409 : 500;
    const text =
      message === "TICKET_NOT_FOUND"
        ? "Билет не найден."
        : message === "TICKET_CLAIMED"
          ? "Этот билет уже выбрал роль."
          : message === "ROLE_TAKEN"
            ? "Эта роль уже занята. Выбери другую."
            : "Не удалось сохранить выбор. Попробуй ещё раз.";
    const code = ["TICKET_NOT_FOUND", "TICKET_CLAIMED", "ROLE_TAKEN"].includes(message) ? message : "SAVE_FAILED";
    return NextResponse.json({ error: text, code }, { status });
  }
}
