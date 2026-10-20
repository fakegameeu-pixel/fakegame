import { NextResponse } from "next/server";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  const { adminAuth, adminDb } = getAdminServices();
  const user = await adminAuth.verifyIdToken(token);
  const profile = await adminDb.collection("users").doc(user.uid).get();
  if (profile.data()?.role !== "admin") throw new Error("FORBIDDEN");
  return adminDb;
}

export async function GET(request: Request) {
  try {
    const eventId = new URL(request.url).searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "Event is required" }, { status: 400 });
    const adminDb = await requireAdmin(request);
    const [finds, participants, users] = await Promise.all([
      adminDb.collection("guestFinds").where("eventId", "==", eventId).get(),
      adminDb.collection("participants").where("eventId", "==", eventId).get(),
      adminDb.collection("users").where("eventId", "==", eventId).get(),
    ]);
    const guessedRoleIds = new Set(finds.docs.map((item) => item.data().participantId as string));
    const guestUsers = users.docs.filter((item) => item.data().role === "guest" && item.data().clientId);
    const guestToClient = new Map(guestUsers.map((item) => [item.id, item.data().clientId as string]));
    const guessesByClientId: Record<string, number> = {};
    finds.docs.forEach((item) => { const clientId = guestToClient.get(item.data().guestId); if (clientId) guessesByClientId[clientId] = (guessesByClientId[clientId] ?? 0) + 1; });
    return NextResponse.json({ guesses: finds.size, guessedRoles: guessedRoleIds.size, totalRoles: participants.docs.filter((item) => Boolean(item.data().roleId)).length, systemClientIds: guestUsers.map((item) => item.data().clientId as string), guessesByClientId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: "Could not load invitation stats" }, { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 });
  }
}
