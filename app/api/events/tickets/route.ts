import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminServices } from "../../../lib/firebase-admin";
import { isValidTicket, normalizeTicket } from "../../../lib/tickets";

export const runtime = "nodejs";

// Firestore принимает не больше 500 операций в одном пакете и не больше 500 ссылок в одном getAll-запросе лучше.
const CHUNK = 400;

function chunks<T>(items: T[], size = CHUNK) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  const { adminAuth, adminDb } = getAdminServices();
  const user = await adminAuth.verifyIdToken(token);
  const profile = await adminDb.collection("users").doc(user.uid).get();
  if (profile.data()?.role !== "admin") throw new Error("FORBIDDEN");
  return adminDb;
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return NextResponse.json(
    { error: "Не удалось выполнить действие с билетами." },
    { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 },
  );
}

// Для билетов, занятых до появления участников у билетов, создаём запись участника (идемпотентно).
async function ensureTicketParticipants(
  adminDb: ReturnType<typeof getAdminServices>["adminDb"],
  eventId: string,
  claimed: { number: string; roleId: string | null; firstName: string | null; lastName: string | null; email: string | null; phone: string | null }[],
) {
  if (!claimed.length) return;
  const participantRefs = claimed.map((ticket) => adminDb.collection("participants").doc(`ticket-${ticket.number}`));
  const existing = await adminDb.getAll(...participantRefs);
  const missing = claimed.filter((_, index) => !existing[index].exists);
  if (!missing.length) return;
  const roleIds = [...new Set(missing.map((ticket) => ticket.roleId).filter((id): id is string => Boolean(id)))];
  const roleRefs = roleIds.map((id) => adminDb.collection("events").doc(eventId).collection("roles").doc(id));
  const roles = roleRefs.length ? await adminDb.getAll(...roleRefs) : [];
  const genderByRole = new Map<string, string>(roles.map((role) => [role.id, String(role.data()?.gender ?? "any")] as const));
  for (const batchItems of chunks(missing)) {
    const batch = adminDb.batch();
    for (const ticket of batchItems) {
      batch.set(adminDb.collection("participants").doc(`ticket-${ticket.number}`), {
        name: `${ticket.firstName ?? ""} ${ticket.lastName ?? ""}`.trim(),
        gender: genderByRole.get(ticket.roleId ?? "") ?? "any",
        roleId: ticket.roleId,
        eventId,
        ticketNumber: ticket.number,
        email: ticket.email ?? "",
        phone: ticket.phone ?? "",
        source: "ticket",
        createdAt: new Date(),
      });
    }
    batch.update(adminDb.collection("events").doc(eventId), { participantCount: FieldValue.increment(batchItems.length) });
    await batch.commit();
  }
}

// Список билетов мероприятия со статусом и закреплённой ролью.
export async function GET(request: Request) {
  try {
    const eventId = new URL(request.url).searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "Event is required" }, { status: 400 });
    const adminDb = await requireAdmin(request);
    const snapshot = await adminDb.collection("events").doc(eventId).collection("tickets").get();
    const tickets = snapshot.docs
      .map((item) => {
        const data = item.data();
        return {
          number: item.id,
          status: data.status === "claimed" ? "claimed" : "free",
          roleId: data.roleId ?? null,
          roleTitle: data.roleTitle ?? null,
          firstName: data.firstName ?? null,
          lastName: data.lastName ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          claimedAt: data.claimedAt?.toDate?.().toISOString() ?? null,
        };
      })
      .sort((a, b) => a.number.localeCompare(b.number, "en", { numeric: true }));
    await ensureTicketParticipants(adminDb, eventId, tickets.filter((ticket) => ticket.status === "claimed"));
    return NextResponse.json(tickets);
  } catch (error) {
    return failure(error);
  }
}

