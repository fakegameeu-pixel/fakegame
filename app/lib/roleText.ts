// Тексты роли по языкам лежат в translations (lv / ru / en).
// Основные поля title / description остаются как запасной вариант для старых ролей.

export type RoleText = { title: string; description: string };
export type RoleTranslations = { lv?: RoleText; ru?: RoleText; en?: RoleText };

const translatedLocales = ["lv", "ru", "en"] as const;

// Оставляем только непустые переводы из входящих данных.
export function sanitizeTranslations(input: unknown): RoleTranslations {
  const result: RoleTranslations = {};
  if (!input || typeof input !== "object") return result;
  const source = input as Record<string, unknown>;
  for (const locale of translatedLocales) {
    const item = source[locale];
    if (!item || typeof item !== "object") continue;
    const values = item as Record<string, unknown>;
    const title = String(values.title ?? "").trim();
    const description = String(values.description ?? "").trim();
    if (title) result[locale] = { title, description };
  }
  return result;
}

// Возвращает текст роли для языка страницы; если перевода нет, берём основные поля.
export function localizeRole(
  role: { title: string; description?: string; translations?: RoleTranslations },
  locale: string,
): RoleText {
  const base: RoleText = { title: role.title, description: role.description ?? "" };
  if (locale !== "lv" && locale !== "ru" && locale !== "en") return base;
  return role.translations?.[locale] ?? base;
}
