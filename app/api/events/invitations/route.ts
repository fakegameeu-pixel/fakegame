import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function invitationFailure(error: unknown, origin: string) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("operation-not-allowed")) return "В Firebase Authentication включите вход по e-mail со ссылкой.";
  if (code.includes("unauthorized-continue-uri") || code.includes("invalid-continue-uri")) return `Добавьте ${origin} в Authorized domains Firebase Authentication.`;
  if (code.includes("invalid-dynamic-link-domain")) return "Проверьте домен для ссылок входа в Firebase Authentication.";
  return "Не удалось создать ссылку для входа гостя. Проверьте настройки Firebase Authentication.";
}

async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  const { adminAuth, adminDb } = getAdminServices();
  const user = await adminAuth.verifyIdToken(token);
  const profile = await adminDb.collection("users").doc(user.uid).get();
  if (profile.data()?.role !== "admin") throw new Error("FORBIDDEN");
  return { adminAuth, adminDb };
}

export async function POST(request: Request) {
  try {
    const { eventId, participantIds } = await request.json() as { eventId?: string; participantIds?: string[] };
    if (!eventId || !participantIds?.length) return NextResponse.json({ error: "Participants are required" }, { status: 400 });
    const { adminAuth, adminDb } = await requireAdmin(request);
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) return NextResponse.json({ error: "Не настроена отправка e-mail: добавьте RESEND_API_KEY и RESEND_FROM_EMAIL." }, { status: 503 });
    const snapshots = await Promise.all(participantIds.map((id) => adminDb.collection("participants").doc(id).get()));
    const selected = snapshots.filter((item) => item.exists && item.data()?.eventId === eventId);
    const clientIds = [...new Set(selected.map((item) => item.data()?.clientId as string | undefined).filter(Boolean))] as string[];
    const clientSnapshots = await Promise.all(clientIds.map((id) => adminDb.collection("clients").doc(id).get()));
    const clients = new Map(clientSnapshots.filter((item) => item.exists).map((item) => [item.id, item.data()]));
    const invitations = await Promise.all(selected.map(async (participant) => {
      const client = clients.get(participant.data()?.clientId);
      const email = client?.email?.trim().toLowerCase();
      if (!email) return { participantId: participant.id, clientId: participant.data()?.clientId as string | undefined, name: participant.data()?.name ?? "Участник", email: "", url: "" };
      let url: string;
      try { url = await adminAuth.generateSignInWithEmailLink(email, { url: `${origin}/guest`, handleCodeInApp: true }); } catch (error) { throw new Error(invitationFailure(error, origin)); }
      return { participantId: participant.id, clientId: participant.data()?.clientId as string | undefined, name: participant.data()?.name ?? "Участник", email, url };
    }));
    const resend = new Resend(apiKey);
    const delivered = await Promise.allSettled(invitations.filter((item) => item.email).map(async (invitation) => {
      const result = await resend.emails.send({
        from,
        to: [invitation.email],
        subject: "Ваш аккаунт гостя Fake Wedding",
        html: `<!doctype html><html><body style="margin:0;padding:32px;background:#fff6ef;color:#4e0e18;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:36px;background:#fff;border:1px solid #e5c0b7"><p style="margin:0;color:#a12535;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Fake Wedding</p><h1 style="font-family:Georgia,serif;font-weight:500">Здравствуйте, ${escapeHtml(invitation.name)}!</h1><p>Для вас открыт личный аккаунт гостя. В нём будут фотографии и роли участников игры.</p><p>Нажмите кнопку, чтобы войти без пароля:</p><p><a href="${invitation.url}" style="display:inline-block;padding:14px 20px;background:#8d1f2f;color:#fff;text-decoration:none;font-weight:bold">Открыть аккаунт гостя</a></p><p style="color:#765b5b;font-size:12px">Ссылка предназначена только для вас.</p></div></body></html>`,
      });
      if (result.error) throw new Error(result.error.message);
      if (invitation.clientId) await adminDb.collection("clients").doc(invitation.clientId).set({ guestInviteSentAt: new Date() }, { merge: true });
      return invitation.participantId;
    }));
    const sent = delivered.filter((item) => item.status === "fulfilled").length;
    const failed = delivered.length - sent;
    return NextResponse.json({ sent, failed, skipped: invitations.filter((item) => !item.email).length });
  } catch (error) {
    console.error("Invitation link preparation error", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: message || "Не удалось подготовить приглашения." }, { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 });
  }
}
