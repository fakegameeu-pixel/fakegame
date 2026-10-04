import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type Locale = "lv" | "ru" | "en";

type InvitationRequest = {
  name?: string;
  email?: string;
  phone?: string;
  locale?: Locale;
  consent?: boolean;
  website?: string;
};

const subjects: Record<Locale, string> = {
  lv: "Tavs ielūgums uz Mākslīgajām kāzām",
  ru: "Ваше приглашение на Фейковую свадьбу",
  en: "Your Fake Wedding invitation",
};

const clientLanguageNames: Record<Locale, string> = {
  lv: "латышский",
  ru: "русский",
  en: "английский",
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );
}

function emailLayout(content: string) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#fff5ee;color:#4e0e18"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff5ee"><tr><td style="padding:40px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;background:#ffffff;border:1px solid #e5c0b7"><tr><td style="height:8px;background:#a12535;font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:38px 32px 20px;text-align:center"><p style="margin:0;color:#a12535;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase">♡ Fake Wedding ♡</p><div style="width:54px;border-top:1px solid #d9aaa0;margin:18px auto 0"></div></td></tr>${content}<tr><td style="padding:24px 32px 30px;text-align:center;background:#4e0e18"><p style="margin:0;color:#e4b5a7;font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase">Fake Wedding</p></td></tr></table></td></tr></table></body></html>`;
}

function confirmationEmail(name: string, locale: Locale) {
  const copies: Record<
    Locale,
    { greeting: string; heading: string; body: string; closing: string }
  > = {
    lv: {
      greeting: "Sveiki",
      heading: "Paldies par interesi!",
      body: "Mēs saņēmām tavu pieteikumu uz Mākslīgajām kāzām. Drīzumā sazināsimies ar nākamo informāciju.",
      closing: "Līdz tikšanās reizei!",
    },
    ru: {
      greeting: "Здравствуйте",
      heading: "Спасибо за интерес!",
      body: "Мы получили вашу заявку на Фейковую свадьбу. Скоро свяжемся с дальнейшими деталями.",
      closing: "До встречи!",
    },
    en: {
      greeting: "Hello",
      heading: "Thank you for your interest!",
      body: "We received your request for the Fake Wedding. We will be in touch with the next details soon.",
      closing: "See you soon!",
    },
  };
  const copy = copies[locale];

  return emailLayout(
    `<tr><td style="padding:0 40px 40px;text-align:center"><p style="margin:0 0 14px;color:#87605d;font-family:Arial,sans-serif;font-size:15px;line-height:1.6">${copy.greeting}, ${escapeHtml(name)}!</p><h1 style="margin:0 0 18px;color:#7a1d2b;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:500;line-height:1.1">${copy.heading}</h1><p style="margin:0;color:#704b4a;font-family:Arial,sans-serif;font-size:16px;line-height:1.7">${copy.body}</p><p style="margin:27px 0 0;color:#a12535;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-style:italic">${copy.closing}</p></td></tr>`,
  );
}

function adminNotificationEmail(
  name: string,
  email: string,
  phone: string,
  locale: Locale,
) {
  return emailLayout(
    `<tr><td style="padding:0 40px 38px"><p style="margin:0 0 9px;color:#a12535;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.8px;text-align:center;text-transform:uppercase">Новая заявка</p><h1 style="margin:0 0 25px;color:#7a1d2b;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:500;line-height:1.1;text-align:center">Гость ждёт приглашения</h1><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#fff5ee"><tr><td style="padding:13px 16px;border-bottom:1px solid #e5c0b7;color:#87605d;font-family:Arial,sans-serif;font-size:13px">Имя</td><td style="padding:13px 16px;border-bottom:1px solid #e5c0b7;color:#4e0e18;font-family:Arial,sans-serif;font-size:14px;font-weight:700">${escapeHtml(name)}</td></tr><tr><td style="padding:13px 16px;border-bottom:1px solid #e5c0b7;color:#87605d;font-family:Arial,sans-serif;font-size:13px">E-mail</td><td style="padding:13px 16px;border-bottom:1px solid #e5c0b7;color:#4e0e18;font-family:Arial,sans-serif;font-size:14px;font-weight:700"><a href="mailto:${escapeHtml(email)}" style="color:#7a1d2b">${escapeHtml(email)}</a></td></tr><tr><td style="padding:13px 16px;border-bottom:1px solid #e5c0b7;color:#87605d;font-family:Arial,sans-serif;font-size:13px">Телефон</td><td style="padding:13px 16px;border-bottom:1px solid #e5c0b7;color:#4e0e18;font-family:Arial,sans-serif;font-size:14px;font-weight:700">${escapeHtml(phone)}</td></tr><tr><td style="padding:13px 16px;color:#87605d;font-family:Arial,sans-serif;font-size:13px">Язык клиента</td><td style="padding:13px 16px;color:#4e0e18;font-family:Arial,sans-serif;font-size:14px;font-weight:700">${clientLanguageNames[locale]} (${locale.toUpperCase()})</td></tr></table><p style="margin:20px 0 0;color:#87605d;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;text-align:center">Подтверждение уже отправлено гостю на выбранном языке сайта.</p></td></tr>`,
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InvitationRequest;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const locale: Locale =
      body.locale === "ru" || body.locale === "en" ? body.locale : "lv";

    if (body.website) return NextResponse.json({ ok: true });
    if (!name || !email || !phone || !body.consent)
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    if (!/^\S+@\S+\.\S+$/.test(email))
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from)
      return NextResponse.json(
        { error: "Email delivery is not configured yet." },
        { status: 503 },
      );

    const resend = new Resend(apiKey);
    const notificationEmail = process.env.RESEND_NOTIFICATION_EMAIL;
    const guestEmail = resend.emails.send({
      from,
      to: [email],
      subject: subjects[locale],
      html: confirmationEmail(name, locale),
    });
    const tasks: Promise<unknown>[] = [guestEmail];

    if (notificationEmail)
      tasks.push(
        resend.emails.send({
          from,
          to: [notificationEmail],
          subject: `Новая заявка Fake Wedding — ${name}`,
          html: adminNotificationEmail(name, email, phone, locale),
        }),
      );

    const segmentId = process.env.RESEND_SEGMENT_ID;
    if (segmentId)
      tasks.push(
        resend.contacts
          .create({
            email,
            firstName: name,
            unsubscribed: false,
            segments: [{ id: segmentId }],
            properties: { phone, locale },
          })
          .catch(() => undefined),
      );

    const results = await Promise.allSettled(tasks);
    const guestResult = results[0];
    if (
      guestResult.status === "rejected" ||
      (guestResult.status === "fulfilled" &&
        typeof guestResult.value === "object" &&
        guestResult.value !== null &&
        "error" in guestResult.value &&
        guestResult.value.error)
    )
      throw new Error("Resend could not deliver the confirmation.");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invitation email error", error);
    return NextResponse.json(
      { error: "Unable to send your request right now." },
      { status: 500 },
    );
  }
}
