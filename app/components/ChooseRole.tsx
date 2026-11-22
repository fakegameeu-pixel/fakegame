"use client";

import { FormEvent, useState } from "react";
import "./fakeWedding.css";
import "./landing/Buttons.css";
import "./ChooseRole.css";
import { Header } from "./landing/Header";
import { useI18n } from "../lib/i18n";

type Role = { id: string; title: string; description: string };
type ServerRole = Role & { translations?: Partial<Record<"lv" | "ru" | "en", { title: string; description: string }>> };

function localizeRole(role: ServerRole, locale: "lv" | "ru" | "en"): Role {
  const translated = role.translations?.[locale];
  return { id: role.id, title: translated?.title || role.title, description: translated?.description || role.description };
}
type Step = "ticket" | "role" | "contacts" | "done";
type RoleGroup = { key: string; title: string; description: string; roles: Role[] };

const copy = {
  lv: {
    ticket: { step: "1. solis", title: ["Ievadi savu", "biļetes numuru."], lead: "Numuru atradīsi savā biļetē vai ielūgumā.", label: "Biļetes numurs", placeholder: "Piem., FW-0001", next: "Turpināt →", checking: "Pārbaudām…" },
    role: { step: "2. solis", title: ["Izvēlies", "lomu."], lead: "Rādam tikai brīvās lomas. Pēc izvēles loma tiks piesaistīta tavai biļetei.", choose: "Izvēlēties →", free: (n: number) => `Brīvas: ${n}`, allTaken: "Visas lomas šobrīd ir aizņemtas. Uzraksti mums, un palīdzēsim.", back: "← Mainīt biļeti" },
    contacts: { step: "3. solis", title: ["Tavi", "kontakti."], roleLabel: "Loma:", lead: "Pēc saglabāšanas to vairs nevarēs mainīt.", first: "Vārds", last: "Uzvārds", email: "E-pasts", phone: "Tālrunis", consentBefore: "Piekrītu ", consentLink: "personas datu apstrādei", consentAfter: ".", save: "Saglabāt izvēli →", saving: "Saglabājam…", back: "← Atpakaļ pie lomām" },
    done: { eyebrow: "Gatavs", title: ["Loma ir", "tava."], lead: (title: string) => `Tu izvēlējies lomu «${title}». Pirms vakara sazināsimies ar tevi pa e-pastu vai tālruni.`, mailSent: (email: string) => `Vēstule ar lomu nosūtīta uz ${email}.`, mailNotSent: "Vēstule ar lomu vēl nav nosūtīta. Ieiet viesu kabinetā var lapā /guest, ievadot šo e-pastu.", again: "Izvēlēties vēl vienu lomu" },
    errors: { INVALID_TICKET: "Ievadi derīgu biļetes numuru.", TICKET_NOT_FOUND: "Biļetes numurs nav atrasts.", EVENT_INACTIVE: "Pasākums šobrīd nav aktīvs.", ROLE_TAKEN: "Šī loma jau ir aizņemta. Izvēlies citu.", TICKET_CLAIMED: "Šī biļete jau ir izvēlējusies lomu.", NAME_REQUIRED: "Ievadi vārdu un uzvārdu.", EMAIL_INVALID: "Ievadi derīgu e-pastu.", PHONE_INVALID: "Ievadi derīgu tālruni.", MISSING_FIELDS: "Trūkst biļetes vai lomas.", LOOKUP_FAILED: "Neizdevās pārbaudīt biļeti. Mēģini vēlreiz.", SAVE_FAILED: "Neizdevās saglabāt izvēli. Mēģini vēlreiz." },
  },
  ru: {
    ticket: { step: "1 шаг", title: ["Введи номер своего", "билета."], lead: "Номер найдёшь на своём билете или в приглашении.", label: "Номер билета", placeholder: "Например, FW-0001", next: "Продолжить →", checking: "Проверяем…" },
    role: { step: "2 шаг", title: ["Выбери", "роль."], lead: "Показываем только свободные роли. После выбора роль будет закреплена за твоим билетом.", choose: "Выбрать →", free: (n: number) => `Свободно: ${n}`, allTaken: "Все роли сейчас заняты. Напиши нам, и мы поможем.", back: "← Сменить билет" },
    contacts: { step: "3 шаг", title: ["Твои", "контакты."], roleLabel: "Роль:", lead: "После сохранения её нельзя будет изменить.", first: "Имя", last: "Фамилия", email: "E-mail", phone: "Телефон", consentBefore: "Согласен на обработку ", consentLink: "персональных данных", consentAfter: ".", save: "Сохранить выбор →", saving: "Сохраняем…", back: "← Назад к ролям" },
    done: { eyebrow: "Готово", title: ["Роль", "твоя."], lead: (title: string) => `Ты выбрал роль «${title}». Перед вечером мы свяжемся с тобой по e-mail или телефону.`, mailSent: (email: string) => `Письмо с ролью отправлено на ${email}.`, mailNotSent: "Письмо с ролью пока не отправилось. Войти в гостевой кабинет можно на странице /guest, введя этот e-mail.", again: "Выбрать ещё роль" },
    errors: { INVALID_TICKET: "Введите корректный номер билета.", TICKET_NOT_FOUND: "Номер билета не найден.", EVENT_INACTIVE: "Мероприятие сейчас не активно.", ROLE_TAKEN: "Эта роль уже занята. Выбери другую.", TICKET_CLAIMED: "Этот билет уже выбрал роль.", NAME_REQUIRED: "Введите имя и фамилию.", EMAIL_INVALID: "Введите корректный e-mail.", PHONE_INVALID: "Введите корректный телефон.", MISSING_FIELDS: "Не хватает номера билета или роли.", LOOKUP_FAILED: "Не удалось проверить билет. Попробуйте ещё раз.", SAVE_FAILED: "Не удалось сохранить выбор. Попробуй ещё раз." },
  },
  en: {
    ticket: { step: "Step 1", title: ["Enter your", "ticket number."], lead: "You will find the number on your ticket or invitation.", label: "Ticket number", placeholder: "E.g. FW-0001", next: "Continue →", checking: "Checking…" },
    role: { step: "Step 2", title: ["Choose a", "role."], lead: "We show only free roles. After you choose, the role is linked to your ticket.", choose: "Choose →", free: (n: number) => `Free: ${n}`, allTaken: "All roles are taken right now. Write to us and we will help.", back: "← Change ticket" },
    contacts: { step: "Step 3", title: ["Your", "contacts."], roleLabel: "Role:", lead: "After saving, it cannot be changed.", first: "First name", last: "Last name", email: "E-mail", phone: "Phone", consentBefore: "I agree to the processing of ", consentLink: "personal data", consentAfter: ".", save: "Save choice →", saving: "Saving…", back: "← Back to roles" },
    done: { eyebrow: "Done", title: ["Your role", "is set."], lead: (title: string) => `You chose the role “${title}”. Before the evening we will contact you by e-mail or phone.`, mailSent: (email: string) => `The role e-mail was sent to ${email}.`, mailNotSent: "The role e-mail has not been sent yet. You can sign in to the guest area at /guest with this e-mail.", again: "Choose another role" },
    errors: { INVALID_TICKET: "Enter a valid ticket number.", TICKET_NOT_FOUND: "Ticket number not found.", EVENT_INACTIVE: "The event is not active right now.", ROLE_TAKEN: "This role is already taken. Choose another one.", TICKET_CLAIMED: "This ticket has already chosen a role.", NAME_REQUIRED: "Enter your first and last name.", EMAIL_INVALID: "Enter a valid e-mail.", PHONE_INVALID: "Enter a valid phone number.", MISSING_FIELDS: "The ticket or role is missing.", LOOKUP_FAILED: "Could not check the ticket. Please try again.", SAVE_FAILED: "Could not save your choice. Please try again." },
  },
};

