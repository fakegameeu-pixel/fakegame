import { NextResponse } from "next/server";
import { getAdminServices } from "../../lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { adminAuth, adminDb } = getAdminServices();
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const caller = await adminAuth.verifyIdToken(token);
    if (!process.env.FIREBASE_ADMIN_UID || caller.uid !== process.env.FIREBASE_ADMIN_UID) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { email, password, name, role } = await request.json() as { email?: string; password?: string; name?: string; role?: string };
    if (!email || !password || !name || role !== "manager" || password.length < 6) {
      return NextResponse.json({ error: "Invalid account data" }, { status: 400 });
    }
    const user = await adminAuth.createUser({ email, password, displayName: name });
    await adminDb.collection("users").doc(user.uid).set({ email, name, role, createdAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Account creation error", error);
    return NextResponse.json({ error: "Could not create account" }, { status: 400 });
  }
}
