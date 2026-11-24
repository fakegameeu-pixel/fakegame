"use client";

import { FormEvent, useState } from "react";
import "./fakeWedding.css";
import "./landing/Buttons.css";
import "./ChooseRole.css";
import { Header } from "./landing/Header";
import { InvitationModal } from "./InvitationModal";
import { type Locale, useI18n } from "../lib/i18n";
import { localizeRole, type RoleTranslations } from "../lib/roleText";

type Role = { id: string; title: string; description: string; translations?: RoleTranslations };
type Step = "ticket" | "role" | "contacts" | "done";

const copy = {
  lv: {
    ticketEyebrow: "1. solis",
    ticketTitle: "Ievadi savu",
    ticketAccent: "biļetes numuru.",
    ticketLead: "Numuru atradīsi savā biļetē vai ielūgumā.",
    ticketLabel: "Biļetes numurs",
    ticketPlaceholder: "Piem., FW-0001",
    continue: "Turpināt →",
    checking: "Pārbaudām…",
    roleEyebrow: "2. solis",
    roleTitle: "Izvēlies",
    roleAccent: "lomu.",
    roleLead: "Rādam tikai brīvās lomas. Pēc izvēles loma tiks piesaistīta tavai biļetei.",
    chooseRole: "Izvēlēties →",
    noRoles: "Visas lomas šobrīd ir aizņemtas. Uzraksti mums, un palīdzēsim.",
    changeTicket: "← Mainīt biļeti",
    contactsEyebrow: "3. solis",
    contactsTitle: "Tavi",
    contactsAccent: "kontakti.",
    rolePrefix: "Loma: ",
    roleSuffix: ". Pēc saglabāšanas to vairs nevarēs mainīt.",
    firstName: "Vārds",
    lastName: "Uzvārds",
    email: "E-pasts",
    phone: "Tālrunis",
    consent: "Piekrītu personas datu apstrādei.",
    save: "Saglabāt izvēli →",
    saving: "Saglabājam…",
    backToRoles: "← Atpakaļ pie lomām",
    doneEyebrow: "Gatavs",
    doneTitle: "Loma ir",
    doneAccent: "tava.",
    doneLead: (role: string) => `Tu izvēlējies lomu «${role}». Pirms vakara sazināsimies ar tevi pa e-pastu vai tālruni.`,
    backHome: "Atpakaļ uz sākumu",
    errors: {
      lookup: "Neizdevās pārbaudīt biļeti.",
      save: "Neizdevās saglabāt izvēli. Mēģini vēlreiz.",
      invalidTicket: "Ievadi pareizu biļetes numuru.",
      ticketNotFound: "Biļetes numurs nav atrasts.",
      eventInactive: "Pasākums šobrīd nav aktīvs.",
      roleTaken: "Šī loma jau ir aizņemta. Izvēlies citu.",
      ticketClaimed: "Šī biļete jau ir izvēlējusies lomu.",
    },
  },
  ru: {
    ticketEyebrow: "1. шаг",
    ticketTitle: "Введи свой",
    ticketAccent: "номер билета.",
    ticketLead: "Номер найдёшь на своём билете или приглашении.",
    ticketLabel: "Номер билета",
    ticketPlaceholder: "Например, FW-0001",
    continue: "Продолжить →",
    checking: "Проверяем…",
    roleEyebrow: "2. шаг",
    roleTitle: "Выбери",
    roleAccent: "роль.",
    roleLead: "Показываем только свободные роли. После выбора роль будет закреплена за твоим билетом.",
    chooseRole: "Выбрать →",
    noRoles: "Все роли сейчас заняты. Напиши нам, и мы поможем.",
    changeTicket: "← Сменить билет",
    contactsEyebrow: "3. шаг",
    contactsTitle: "Твои",
    contactsAccent: "контакты.",
    rolePrefix: "Роль: ",
    roleSuffix: ". После сохранения её нельзя будет изменить.",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "E-mail",
    phone: "Телефон",
    consent: "Согласен на обработку персональных данных.",
    save: "Сохранить выбор →",
    saving: "Сохраняем…",
    backToRoles: "← Назад к ролям",
    doneEyebrow: "Готово",
    doneTitle: "Роль —",
    doneAccent: "твоя.",
    doneLead: (role: string) => `Ты выбрал роль «${role}». Перед вечером мы свяжемся с тобой по e-mail или телефону.`,
    backHome: "Назад на главную",
    errors: {
      lookup: "Не удалось проверить билет.",
      save: "Не удалось сохранить выбор. Попробуй ещё раз.",
      invalidTicket: "Введи корректный номер билета.",
      ticketNotFound: "Номер билета не найден.",
      eventInactive: "Мероприятие сейчас не активно.",
      roleTaken: "Эта роль уже занята. Выбери другую.",
      ticketClaimed: "Этот билет уже выбрал роль.",
    },
  },
  en: {
    ticketEyebrow: "Step 1",
    ticketTitle: "Enter your",
    ticketAccent: "ticket number.",
    ticketLead: "You will find the number on your ticket or invitation.",
    ticketLabel: "Ticket number",
    ticketPlaceholder: "E.g., FW-0001",
    continue: "Continue →",
    checking: "Checking…",
    roleEyebrow: "Step 2",
    roleTitle: "Choose your",
    roleAccent: "role.",
    roleLead: "We show only free roles. Once you choose, the role is linked to your ticket.",
    chooseRole: "Choose →",
    noRoles: "All roles are taken right now. Write to us and we will help.",
    changeTicket: "← Change ticket",
    contactsEyebrow: "Step 3",
    contactsTitle: "Your",
    contactsAccent: "contact details.",
    rolePrefix: "Role: ",
    roleSuffix: ". Once saved, it cannot be changed.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    consent: "I agree to the processing of my personal data.",
    save: "Save my choice →",
    saving: "Saving…",
    backToRoles: "← Back to roles",
    doneEyebrow: "Done",
    doneTitle: "The role is",
    doneAccent: "yours.",
    doneLead: (role: string) => `You chose the role “${role}”. We will contact you by email or phone before the evening.`,
    backHome: "Back to home",
    errors: {
      lookup: "Could not check the ticket.",
      save: "Could not save your choice. Please try again.",
      invalidTicket: "Enter a valid ticket number.",
      ticketNotFound: "Ticket number not found.",
      eventInactive: "The event is not active right now.",
      roleTaken: "This role is already taken. Choose another one.",
      ticketClaimed: "This ticket has already chosen a role.",
    },
  },
} satisfies Record<Locale, unknown>;

