import { NextResponse } from "next/server";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { gender } = await request.json() as { gender?: string };
    if (!token || !["male", "female"].includes(gender ?? "")) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { adminAuth, adminDb } = getAdminServices();
    const user = await adminAuth.verifyIdToken(token);
    const profile = await adminDb.collection("users").doc(user.uid).get();
    if (profile.data()?.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const roles = (await adminDb.collection("roles").get()).docs.filter((role) => {
      const data = role.data();
      return data.isActive !== false && [gender, "any"].includes(data.gender);
    });
    if (!roles.length) return NextResponse.json({ error: "No roles available" }, { status: 409 });
    const selected = roles[Math.floor(Math.random() * roles.length)];
    return NextResponse.json({ id: selected.id, title: selected.data().title });
  } catch (error) {
    console.error("Role choice error", error);
    return NextResponse.json({ error: "Could not choose role" }, { status: 500 });
  }
}
