"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getFirebase } from "../lib/firebase";
import "./TicketsAdmin.css";

type Ticket = {
  number: string;
  status: "free" | "claimed";
  roleId: string | null;
  roleTitle: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  claimedAt: string | null;
};

type Filter = "all" | "free" | "claimed";

async function authHeaders() {
  const token = await getFirebase().auth.currentUser?.getIdToken();
  return { Authorization: `Bearer ${token ?? ""}` };
}

export function TicketsPanel({ eventId, eventDate, embedded = false }: { eventId: string; eventDate?: string; embedded?: boolean }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [prefix, setPrefix] = useState("");
  const [count, setCount] = useState(10);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const response = await fetch(`/api/events/tickets?eventId=${encodeURIComponent(eventId)}`, { headers: await authHeaders() });
      if (!response.ok) throw new Error("load");
      setTickets((await response.json()) as Ticket[]);
    } catch {
      setNotice("Не удалось загрузить билеты.");
    }
  }

  useEffect(() => {
    if (eventDate && !prefix) setPrefix(`${eventDate.replace(/-/g, "")}-`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate]);

  useEffect(() => {
    void load();
    // Обновляем список без перезагрузки страницы: по таймеру и при возврате в окно.
    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };
    const timer = window.setInterval(refresh, 10000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function generateTickets(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prefix.trim() || !Number.isInteger(count) || count < 1) return;
    setBusy(true);
    try {
      const response = await fetch("/api/events/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ eventId, prefix, count }),
      });
      const body = (await response.json()) as { error?: string; created?: number; skipped?: number };
      if (!response.ok) throw new Error(body.error ?? "Не удалось создать билеты.");
      setNotice(`Создано билетов: ${body.created}. Уже были в системе: ${body.skipped}.`);
      await load();
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Не удалось создать билеты.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTicket(ticket: Ticket) {
    const guestNote = ticket.status === "claimed" ? " Гость будет удалён из участников, роль освободится." : "";
    if (!confirm(`Удалить билет ${ticket.number}?${guestNote}`)) return;
    try {
      const response = await fetch("/api/events/tickets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ eventId, number: ticket.number }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Не удалось удалить билет.");
      setNotice(`Билет ${ticket.number} удалён.`);
      await load();
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Не удалось удалить билет.");
    }
  }

  const counts = useMemo(
    () => ({
      total: tickets.length,
      free: tickets.filter((ticket) => ticket.status === "free").length,
      claimed: tickets.filter((ticket) => ticket.status === "claimed").length,
    }),
    [tickets],
  );
  const seriesWidth = 2;
  const normalizedPrefix = prefix.trim().toUpperCase().replace(/\s+/g, "").replace(/\//g, "-");
  const seriesFirst = `${normalizedPrefix}${"1".padStart(seriesWidth, "0")}`;
  const seriesLast = `${normalizedPrefix}${String(count).padStart(seriesWidth, "0")}`;
  const visible = filter === "all" ? tickets : tickets.filter((ticket) => ticket.status === filter);

  return (
    <section className="crmScreen ticketsScreen">
      {!embedded && (
      <div className="adminPageHeading">
        <Link href={`/workspace/events/${eventId}`}>← К мероприятию</Link>
        <div>
          <p className="portalLabel">Мероприятие · билеты</p>
          <h2>Билеты и роли</h2>
          <p>Гость вводит номер билета на странице выбора роли. Занятый билет закреплён за ролью и контактами гостя.</p>
        </div>
      </div>
      )}

      <section className="workspaceStats">
        <div>
          <span>Всего билетов</span>
          <b>{counts.total}</b>
        </div>
        <div>
          <span>Свободных</span>
          <b>{counts.free}</b>
          <small>можно выбрать роль</small>
        </div>
        <div>
          <span>Занятых</span>
          <b>{counts.claimed}</b>
          <small>роль закреплена</small>
        </div>
      </section>

      <section className="portalPanel ticketsAddPanel">
        <p className="portalLabel">Создать серию</p>
        <form onSubmit={generateTickets} className="ticketsAddForm ticketsSeries">
          <label>
            Префикс
            <input value={prefix} onChange={(event) => setPrefix(event.target.value)} placeholder="20270213-" autoComplete="off" />
          </label>
          <label>
            Количество
            <input type="number" min={1} value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </label>
          {normalizedPrefix && Number.isInteger(count) && count >= 1 && (
            <p className="ticketsPreview">Будет создано: {seriesFirst} … {seriesLast}</p>
          )}
          <button className="crmAction" disabled={busy || !prefix.trim() || !Number.isInteger(count) || count < 1}>
            {busy ? "Создаём…" : "Создать серию"}
          </button>
        </form>

        {notice && <p className="ticketsNotice">{notice}</p>}
      </section>

      <section className="portalPanel">
        <div className="ticketsToolbar">
          <div className="ticketsFilter">
            {(["all", "free", "claimed"] as Filter[]).map((item) => (
              <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                {item === "all" ? "Все" : item === "free" ? "Свободные" : "Занятые"}
              </button>
            ))}
          </div>
        </div>
        <div className="ticketsTable" role="table">
          <div className="ticketsRow ticketsHead" role="row">
            <span>Номер</span>
            <span>Роль</span>
            <span>Гость</span>
            <span>Контакты</span>
            <span>Выбрано</span>
            <span />
          </div>
          {visible.map((ticket) => (
            <div className="ticketsRow" role="row" key={ticket.number}>
              <b>{ticket.number}</b>
              <span>{ticket.roleTitle ?? <em>свободен</em>}</span>
              <span>{ticket.firstName ? `${ticket.firstName} ${ticket.lastName ?? ""}` : "—"}</span>
              <span className="ticketsContacts">{ticket.email ?? ""}{ticket.phone ? ` · ${ticket.phone}` : ""}</span>
              <span>{ticket.claimedAt ? new Date(ticket.claimedAt).toLocaleString("ru-RU") : "—"}</span>
              <span>
                <button type="button" className="ticketsDelete" onClick={() => void removeTicket(ticket)}>
                  Удалить
                </button>
              </span>
            </div>
          ))}
          {!visible.length && <p className="ticketsEmpty">Билетов в этом списке пока нет.</p>}
        </div>
      </section>
    </section>
  );
}
