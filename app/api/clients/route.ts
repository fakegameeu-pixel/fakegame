import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminServices } from "../../lib/firebase-admin";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { clientId } = await request.json() as { clientId?: string };
    if (!token || !clientId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { adminAuth, adminDb } = getAdminServices();
    const caller = await adminAuth.verifyIdToken(token);
    const callerProfile = await adminDb.collection("users").doc(caller.uid).get();
    if (callerProfile.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [participantSnapshot, guestProfiles] = await Promise.all([
      adminDb.collection("participants").where("clientId", "==", clientId).get(),
      adminDb.collection("users").where("clientId", "==", clientId).get(),
    ]);

    await adminDb.runTransaction(async (transaction) => {
      const clientRef = adminDb.collection("clients").doc(clientId);
      const client = await transaction.get(clientRef);
      if (!client.exists) throw new Error("NOT_FOUND");

      const participantCounts = new Map<string, number>();
      for (const participant of participantSnapshot.docs) {
        const data = participant.data();
        const eventId = data.eventId as string | undefined;
        if (eventId) participantCounts.set(eventId, (participantCounts.get(eventId) ?? 0) + 1);
        if (eventId && data.roleId) transaction.update(adminDb.collection("events").doc(eventId).collection("roles").doc(data.roleId), { isActive: true, assignedAt: null });
        transaction.delete(participant.ref);
      }

      const linkedEventIds = new Set<string>([
        ...(Array.isArray(client.data()?.eventIds) ? client.data()?.eventIds : []),
        ...(client.data()?.eventId ? [client.data()?.eventId] : []),
        ...participantCounts.keys(),
      ]);
      for (const eventId of linkedEventIds) {
        transaction.update(adminDb.collection("events").doc(eventId), {
          clientIds: FieldValue.arrayRemove(clientId),
          ...(participantCounts.get(eventId) ? { participantCount: FieldValue.increment(-participantCounts.get(eventId)!) } : {}),
        });
      }
      for (const profile of guestProfiles.docs) transaction.delete(profile.ref);
      transaction.delete(clientRef);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Client deletion error", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: message === "NOT_FOUND" ? "Client not found" : "Could not delete client" }, { status: message === "NOT_FOUND" ? 404 : 500 });
  }
}
