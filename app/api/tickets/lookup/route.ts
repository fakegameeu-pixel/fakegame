import { NextResponse } from "next/server";
import { getAdminServices } from "../../../lib/firebase-admin";
import { findActiveEventId, isFreeRole, isValidTicket, normalizeTicket } from "../../../lib/tickets";
import { sanitizeTranslations } from "../../../lib/roleText";

export const runtime = "nodejs";

// Шаг 1: проверяем номер билета и отдаём список свободных ролей.
export async function POST(request: Request) {
  try {
    const { number } = (await request.json()) as { number?: string };
    const ticketNumber = normalizeTicket(number ?? "");
    if (!isValidTicket(ticketNumber)) return NextResponse.json({ error: "Введите корректный номер билета.", code: "INVALID_TICKET" }, { status: 400 });

    const { adminDb } = getAdminServices();
    const eventId = await findActiveEventId(adminDb);
    if (!eventId) return NextResponse.json({ error: "Мероприятие сейчас не активно.", code: "EVENT_INACTIVE" }, { status: 404 });

    const eventRef = adminDb.collection("events").doc(eventId);
    // Билет и роли читаем параллельно: раньше они шли друг за другом и гость ждал две поездки к базе.
    const [ticket, roles] = await Promise.all([
      eventRef.collection("tickets").doc(ticketNumber).get(),
      eventRef.collection("roles").get(),
    ]);
    if (!ticket.exists) return NextResponse.json({ error: "Номер билета не найден.", code: "TICKET_NOT_FOUND" }, { status: 404 });
    if (ticket.data()?.status === "claimed") return NextResponse.json({ error: "Номер билета не найден.", code: "TICKET_NOT_FOUND" }, { status: 404 });

    const freeRoles = roles.docs
      .filter((role) => isFreeRole(role.data()))
      .map((role) => ({
        id: role.id,
        title: String(role.data().title ?? ""),
        description: String(role.data().description ?? ""),
        translations: sanitizeTranslations(role.data().translations),
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "lv"));

    return NextResponse.json({ number: ticketNumber, roles: freeRoles });
  } catch (error) {
    console.error("Ticket lookup error", error);
    return NextResponse.json({ error: "Не удалось проверить билет. Попробуйте ещё раз.", code: "LOOKUP_FAILED" }, { status: 500 });
  }
}
