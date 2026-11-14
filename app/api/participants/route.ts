import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminServices } from "../../lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { adminAuth, adminDb } = getAdminServices();
    const user = await adminAuth.verifyIdToken(token);
    const profile = await adminDb.collection("users").doc(user.uid).get();
    if (profile.data()?.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, gender, photoPath, roleId, eventId } = await request.json() as { name?: string; gender?: string; photoPath?: string; roleId?: string; eventId?: string };
    if (!name?.trim() || !photoPath || !eventId || !["male", "female"].includes(gender ?? "")) return NextResponse.json({ error: "Invalid participant data" }, { status: 400 });
    if (!photoPath.startsWith(`participant-photos/${user.uid}/`)) return NextResponse.json({ error: "Invalid photo" }, { status: 400 });
    if (!roleId) return NextResponse.json({ error: "Role is required" }, { status: 400 });
    await adminDb.runTransaction(async (transaction) => {
      const eventRef = adminDb.collection("events").doc(eventId);
      const roleRef = eventRef.collection("roles").doc(roleId);
      const role = await transaction.get(roleRef);
      if (!role.exists || role.data()?.isActive === false || ![gender, "any"].includes(role.data()?.gender)) {
        throw new Error("ROLE_UNAVAILABLE");
      }
      transaction.update(roleRef, { isActive: false, assignedAt: new Date() });
      transaction.create(adminDb.collection("participants").doc(), { name: name.trim(), gender, photoPath, roleId, eventId, createdAt: new Date() });
      transaction.update(eventRef, { participantCount: FieldValue.increment(1) });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Participant creation error", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: "Could not register participant" }, { status: message === "ROLE_UNAVAILABLE" ? 409 : 500 });
  }
}
