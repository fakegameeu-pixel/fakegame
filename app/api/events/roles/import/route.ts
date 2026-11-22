import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminServices } from "../../../../lib/firebase-admin";

export const runtime = "nodejs";

type Locale = "lv" | "ru" | "en";
const LOCALES: Locale[] = ["lv", "ru", "en"];
const MAX_ROLES = 300;

type Translated = Partial<Record<Locale, string>>;
type ImportRole = { title?: Translated; description?: Translated; gender?: string; count?: number };

async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  const { adminAuth, adminDb } = getAdminServices();
  const user = await adminAuth.verifyIdToken(token);
  const profile = await adminDb.collection("users").doc(user.uid).get();
  if (profile.data()?.role !== "admin") throw new Error("FORBIDDEN");
  return adminDb;
}

// Проверяет один элемент из JSON и возвращает текст ошибки или null.
function validate(role: ImportRole, index: number): string | null {
  const where = `Роль №${index + 1}`;
  for (const locale of LOCALES) {
    if (!role.title?.[locale]?.trim()) return `${where}: заполните название на языке «${locale}».`;
  }
  if (role.gender !== undefined && !["male", "female", "any"].includes(role.gender)) return `${where}: gender должен быть male, female или any.`;
  if (role.count !== undefined && (!Number.isInteger(role.count) || role.count < 1 || role.count > 50)) return `${where}: count должен быть от 1 до 50.`;
  return null;
}

// Импорт ролей из JSON: название и описание на трёх языках, количество одинаковых ролей.
export async function POST(request: Request) {
  try {
    const { eventId, roles } = (await request.json()) as { eventId?: string; roles?: ImportRole[] };
    if (!eventId || !Array.isArray(roles) || !roles.length) return NextResponse.json({ error: "В файле нет ролей." }, { status: 400 });

    for (let index = 0; index < roles.length; index += 1) {
      const problem = validate(roles[index], index);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }

    const total = roles.reduce((sum, role) => sum + (role.count ?? 1), 0);
    if (total > MAX_ROLES) return NextResponse.json({ error: `За один раз можно импортировать не больше ${MAX_ROLES} ролей.` }, { status: 400 });

    const adminDb = await requireAdmin(request);
    const eventRef = adminDb.collection("events").doc(eventId);
    const batch = adminDb.batch();
    for (const role of roles) {
      const translations = Object.fromEntries(
        LOCALES.map((locale) => [locale, { title: role.title?.[locale]?.trim() ?? "", description: role.description?.[locale]?.trim() ?? "" }]),
      );
      // Поля title и description остаются русскими: по ним админка показывает и сортирует роли.
      const data = {
        title: translations.ru.title,
        description: translations.ru.description,
        translations,
        gender: role.gender ?? "any",
        isActive: true,
        createdAt: new Date(),
      };
      for (let copy = 0; copy < (role.count ?? 1); copy += 1) batch.set(eventRef.collection("roles").doc(), data);
    }
    batch.update(eventRef, { roleCount: FieldValue.increment(total) });
    await batch.commit();
    return NextResponse.json({ created: total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Войдите в аккаунт администратора." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Нет доступа." }, { status: 403 });
    console.error("Role import error", error);
    return NextResponse.json({ error: "Не удалось импортировать роли." }, { status: 500 });
  }
}
