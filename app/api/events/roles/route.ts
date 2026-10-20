import { FieldValue } from "firebase-admin/firestore";
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

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return NextResponse.json({ error: "Could not save role" }, { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 });
}

export async function GET(request: Request) {
  try {
    const eventId = new URL(request.url).searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "Event is required" }, { status: 400 });
    const adminDb = await requireAdmin(request);
    const roles = await adminDb.collection("events").doc(eventId).collection("roles").orderBy("title").get();
    return NextResponse.json(roles.docs.map((item) => ({ id: item.id, ...item.data() })));
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const { eventId, title, description, gender, photoPath } = await request.json() as { eventId?: string; title?: string; description?: string; gender?: string; photoPath?: string };
    if (!eventId || !title?.trim() || !["male", "female", "any"].includes(gender ?? "")) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    const adminDb = await requireAdmin(request);
    const eventRef = adminDb.collection("events").doc(eventId);
    const roleRef = eventRef.collection("roles").doc();
    await adminDb.runTransaction(async (transaction) => { transaction.create(roleRef, { title: title.trim(), description: description?.trim() ?? "", gender, ...(photoPath ? { photoPath } : {}), isActive: true, createdAt: new Date() }); transaction.update(eventRef, { roleCount: FieldValue.increment(1) }); });
    return NextResponse.json({ id: roleRef.id });
  } catch (error) { return failure(error); }
}

export async function PATCH(request: Request) {
  try {
    const { eventId, roleId, title, description, gender, photoPath } = await request.json() as { eventId?: string; roleId?: string; title?: string; description?: string; gender?: string; photoPath?: string };
    if (!eventId || !roleId || !title?.trim() || !["male", "female", "any"].includes(gender ?? "")) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    const adminDb = await requireAdmin(request);
    await adminDb.collection("events").doc(eventId).collection("roles").doc(roleId).update({ title: title.trim(), description: description?.trim() ?? "", gender, ...(photoPath ? { photoPath } : {}) });
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request) {
  try {
    const { eventId, roleId } = await request.json() as { eventId?: string; roleId?: string };
    if (!eventId || !roleId) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    const adminDb = await requireAdmin(request);
    const eventRef = adminDb.collection("events").doc(eventId);
    await adminDb.runTransaction(async (transaction) => { transaction.delete(eventRef.collection("roles").doc(roleId)); transaction.update(eventRef, { roleCount: FieldValue.increment(-1) }); });
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}
