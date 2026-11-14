"use client";

import { isSignInWithEmailLink, onAuthStateChanged, sendSignInLinkToEmail, signInWithEmailLink, signOut, type User } from "firebase/auth";
import { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth } from "../lib/firebase";

const emailKey = "fake-wedding-guest-email";
type Target = { id: string; photoUrl?: string; found: boolean };
type Game = { event: { title: string; date?: string; location?: string }; targets: Target[] };

async function token(user: User) { return user.getIdToken(); }

export function GuestPortal() {
  const [user, setUser] = useState<User>();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game>();
  const [magicLinkMode, setMagicLinkMode] = useState(false);

  async function bootstrap(activeUser: User) {
    const response = await fetch("/api/guest/game", { method: "POST", headers: { Authorization: `Bearer ${await token(activeUser)}` } });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Не удалось подтвердить приглашение.");
  }
  async function loadGame(activeUser: User) {
    const response = await fetch("/api/guest/game", { headers: { Authorization: `Bearer ${await token(activeUser)}` } });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Не удалось загрузить игру.");
    setGame(body as Game);
  }

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setEmail(window.localStorage.getItem(emailKey) ?? "");
      setMagicLinkMode(true);
      setLoading(false);
    }
    const stop = onAuthStateChanged(auth, (activeUser) => {
      setUser(activeUser ?? undefined);
      if (!activeUser && !isSignInWithEmailLink(auth, window.location.href)) setLoading(false);
      if (activeUser && !isSignInWithEmailLink(auth, window.location.href)) void bootstrap(activeUser).then(() => loadGame(activeUser)).catch((caught) => setError(caught instanceof Error ? caught.message : "Нет доступа к гостевому порталу.")).finally(() => setLoading(false));
    });
    return stop;
  }, []);

  async function sendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) return setError("Введите корректный e-mail.");
    try {
      await sendSignInLinkToEmail(getFirebaseAuth(), normalized, { url: `${window.location.origin}/guest`, handleCodeInApp: true });
      window.localStorage.setItem(emailKey, normalized);
      setMessage("Ссылка для входа отправлена. Откройте письмо на этом устройстве или введите тот же e-mail после перехода по ссылке.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Не удалось отправить ссылку."); }
  }
  async function completeMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) return setError("Введите e-mail, на который пришло приглашение.");
    setLoading(true);
    try {
      const result = await signInWithEmailLink(getFirebaseAuth(), normalized, window.location.href);
      window.localStorage.removeItem(emailKey);
      window.history.replaceState({}, "", "/guest");
      setMagicLinkMode(false);
      await bootstrap(result.user);
      await loadGame(result.user);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Ссылка для входа недействительна или уже использована."); }
    finally { setLoading(false); }
  }
  async function markFound(participantId: string) {
    if (!user) return;
    setError("");
    const response = await fetch("/api/guest/game", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token(user)}` }, body: JSON.stringify({ participantId }) });
    if (!response.ok) return setError((await response.json()).error ?? "Не удалось сохранить отметку.");
    setGame((current) => current && { ...current, targets: current.targets.map((item) => item.id === participantId ? { ...item, found: true } : item) });
  }

  if (loading) return <main className="guestPage guestCentered"><p>Открываем приглашение…</p></main>;
  if (magicLinkMode) return <main className="guestPage guestCentered"><form className="guestCard" onSubmit={completeMagicLink}><p className="portalLabel">Fake Wedding · подтверждение входа</p><h1>Подтвердите <span className="noWrap">e-mail</span></h1><p>Введите адрес, на который пришло приглашение. Это защищает ваш личный аккаунт гостя, если письмо открыто на другом устройстве.</p><label>E-mail из приглашения<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" autoFocus required /></label>{error && <p className="portalError">{error}</p>}<button className="portalButton">Войти в аккаунт</button></form></main>;
  if (user && !game && error) return <main className="guestPage guestCentered"><section className="guestCard"><p className="portalLabel">Fake Wedding · доступ</p><h1>Вход не завершён</h1><p>{error}</p><button className="portalButton" onClick={() => { void signOut(getFirebaseAuth()); setUser(undefined); setError(""); }}>Выйти и попробовать другой e-mail</button></section></main>;
  if (!user || !game) return <main className="guestPage guestCentered"><form className="guestCard" onSubmit={sendLink}><p className="portalLabel">Fake Wedding · гостевой доступ</p><h1>Ваш вечер начинается здесь</h1><p>Введите e-mail, указанный в приглашении. Регистрация и пароль не нужны — мы отправим одноразовую ссылку для входа.</p><label>E-mail<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>{error && <p className="portalError">{error}</p>}{message && <p className="guestMessage">{message}</p>}<button className="portalButton">Получить ссылку для входа</button></form></main>;
  const foundCount = game.targets.filter((item) => item.found).length;
  return <main className="guestPage"><header className="guestHeader"><div><p className="portalLabel">Fake Wedding · игра</p><h1>{game.event.title}</h1><p>{[game.event.date, game.event.location].filter(Boolean).join(" · ")}</p></div><button onClick={() => signOut(getFirebaseAuth())}>Выйти</button></header><section className="guestGame"><div className="guestIntro"><p className="portalLabel">Задание вечера</p><h2>Найдите подставных гостей</h2><p>Сверяйте лица на фотографиях с гостями вокруг вас. Когда нашли человека — отметьте его в своей карточке.</p><strong>{foundCount} из {game.targets.length} найдено</strong></div>{error && <p className="portalError">{error}</p>}<div className="targetGrid">{game.targets.map((target, index) => <article className={`targetCard ${target.found ? "found" : ""}`} key={target.id}>{target.photoUrl ? <img src={target.photoUrl} alt={`Подставной гость ${index + 1}`} /> : <div className="targetPlaceholder">Фото скоро появится</div>}<div><span>Гость #{index + 1}</span><button disabled={target.found} onClick={() => markFound(target.id)}>{target.found ? "Найден!" : "Я нашёл(ла)"}</button></div></article>)}</div>{!game.targets.length && <p className="guestEmpty">Фотографии участников будут добавлены перед началом мероприятия.</p>}</section></main>;
}