// Добавление билетов: списком номеров или серией по префиксу, например 20270213-01 … 20270213-100.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { eventId?: string; numbers?: string[]; prefix?: string; count?: number };
    const { eventId } = body;
    if (!eventId) return NextResponse.json({ error: "Invalid tickets" }, { status: 400 });

    let candidates: string[];
    if (body.prefix !== undefined) {
      const prefix = normalizeTicket(String(body.prefix));
      const count = Number(body.count);
      if (!prefix || !Number.isInteger(count) || count < 1) {
        return NextResponse.json({ error: "Укажите префикс и количество билетов (целое число больше нуля)." }, { status: 400 });
      }
      const width = 2;
      candidates = Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(width, "0")}`);
    } else {
      if (!Array.isArray(body.numbers) || !body.numbers.length) return NextResponse.json({ error: "Invalid tickets" }, { status: 400 });
      candidates = body.numbers.map((value) => normalizeTicket(String(value)));
    }

    const unique = [...new Set(candidates.filter(isValidTicket))];
    if (!unique.length) return NextResponse.json({ error: "Нет корректных номеров. Используйте латиницу, цифры, дефис или косую черту." }, { status: 400 });

    const adminDb = await requireAdmin(request);
    const ticketsRef = adminDb.collection("events").doc(eventId).collection("tickets");
    const existingIds = new Set<string>();
    for (const part of chunks(unique)) {
      const existing = await adminDb.getAll(...part.map((number) => ticketsRef.doc(number)));
      existing.forEach((item) => { if (item.exists) existingIds.add(item.id); });
    }
    const toCreate = unique.filter((number) => !existingIds.has(number));

    for (const part of chunks(toCreate)) {
      const batch = adminDb.batch();
      part.forEach((number) => batch.create(ticketsRef.doc(number), { number, status: "free", createdAt: new Date() }));
      await batch.commit();
    }

    return NextResponse.json({ created: toCreate.length, skipped: unique.length - toCreate.length });
  } catch (error) {
    return failure(error);
  }
}

// Удаляем только свободные билеты: занятый билет связан с ролью и контактами гостя.
// Удаление одного билета (свободного или занятого) или всех билетов мероприятия: { eventId, all: true }.
// Для занятых билетов освобождаем роль и удаляем участника, который создан при бронировании.
export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { eventId?: string; number?: string; all?: boolean };
    const { eventId } = body;
    if (!eventId) return NextResponse.json({ error: "Invalid ticket" }, { status: 400 });
    const adminDb = await requireAdmin(request);
    const eventRef = adminDb.collection("events").doc(eventId);

    if (body.all === true) {
      const snapshot = await eventRef.collection("tickets").get();
      const all = snapshot.docs.map((item) => ({ id: item.id, data: item.data() }));
      for (const batchTickets of chunks(all, 100)) {
        const claimed = batchTickets.filter((ticket) => ticket.data.status === "claimed");
        const roleRefs = [...new Set(claimed.map((ticket) => ticket.data.roleId).filter((id): id is string => Boolean(id)))]
          .map((id) => eventRef.collection("roles").doc(String(id)));
        const roles = roleRefs.length ? await adminDb.getAll(...roleRefs) : [];
        const roleDocs = new Map(roles.filter((role) => role.exists).map((role) => [role.id, role] as const));
        const participantRefs = claimed.map((ticket) => adminDb.collection("participants").doc(`ticket-${ticket.id}`));
        const participants = participantRefs.length ? await adminDb.getAll(...participantRefs) : [];
        const existingParticipants = participants.filter((participant) => participant.exists);

        const batch = adminDb.batch();
        for (const ticket of batchTickets) {
          batch.delete(eventRef.collection("tickets").doc(ticket.id));
        }
        for (const ticket of claimed) {
          const roleId = ticket.data.roleId ? String(ticket.data.roleId) : "";
          const role = roleDocs.get(roleId);
          if (role && role.data()?.claimedTicket === ticket.id) {
            batch.update(role.ref, { isActive: true, claimedTicket: FieldValue.delete() });
          }
        }
        for (const participant of existingParticipants) {
          batch.delete(participant.ref);
        }
        if (existingParticipants.length) {
          batch.update(eventRef, { participantCount: FieldValue.increment(-existingParticipants.length) });
        }
        await batch.commit();
      }
      return NextResponse.json({ ok: true, deleted: all.length });
    }

    const ticketNumber = normalizeTicket(body.number ?? "");
    if (!isValidTicket(ticketNumber)) return NextResponse.json({ error: "Invalid ticket" }, { status: 400 });
    const ticketRef = eventRef.collection("tickets").doc(ticketNumber);
    const participantRef = adminDb.collection("participants").doc(`ticket-${ticketNumber}`);
    await adminDb.runTransaction(async (transaction) => {
      // Все чтения выполняем до записей: билет, роль и участник, созданный при бронировании.
      const ticket = await transaction.get(ticketRef);
      if (!ticket.exists) throw new Error("NOT_FOUND");
      const data = ticket.data();
      if (data?.status === "claimed") {
        const roleRef = data.roleId ? eventRef.collection("roles").doc(String(data.roleId)) : null;
        const role = roleRef ? await transaction.get(roleRef) : null;
        const participant = await transaction.get(participantRef);
        // Роль освобождаем, только если она закреплена именно за этим билетом.
        if (roleRef && role?.exists && role.data()?.claimedTicket === ticketNumber) {
          transaction.update(roleRef, { isActive: true, claimedTicket: FieldValue.delete() });
        }
        if (participant.exists) {
          transaction.delete(participantRef);
          transaction.update(eventRef, { participantCount: FieldValue.increment(-1) });
        }
      }
      transaction.delete(ticketRef);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Билет не найден." }, { status: 404 });
    return failure(error);
  }
}