async function readError(response: Response) {
  const body = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
  return body;
}

export function ChooseRole() {
  const { locale } = useI18n();
  const c = copy[locale];
  const [step, setStep] = useState<Step>("ticket");
  const [number, setNumber] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>();
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimedTitle, setClaimedTitle] = useState("");
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);

  // Сообщения об ошибках приходят с кодом, поэтому выводим их на языке страницы.
  function errorMessage(code: string | undefined, fallback: string) {
    const known: Record<string, string> = {
      INVALID_TICKET: c.errors.invalidTicket,
      TICKET_NOT_FOUND: c.errors.ticketNotFound,
      EVENT_INACTIVE: c.errors.eventInactive,
      ROLE_TAKEN: c.errors.roleTaken,
      TICKET_CLAIMED: c.errors.ticketClaimed,
    };
    return (code && known[code]) || fallback;
  }

  async function fetchRoles(ticket: string) {
    const response = await fetch("/api/tickets/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: ticket }),
    });
    if (!response.ok) {
      const body = await readError(response);
      throw Object.assign(new Error(body.code ?? "LOOKUP_FAILED"), { code: body.code });
    }
    const body = (await response.json()) as { roles: Role[] };
    return body.roles;
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      setRoles(await fetchRoles(number));
      setStep("role");
    } catch (caught) {
      const code = (caught as { code?: string }).code;
      setError(errorMessage(code, c.errors.lookup));
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
          roleId: selectedRole.id,
          firstName: String(form.get("firstName") ?? ""),
          lastName: String(form.get("lastName") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
        }),
      });
      if (!response.ok) {
        const body = await readError(response);
        setError(errorMessage(body.code, c.errors.save));
        // Loma ir aizņemta: pārlādējam sarakstu, lai viesis izvēlētos citu.
        if (body.code === "ROLE_TAKEN") {
          setSelectedRole(undefined);
          setRoles(await fetchRoles(number).catch(() => []));
          setStep("role");
        }
        return;
      }
      setClaimedTitle(localizeRole(selectedRole, locale).title);
      setStep("done");
    } catch {
      setError(c.errors.save);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fw fwChoose">
      <Header onReserve={() => setIsInvitationOpen(true)} homeHref="/" />
      <div className="fwWrap fwChooseWrap">

        {step === "ticket" && (
          <section className="fwChoosePanel">
            <p className="fwEyebrowLight">{c.ticketEyebrow}</p>
            <h1 className="fwChooseTitle">{c.ticketTitle} <em>{c.ticketAccent}</em></h1>
            <p className="fwChooseLead">{c.ticketLead}</p>
            <form className="fwChooseForm" onSubmit={submitTicket}>
              <label>
                {c.ticketLabel}
                <input
                  name="number"
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  placeholder={c.ticketPlaceholder}
                  autoComplete="off"
                  required
                  autoFocus
                />
              </label>
              {error && <p className="fwChooseError" role="alert">{error}</p>}
              <button className="fwBtnGold" disabled={loading || !number.trim()}>
                {loading ? c.checking : c.continue}
              </button>
            </form>
          </section>
        )}

        {step === "role" && (
          <section className="fwChoosePanel">
            <p className="fwEyebrowLight">{c.roleEyebrow}</p>
            <h1 className="fwChooseTitle">{c.roleTitle} <em>{c.roleAccent}</em></h1>
            <p className="fwChooseLead">{c.roleLead}</p>
            {error && <p className="fwChooseError" role="alert">{error}</p>}
            {roles.length ? (
              <ul className="fwChooseRoles">
                {roles.map((role) => {
                  const text = localizeRole(role, locale);
                  return (
                    <li key={role.id}>
                      <button type="button" onClick={() => pickRole(role)}>
                        <strong>{text.title}</strong>
                        {text.description && <span>{text.description}</span>}
                        <em>{c.chooseRole}</em>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="fwChooseLead">{c.noRoles}</p>
            )}
            <button type="button" className="fwChooseBackBtn" onClick={() => { setError(""); setStep("ticket"); }}>
              {c.changeTicket}
            </button>
          </section>
        )}

        {step === "contacts" && selectedRole && (
          <section className="fwChoosePanel">
            <p className="fwEyebrowLight">{c.contactsEyebrow}</p>
            <h1 className="fwChooseTitle">{c.contactsTitle} <em>{c.contactsAccent}</em></h1>
            <p className="fwChooseLead">{c.rolePrefix}<strong>{localizeRole(selectedRole, locale).title}</strong>{c.roleSuffix}</p>
            <form className="fwChooseForm" onSubmit={submitContacts}>
              <div className="fwChooseRow">
                <label>
                  {c.firstName}
                  <input name="firstName" required autoComplete="given-name" />
                </label>
                <label>
                  {c.lastName}
                  <input name="lastName" required autoComplete="family-name" />
                </label>
              </div>
              <label>
                {c.email}
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                {c.phone}
                <input name="phone" type="tel" required autoComplete="tel" placeholder="+371" />
              </label>
              <label className="fwChooseConsent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
                <span>{c.consent}</span>
              </label>
              {error && <p className="fwChooseError" role="alert">{error}</p>}
              <button className="fwBtnGold" disabled={loading || !consent}>
                {loading ? c.saving : c.save}
              </button>
            </form>
            <button type="button" className="fwChooseBackBtn" onClick={() => { setError(""); setStep("role"); }}>
              {c.backToRoles}
            </button>
          </section>
        )}

        {step === "done" && (
          <section className="fwChoosePanel fwChooseDone">
            <p className="fwEyebrowLight">{c.doneEyebrow}</p>
            <h1 className="fwChooseTitle">{c.doneTitle} <em>{c.doneAccent}</em></h1>
            <p className="fwChooseLead">{c.doneLead(claimedTitle)}</p>
            <a className="fwBtnGold" href="/">{c.backHome}</a>
          </section>
        )}
      </div>

      {isInvitationOpen && <InvitationModal onClose={() => setIsInvitationOpen(false)} />}
    </main>
  );
}
