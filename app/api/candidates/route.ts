import { NextResponse } from "next/server";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import type { Storage } from "firebase-admin/storage";
import { getAdminServices } from "../../lib/firebase-admin";

export const runtime = "nodejs";

type Locale = "lv" | "ru" | "en";

type CandidateRequest = {
  locale?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  height?: string | number;
  weight?: string | number;
  shoeSize?: string | number;
  videoPath?: string;
  consent?: boolean;
  website?: string;
};

// Ошибки отдаём кодами: текст выбирает сайт по языку.
function fail(code: string) {
  return NextResponse.json({ code }, { status: 400 });
}

function isAdult(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 18 && age < 100;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

// Публичная ссылка на видео в формате Firebase: открывается без входа, пока у неё есть токен.
async function publicVideoUrl(storage: Storage, path: string) {
  const bucket = storage.bucket();
  const file = bucket.file(path);
  const [metadata] = await file.getMetadata();
  let token = metadata.metadata?.firebaseStorageDownloadTokens as string | undefined;
  if (!token) {
    token = randomUUID();
    await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
  }
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

// Письмо кандидату — на языке сайта. Письмо администратору — на русском, его читает команда.
const candidateCopy: Record<Locale, { subject: string; greeting: (name: string) => string; body: string }> = {
  lv: {
    subject: "Tava Fake Wedding anketa ir saņemta",
    greeting: (name) => `Sveiki, ${name}!`,
    body: "Mēs saņēmām tavu anketu un video vizītkarti. Mēs tās apskatīsim un sazināsimies ar tevi pa e-pastu vai tālruni.",
  },
  ru: {
    subject: "Твоя анкета на Fake Wedding получена",
    greeting: (name) => `Здравствуйте, ${name}!`,
    body: "Мы получили твою анкету и видеовизитку. Мы посмотрим их и свяжемся с тобой по e-mail или телефону.",
  },
  en: {
    subject: "Your Fake Wedding application is received",
    greeting: (name) => `Hello, ${name}!`,
    body: "We have received your application and video introduction. We will review them and contact you by e-mail or phone.",
  },
};

// Письмо кандидату и уведомление администратору. Если Resend не настроен, просто пропускаем.
async function sendCandidateEmails(params: {
  id: string;
  locale: Locale;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  height: number;
  weight: number;
  shoeSize: number;
  videoPath: string;
  storage: Storage;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;

  // Публичная ссылка на видео для администратора.
  let videoUrl = "";
  try {
    videoUrl = await publicVideoUrl(params.storage, params.videoPath);
  } catch (error) {
    console.error("Candidate video link error", error);
  }

  const resend = new Resend(apiKey);
  const roleLabel = params.role === "groom" ? "Жених" : "Невеста";
  const fullName = `${params.firstName} ${params.lastName}`;
  const wrap = (content: string) =>
    `<!doctype html><html><body style="margin:0;padding:32px;background:#fff6ef;color:#4e0e18;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:36px;background:#fff;border:1px solid #e5c0b7">${content}</div></body></html>`;
  const copy = candidateCopy[params.locale];

  const tasks = [
    resend.emails.send({
      from,
      to: [params.email],
      subject: copy.subject,
      html: wrap(
        `<p style="margin:0;color:#a12535;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Fake Wedding</p><h1 style="font-family:Georgia,serif;font-weight:500">${escapeHtml(copy.greeting(params.firstName))}</h1><p style="line-height:1.6">${copy.body}</p>`,
      ),
    }),
  ];

  const notification = process.env.RESEND_NOTIFICATION_EMAIL;
  if (notification) {
    const rows = [
      ["Кто", roleLabel],
      ["Имя", fullName],
      ["E-mail", params.email],
      ["Телефон", params.phone],
      ["Дата рождения", params.birthDate],
      ["Рост, см", String(params.height)],
      ["Вес, кг", String(params.weight)],
      ["Размер ноги (EU)", String(params.shoeSize)],
      ["Язык сайта", params.locale.toUpperCase()],
      ["ID анкеты", params.id],
      ["Видео", videoUrl ? `<a href="${videoUrl}" style="display:inline-block;padding:10px 22px;background:#e0b26a;color:#2a0a12;text-decoration:none;border-radius:999px;font-weight:bold">Смотреть видеовизитку</a>` : "Ссылка не создана, см. логи сервера"],
    ]
      .map(([label, value]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5c0b7;color:#87605d">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #e5c0b7;font-weight:bold">${label === "Видео" ? value : escapeHtml(value)}</td></tr>`)
      .join("");
    tasks.push(
      resend.emails.send({
        from,
        to: [notification],
        subject: `Новая анкета Fake Wedding: ${roleLabel} — ${fullName}`,
        html: wrap(`<h1 style="font-family:Georgia,serif;font-weight:500">Новая анкета</h1><table style="width:100%;border-collapse:collapse">${rows}</table>`),
      }),
    );
  }

  const results = await Promise.all(tasks);
  for (const result of results) if (result.error) throw new Error(result.error.message);
}

// Сохраняет анкету жениха или невесты. Видео уже загружено в Storage через /api/candidates/video.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CandidateRequest;
    // Скрытое поле для ботов: если его заполнили, делаем вид, что всё сохранено.
    if (body.website) return NextResponse.json({ ok: true });

    const locale: Locale = body.locale === "ru" || body.locale === "en" ? body.locale : "lv";
    const role = body.role === "groom" || body.role === "bride" ? body.role : "";
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const birthDate = String(body.birthDate ?? "").trim();
    const height = Number(String(body.height ?? "").replace(",", "."));
    const weight = Number(String(body.weight ?? "").replace(",", "."));
    const shoeSize = Number(String(body.shoeSize ?? "").replace(",", "."));
    const videoPath = String(body.videoPath ?? "");

    if (!role) return fail("ROLE_REQUIRED");
    if (!firstName || !lastName || firstName.length > 60 || lastName.length > 60) return fail("NAME_REQUIRED");
    if (phone.replace(/\D/g, "").length < 6) return fail("PHONE_INVALID");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("EMAIL_INVALID");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !isAdult(birthDate)) return fail("BIRTH_DATE_INVALID");
    if (!Number.isInteger(height) || height < 100 || height > 250) return fail("HEIGHT_INVALID");
    if (!Number.isFinite(weight) || weight < 30 || weight > 250) return fail("WEIGHT_INVALID");
    if (!Number.isFinite(shoeSize) || shoeSize < 20 || shoeSize > 60) return fail("SHOE_INVALID");
    if (!body.consent) return fail("CONSENT_REQUIRED");
    if (!videoPath.startsWith("candidates/") || videoPath.includes("..")) return fail("VIDEO_REQUIRED");

    const { adminDb, adminStorage } = getAdminServices();
    const [videoExists] = await adminStorage.bucket().file(videoPath).exists();
    if (!videoExists) return fail("VIDEO_NOT_FOUND");

    const ref = await adminDb.collection("candidates").add({
      role,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      phone,
      email,
      birthDate,
      height,
      weight,
      shoeSize,
      videoPath,
      locale,
      status: "new",
      consentAt: new Date(),
      createdAt: new Date(),
    });
    // Письма отправляем после сохранения: если почта недоступна, анкета всё равно сохранена.
    await sendCandidateEmails({ id: ref.id, locale, role, firstName, lastName, email, phone, birthDate, height, weight, shoeSize, videoPath, storage: adminStorage }).catch((error) =>
      console.error("Candidate email error", error),
    );
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (error) {
    console.error("Candidate save error", error);
    return NextResponse.json({ code: "SAVE_FAILED" }, { status: 500 });
  }
}
