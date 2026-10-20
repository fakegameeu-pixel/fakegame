import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { clientId, eventId, roleId, gender, name, email, phone } = await request.json() as {
      clientId?: string; eventId?: string; roleId?: string; gender?: string; name?: string; email?: string; phone?: string;
    };
    if (!token || (!clientId && !name?.trim()) || !eventId || !["male", "female"].includes(gender ?? "")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { adminAuth, adminDb } = getAdminServices();
    const user = await adminAuth.verifyIdToken(token);
    const profile = await adminDb.collection("users").doc(user.uid).get();
    if (profile.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await adminDb.runTransaction(async (transaction) => {
      const clientRef = clientId ? adminDb.collection("clients").doc(clientId) : adminDb.collection("clients").doc();
      const eventRef = adminDb.collection("events").doc(eventId);
      const roleRef = roleId ? eventRef.collection("roles").doc(roleId) : undefined;
      const [client, event, role] = await Promise.all([transaction.get(clientRef), transaction.get(eventRef), roleRef ? transaction.get(roleRef) : Promise.resolve(undefined)]);
      if (!event.exists || (clientId && !client.exists) || (role && (!role.exists || role.data()?.isActive === false || ![gender, "any"].includes(role.data()?.gender)))) {
        throw new Error("ROLE_UNAVAILABLE");
      }
      if (!clientId) transaction.create(clientRef, { name: name?.trim(), email: email?.trim().toLowerCase() ?? "", phone: phone?.trim() ?? "", eventId, eventIds: [eventId], source: "manual", createdAt: new Date() });
      else transaction.update(clientRef, { eventId, eventIds: FieldValue.arrayUnion(eventId), updatedAt: new Date() });
      if (roleRef) transaction.update(roleRef, { isActive: false, assignedAt: new Date() });
      transaction.create(adminDb.collection("participants").doc(), {
        clientId: clientRef.id,
        eventId,
        ...(roleId ? { roleId } : {}),
        gender,
        name: clientId ? client.data()?.name ?? "Участник" : name?.trim(),
        createdAt: new Date(),
      });
      transaction.update(eventRef, { clientIds: FieldValue.arrayUnion(clientRef.id), participantCount: FieldValue.increment(1) });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Manual participant creation error", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: "Could not add participant" }, { status: message === "ROLE_UNAVAILABLE" ? 409 : 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { eventId, participantId, name, gender, roleId } = await request.json() as { eventId?: string; participantId?: string; name?: string; gender?: string; roleId?: string };
    if (!token || !eventId || !participantId || !name?.trim() || !["male", "female"].includes(gender ?? "")) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { adminAuth, adminDb } = getAdminServices();
    const user = await adminAuth.verifyIdToken(token);
    const profile = await adminDb.collection("users").doc(user.uid).get();
    if (profile.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await adminDb.runTransaction(async (transaction) => {
      const eventRef = adminDb.collection("events").doc(eventId);
      const participantRef = adminDb.collection("participants").doc(participantId);
      const participant = await transaction.get(participantRef);
      if (!participant.exists || participant.data()?.eventId !== eventId) throw new Error("PARTICIPANT_NOT_FOUND");
      const previousRoleId = participant.data()?.roleId as string | undefined;
      const nextRoleRef = roleId ? eventRef.collection("roles").doc(roleId) : undefined;
      const nextRole = nextRoleRef ? await transaction.get(nextRoleRef) : undefined;
      if (nextRole && (!nextRole.exists || (roleId !== previousRoleId && nextRole.data()?.isActive === false) || ![gender, "any"].includes(nextRole.data()?.gender))) throw new Error("ROLE_UNAVAILABLE");
      if (previousRoleId && previousRoleId !== roleId) transaction.update(eventRef.collection("roles").doc(previousRoleId), { isActive: true, assignedAt: null });
      if (nextRoleRef && roleId !== previousRoleId) transaction.update(nextRoleRef, { isActive: false, assignedAt: new Date() });
      transaction.update(participantRef, { name: name.trim(), gender, ...(roleId ? { roleId } : { roleId: FieldValue.delete() }), updatedAt: new Date() });
      const clientId = participant.data()?.clientId as string | undefined;
      if (clientId) transaction.update(adminDb.collection("clients").doc(clientId), { name: name.trim(), updatedAt: new Date() });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Participant update error", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: "Could not update participant" }, { status: message === "ROLE_UNAVAILABLE" ? 409 : 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { eventId, participantId } = await request.json() as { eventId?: string; participantId?: string };
    if (!token || !eventId || !participantId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { adminAuth, adminDb } = getAdminServices();
    const user = await adminAuth.verifyIdToken(token);
    const profile = await adminDb.collection("users").doc(user.uid).get();
    if (profile.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await adminDb.runTransaction(async (transaction) => {
      const eventRef = adminDb.collection("events").doc(eventId);
      const participantRef = adminDb.collection("participants").doc(participantId);
      const participant = await transaction.get(participantRef);
      if (!participant.exists || participant.data()?.eventId !== eventId) throw new Error("PARTICIPANT_NOT_FOUND");
      const participantData = participant.data();
      const clientId = participantData?.clientId as string | undefined;
      const clientRef = clientId ? adminDb.collection("clients").doc(clientId) : undefined;
      const client = clientRef ? await transaction.get(clientRef) : undefined;
      if (participantData?.roleId) transaction.update(eventRef.collection("roles").doc(participantData.roleId), { isActive: true, assignedAt: null });
      transaction.delete(participantRef);
      transaction.update(eventRef, { participantCount: FieldValue.increment(-1), ...(clientId ? { clientIds: FieldValue.arrayRemove(clientId) } : {}) });
      if (clientRef && client?.exists) {
        const remainingEventIds = Array.isArray(client.data()?.eventIds)
          ? client.data()?.eventIds.filter((id: unknown) => id !== eventId)
          : [];
        transaction.update(clientRef, {
          eventIds: remainingEventIds,
          ...(client.data()?.eventId === eventId ? { eventId: remainingEventIds[0] ?? FieldValue.delete() } : {}),
          updatedAt: new Date(),
        });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Participant delete error", error);
    return NextResponse.json({ error: "Could not delete participant" }, { status: 500 });
  }
}
