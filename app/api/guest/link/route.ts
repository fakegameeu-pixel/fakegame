import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

// Одно письмо со ссылкой для входа в гостевой кабинет (вместо стандартного письма Firebase).
// Ссылку отправляем только e-mail, который привязан к активному мероприятию.
export async function POST(request: Request) {
  try {
    const { email: rawEmail } = (await request.json()) as { email?: string };
    const email = String(rawEmail ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Введите корректный e-mail." }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) return NextResponse.json({ error: "Отправка писем не настроена. Сообщите организаторам." }, { status: 503 });

    const { adminAuth, adminDb } = getAdminServices();
    const matches = await adminDb.collection("clients").where("email", "==", email).limit(5).get();
    let linked = matches.docs.some((item) => Boolean(item.data().eventId || item.data().eventIds?.[0]));
    if (!linked) {
      for (const candidate of matches.docs) {
        const eventMatch = await adminDb.collection("events").where("clientIds", "array-contains", candidate.id).limit(1).get();
        if (!eventMatch.empty) { linked = true; break; }
      }
    }
    if (!linked) return NextResponse.json({ error: "Этот e-mail не привязан к активному мероприятию." }, { status: 403 });

    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const loginUrl = await adminAuth.generateSignInWithEmailLink(email, { url: `${origin}/guest`, handleCodeInApp: true });

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: [email],
      subject: "Вход в гостевой кабинет Fake Wedding",
      html: `<!doctype html><html><body style="margin:0;padding:32px;background:#fff6ef;color:#4e0e18;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:36px;background:#fff;border:1px solid #e5c0b7"><p style="margin:0;color:#a12535;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Fake Wedding</p><h1 style="font-family:Georgia,serif;font-weight:500">Вход в гостевой кабинет</h1><p>Нажмите кнопку, чтобы войти без пароля. В кабинете видны ваша роль и памятка.</p><p><a href="${loginUrl}" style="display:inline-block;padding:14px 20px;background:#8d1f2f;color:#fff;text-decoration:none;font-weight:bold">Открыть гостевой кабинет</a></p><p style="color:#765b5b;font-size:12px">Если вы не запрашивали ссылку, просто проигнорируйте письмо. Ссылка одноразовая.</p></div></body></html>`,
    });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Guest link error", error);
    return NextResponse.json({ error: "Не удалось отправить ссылку. Попробуйте позже." }, { status: 500 });
  }
}
