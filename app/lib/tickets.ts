import type { Firestore } from "firebase-admin/firestore";

// Номер билета: латиница и цифры, дефис допускается (например, FW-0001).
const TICKET_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,31}$/;

// В идентификаторах документов Firestore нельзя использовать «/», поэтому 20270213/01 хранится как 20270213-01.
export function normalizeTicket(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "").replace(/\//g, "-");
}

export function isValidTicket(value: string) {
  return TICKET_PATTERN.test(value);
}

// Публичная страница работает с активным мероприятием.
export async function findActiveEventId(adminDb: Firestore) {
  const snapshot = await adminDb.collection("events").where("isActive", "==", true).limit(1).get();
  return snapshot.docs[0]?.id;
}

// Роль свободна, если она активна и ещё не закреплена за билетом (или назначена участнику вручную).
export function isFreeRole(data: { isActive?: boolean; claimedTicket?: string }) {
  return data.isActive !== false && !data.claimedTicket;
}