// Одинаковые роли показываем одной карточкой; выбор берёт первую свободную роль группы.
function groupRoles(roles: Role[]) {
  const groups: RoleGroup[] = [];
  for (const role of roles) {
    const key = `${role.title}|${role.description}`;
    const group = groups.find((item) => item.key === key);
    if (group) group.roles.push(role);
    else groups.push({ key, title: role.title, description: role.description, roles: [role] });
  }
  return groups;
}

export function ChooseRole() {
  const { locale } = useI18n();
  const t = copy[locale] ?? copy.ru;
  const errorText = (code: string, fallback: string) => (t.errors as Record<string, string>)[code] ?? fallback;
  const [step, setStep] = useState<Step>("ticket");
  const [number, setNumber] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>();
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState<{ title: string; description: string; email: string; emailSent: boolean }>();

  // Возвращает список свободных ролей или код ошибки от сервера.
  async function fetchRoles(ticket: string): Promise<{ roles: Role[] } | { code: string }> {
    const response = await fetch("/api/tickets/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: ticket }),
    });
    const body = (await response.json().catch(() => ({}))) as { roles?: ServerRole[]; code?: string };
    if (!response.ok) return { code: body.code ?? "LOOKUP_FAILED" };
    // Название и описание берём на языке сайта; если перевода нет, остаётся русский текст роли.
    return { roles: (body.roles ?? []).map((role) => localizeRole(role, locale)) };
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await fetchRoles(number);
      if ("code" in result) setError(errorText(result.code, t.errors.LOOKUP_FAILED));
      else {
        setRoles(result.roles);
        setStep("role");
      }
    } catch {
      setError(t.errors.LOOKUP_FAILED);
    } finally {
      setLoading(false);
    }
  }

  function pickRole(role: Role) {
    setError("");
    setSelectedRole(role);
    setStep("contacts");
  }

  async function submitContacts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) return;
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/tickets/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number,
          locale,
          roleId: selectedRole.id,
          firstName: String(form.get("firstName") ?? ""),
          lastName: String(form.get("lastName") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { code?: string };
        setError(errorText(body.code ?? "SAVE_FAILED", t.errors.SAVE_FAILED));
        // Роль уже занята: обновляем список, чтобы гость выбрал другую.
        if (body.code === "ROLE_TAKEN") {
          setSelectedRole(undefined);
          const refreshed = await fetchRoles(number);
          setRoles("roles" in refreshed ? refreshed.roles : []);
          setStep("role");
        }
        return;
      }
      const body = (await response.json()) as { roleTitle: string; roleDescription?: string; emailSent?: boolean };
      setClaimed({ title: body.roleTitle || selectedRole.title, description: body.roleDescription ?? "", email: String(form.get("email") ?? ""), emailSent: Boolean(body.emailSent) });
      setStep("done");
    } catch {
      setError(t.errors.SAVE_FAILED);
    } finally {
      setLoading(false);
    }
  }

  const groups = groupRoles(roles);

  return (
    <main className="fw fwChoose">
      <Header onReserve={() => { window.location.href = "/"; }} homeHref="/" />
      <div className="fwWrap fwChooseWrap">

        {step === "ticket" && (
          <section className="fwChoosePanel">
            <p className="fwEyebrowLight">{t.ticket.step}</p>
            <h1 className="fwChooseTitle">{t.ticket.title[0]} <em>{t.ticket.title[1]}</em></h1>
            <p className="fwChooseLead">{t.ticket.lead}</p>
            <form className="fwChooseForm" onSubmit={submitTicket}>
              <label>
                {t.ticket.label}
                <input
                  name="number"
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  placeholder={t.ticket.placeholder}
                  autoComplete="off"
                  required
                  autoFocus
                />
              </label>
              {error && <p className="fwChooseError" role="alert">{error}</p>}
              <button className="fwBtnGold" disabled={loading || !number.trim()}>
                {loading ? t.ticket.checking : t.ticket.next}
              </button>
            </form>
          </section>
        )}

        {step === "role" && (
          <section className="fwChoosePanel">
            <button type="button" className="fwChooseBackBtn" onClick={() => { setError(""); setStep("ticket"); }}>
              {t.role.back}
            </button>
            <p className="fwEyebrowLight">{t.role.step}</p>
            <h1 className="fwChooseTitle">{t.role.title[0]} <em>{t.role.title[1]}</em></h1>
            <p className="fwChooseLead">{t.role.lead}</p>
            {error && <p className="fwChooseError" role="alert">{error}</p>}
            {groups.length ? (
              <ul className="fwChooseRoles">
                {groups.map((group) => (
                  <li key={group.key}>
                    <button
                      type="button"
                      className={group.roles.length > 1 ? "fwChooseRoleStacked" : undefined}
                      onClick={() => pickRole(group.roles[0])}
                    >
                      <strong>{group.title}</strong>
                      {group.description && <span>{group.description}</span>}
                      <em>{t.role.choose}</em>
                      {group.roles.length > 1 && <b className="fwChooseCount">{t.role.free(group.roles.length)}</b>}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fwChooseLead">{t.role.allTaken}</p>
            )}
          </section>
        )}

        {step === "contacts" && selectedRole && (
          <section className="fwChoosePanel">
            <button type="button" className="fwChooseBackBtn" onClick={() => { setError(""); setStep("role"); }}>
              {t.contacts.back}
            </button>
            <p className="fwEyebrowLight">{t.contacts.step}</p>
            <h1 className="fwChooseTitle">{t.contacts.title[0]} <em>{t.contacts.title[1]}</em></h1>
            <p className="fwChooseLead">{t.contacts.roleLabel} <strong>{selectedRole.title}</strong>. {t.contacts.lead}</p>
            <form className="fwChooseForm" onSubmit={submitContacts}>
              <div className="fwChooseRow">
                <label>
                  {t.contacts.first}
                  <input name="firstName" required autoComplete="given-name" />
                </label>
                <label>
                  {t.contacts.last}
                  <input name="lastName" required autoComplete="family-name" />
                </label>
              </div>
              <label>
                {t.contacts.email}
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                {t.contacts.phone}
                <input name="phone" type="tel" required autoComplete="tel" placeholder="+371" />
              </label>
              <label className="fwChooseConsent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
                <span>{t.contacts.consentBefore}<a href="/privacy-policy" target="_blank" rel="noopener noreferrer">{t.contacts.consentLink}</a>{t.contacts.consentAfter}</span>
              </label>
              {error && <p className="fwChooseError" role="alert">{error}</p>}
              <button className="fwBtnGold" disabled={loading || !consent}>
                {loading ? t.contacts.saving : t.contacts.save}
              </button>
            </form>
          </section>
        )}

        {step === "done" && (
          <section className="fwChoosePanel fwChooseDone">
            <p className="fwEyebrowLight">{t.done.eyebrow}</p>
            <h1 className="fwChooseTitle">{t.done.title[0]} <em>{t.done.title[1]}</em></h1>
            <p className="fwChooseLead">{t.done.lead(claimed?.title ?? "")}</p>
            {claimed?.description && <p className="fwChooseLead">{claimed.description}</p>}
            <p className="fwChooseLead">
              {claimed?.emailSent ? t.done.mailSent(claimed.email) : t.done.mailNotSent}
            </p>
            <button
              type="button"
              className="fwBtnGold"
              onClick={() => {
                setError("");
                setNumber("");
                setSelectedRole(undefined);
                setClaimed(undefined);
                setConsent(false);
                setStep("ticket");
              }}
            >
              {t.done.again}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
