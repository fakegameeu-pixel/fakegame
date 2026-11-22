"use client";

import { useEffect, useRef, useState } from "react";
import { PhotoPreview } from "./PhotoPreview";
import { unzipSync } from "fflate";
import { getFirebaseAuth } from "../lib/firebase";


type Pending = { key: string; file: File; preview: string; status: string; done: boolean };
const imagePattern = /\.(jpe?g|png|webp)$/i;
type Photo = { id: string; name: string; url: string; roleTitle?: string; roleId?: string };
type RoleOption = { id: string; title: string };

export function ParticipantPhotos({ eventId, title, embedded = false }: { eventId: string; title?: string; embedded?: boolean }) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [revision, setRevision] = useState(0);
  const photoInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const previews = useRef<string[]>([]);
  const requestVersion = useRef(0);


  async function headers() {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error("Войдите в аккаунт администратора.");
    return { Authorization: `Bearer ${await user.getIdToken()}` };
  }
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/events/photos?eventId=${encodeURIComponent(eventId)}`, { headers: await headers() });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (active) { setPhotos(result.photos); setWinners(result.winners); setRoles(result.roles ?? []); }
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : "Не удалось загрузить фото."); }
    };

    void load();
    const interval = window.setInterval(() => void load(), 10 * 60 * 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [eventId, revision]);
  useEffect(() => () => { requestVersion.current++; previews.current.forEach(URL.revokeObjectURL); }, []);

  async function selectFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMessage("");
    const version = ++requestVersion.current;
    try {
      const images: File[] = [];
      let total = 0;
      let skipped = 0;
      for (const file of Array.from(files)) {
        if (/\.zip$/i.test(file.name)) {
          if (file.size > 100 * 1024 * 1024) throw new Error("ZIP должен быть не больше 100 МБ.");
          const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), { filter: (entry) => {
            if (entry.name.startsWith("__MACOSX/") || !imagePattern.test(entry.name)) { skipped++; return false; }
            total += entry.originalSize;
            if (entry.originalSize > 10 * 1024 * 1024 || total > 200 * 1024 * 1024) throw new Error("Лимит: 10 МБ на фото и 200 МБ на распакованные файлы.");
            return true;
          } });
          for (const [name, bytes] of Object.entries(entries)) {
            const filename = name.split("/").pop()!;
            images.push(new File([new Uint8Array(bytes)], filename));
          }
        } else if (imagePattern.test(file.name)) {
          total += file.size;
          if (file.size > 10 * 1024 * 1024 || total > 200 * 1024 * 1024) throw new Error("Лимит: 10 МБ на фото и 200 МБ на загрузку.");
          images.push(file);
        } else skipped++;
        if (images.length > 300) throw new Error("Выберите не больше 300 фотографий за раз.");
      }
      if (version !== requestVersion.current) return;
      previews.current.forEach(URL.revokeObjectURL);
      previews.current = [];
      setPending(images.map((file) => {
        const preview = URL.createObjectURL(file);
        previews.current.push(preview);
        return { key: crypto.randomUUID(), file, preview, status: "", done: false };
      }));
      setMessage(images.length ? `Выбрано фото: ${images.length}.${skipped ? ` Пропущено неподдерживаемых файлов: ${skipped}.` : ""} Нажмите «Загрузить», чтобы добавить их в галерею.` : "В выбранных файлах нет JPG, PNG или WebP.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось прочитать архив."); }
    finally { if (version === requestVersion.current) setBusy(false); }
  }

  const selected = pending.filter((item) => !item.done);
  async function upload() {
    if (!selected.length) return;
    setBusy(true);
    let saved = 0;
    try {
      for (const item of selected) {
        try {
          const form = new FormData();
          form.set("eventId", eventId); form.set("photo", item.file);
          const response = await fetch("/api/events/photos", { method: "POST", headers: await headers(), body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          saved++;
          setPending((current) => current.map((row) => row.key === item.key ? { ...row, done: true, status: "Загружено" } : row));
        } catch (error) {
          setPending((current) => current.map((row) => row.key === item.key ? { ...row, status: error instanceof Error ? error.message : "Ошибка загрузки" } : row));
        }
      }
      setMessage(`Загружено: ${saved} из ${selected.length}. Фотографии добавлены в галерею мероприятия.`);
    } finally { setBusy(false); setRevision((value) => value + 1); }
  }

  async function saveRole(photoId: string, roleId: string, roleTitle: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/events/photos", { method: "PATCH", headers: { ...await headers(), "Content-Type": "application/json" }, body: JSON.stringify({ eventId, photoId, roleId, roleTitle }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPhotos((current) => current.map((photo) => photo.id === photoId ? { ...photo, ...result } : photo));
      setMessage("Роль сохранена.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось сохранить роль."); }
    finally { setBusy(false); }
  }

  async function deletePhoto(photo: Photo) {
    if (!window.confirm("Удалить эту фотографию? Отменить удаление нельзя.")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/events/photos", { method: "DELETE", headers: { ...await headers(), "Content-Type": "application/json" }, body: JSON.stringify({ eventId, photoId: photo.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setWinners((current) => Object.fromEntries(Object.entries(current).filter(([, id]) => id !== photo.id)));
      setMessage("Фото удалено.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось удалить фото."); }
    finally { setBusy(false); setRevision((value) => value + 1); }
  }

  async function chooseWinner(photoId: string, place: number) {
    setBusy(true);
    try {
      const response = await fetch("/api/events/photos", { method: "PATCH", headers: { ...await headers(), "Content-Type": "application/json" }, body: JSON.stringify({ eventId, photoId, place }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setWinners(result.winners);
      setMessage(place ? `Сохранено: ${place}-е место.` : "Отметка победителя снята.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось сохранить победителя."); }
    finally { setBusy(false); }
  }
  return <section className="crmScreen participantPhotos">
    {!embedded && (<div className="adminPageHeading"><a href={`/workspace/events/${eventId}`}>← {title || "К мероприятию"}</a><div><p className="portalLabel">Галерея мероприятия</p><h2>Фото участников</h2><p>Все фотографии вечера и три победителя.</p></div></div>)}
    <div className="photoUploadPanel photoUploadHero">
      <div className="photoUploadSymbol" aria-hidden="true">↑</div>
      <h3>Добавьте фотографии вечера</h3><p>Загрузите отдельные фото или весь ZIP-архив.<br />Привязывать фотографии к участникам не нужно.</p>
      <div className="photoUploadActions"><button className="photoPrimaryButton" disabled={busy} onClick={() => photoInput.current?.click()}>+ Выбрать фотографии</button><button className="photoOutlineButton" disabled={busy} onClick={() => zipInput.current?.click()}>Загрузить ZIP</button></div>
      <input ref={photoInput} hidden type="file" accept=".jpg,.jpeg,.png,.webp" multiple disabled={busy} onChange={(event) => { void selectFiles(event.target.files); event.target.value = ""; }} />
      <input ref={zipInput} hidden type="file" accept=".zip" disabled={busy} onChange={(event) => { void selectFiles(event.target.files); event.target.value = ""; }} />
      <small>JPG, PNG, WebP · до 10 МБ на фото · ZIP до 100 МБ</small>
    </div>
    {message && <p className="portalNotice" role="status">{message}</p>}
    {pending.length > 0 && <section className="photoUploadPanel"><div className="photoSectionHeading"><h3>Готовы к загрузке</h3><button className="photoPrimaryButton" disabled={busy || !selected.length} onClick={() => void upload()}>{busy ? "Обработка…" : `Загрузить (${selected.length})`}</button></div><div className="photoPendingGrid">{pending.map((item, index) => <article key={item.key}><img src={item.preview} alt={`Фото ${index + 1}`} /><strong>Фото {index + 1}</strong><small>{item.status || "Ожидает загрузки"}</small>{!item.done && <button className="photoRemoveButton" disabled={busy} onClick={() => { URL.revokeObjectURL(item.preview); setPending((current) => current.filter((row) => row.key !== item.key)); }}>Убрать</button>}</article>)}</div></section>}
    <section className="photoWinners"><div className="photoSectionHeading"><h3>Победители</h3><a className="photoOutlineButton" href={`/draw/${eventId}`} target="_blank" rel="noopener noreferrer">Запустить розыгрыш ↗</a></div><div className="photoWinnerGrid">{[1, 2, 3].map((place) => { const photo = photos.find((item) => item.id === winners[String(place)]); return <article className={`photoWinner place${place}`} key={place}><b>{place}</b><div>{photo ? <><img src={photo.url} alt={`Победитель: ${place}-е место`} /><strong>{photo.roleTitle || "Победитель"}</strong><button disabled={busy} onClick={() => void chooseWinner(photo.id, 0)}>Снять отметку</button></> : <><strong>{place}-е место</strong><p>Пока не выбрано</p></>}</div></article>; })}</div></section>
    <div className="photoSectionHeading"><h3>Все фотографии</h3><span>{photos.length} фото</span></div>
    {!photos.length && <div className="photoEmpty"><h3>Здесь будут фотографии вечера</h3><p>Добавьте первые фото с помощью кнопок выше.</p></div>}
    <div className="participantPhotoGrid">{photos.map((photo, index) => {
      const place = Object.keys(winners).find((key) => winners[key] === photo.id);
      const label = `Фото ${index + 1}`;
      return <article className={`galleryPhotoCard ${place ? "hasPrize" : ""}`} key={photo.id}>
        <div className="galleryPhotoCover">{photo.url ? <PhotoPreview src={photo.url} title={photo.roleTitle || label} className="galleryPhotoTrigger" /> : <div className="participantPhotoPlaceholder">Фото недоступно</div>}{place && <span className="galleryPrizeBadge">★ {place}-е место</span>}<span className="galleryPhotoNumber">{String(index + 1).padStart(2, "0")}</span><button className="galleryPhotoDelete" disabled={busy} onClick={() => void deletePhoto(photo)} aria-label={`Удалить ${label.toLowerCase()}`} title="Удалить фото"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" /></svg></button></div>
        <div className="galleryPhotoBody"><div className="galleryPhotoTitle"><strong>{photo.roleTitle || "Роль не назначена"}</strong><span>{photo.roleTitle ? "Роль участника" : "Выберите роль ниже"}</span></div>
          <PhotoRoleEditor photo={photo} roles={roles} busy={busy} onSave={saveRole} />
          <label className="photoWinnerSelect">Призовое место<select aria-label={`Место для ${label}`} disabled={busy} value={place || "0"} onChange={(event) => void chooseWinner(photo.id, Number(event.target.value))}><option value="0">Без места</option><option value="1">1-е место</option><option value="2">2-е место</option><option value="3">3-е место</option></select></label>
          
        </div>
      </article>;
    })}</div>
  </section>;
}

function PhotoRoleEditor({ photo, roles, busy, onSave }: { photo: Photo; roles: RoleOption[]; busy: boolean; onSave: (id: string, roleId: string, title: string) => Promise<void> }) {
  const [choice, setChoice] = useState(photo.roleId || (photo.roleTitle ? "custom" : ""));
  const [title, setTitle] = useState(photo.roleTitle ?? "");
  useEffect(() => { setChoice(photo.roleId || (photo.roleTitle ? "custom" : "")); setTitle(photo.roleTitle ?? ""); }, [photo.roleId, photo.roleTitle]);
  const roleId = choice === "custom" ? "" : choice;
  const roleTitle = choice === "custom" ? title : roles.find((role) => role.id === choice)?.title ?? "";
  const changed = roleId !== (photo.roleId ?? "") || roleTitle !== (photo.roleTitle ?? "");
  return <div className="photoRoleEditor"><label>Роль<select aria-label={`Роль фотографии`} value={choice} disabled={busy} onChange={(event) => setChoice(event.target.value)}><option value="">Без роли</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}<option value="custom">Задать свою роль…</option></select></label>{choice === "custom" && <input aria-label={`Своя роль фотографии`} placeholder="Название роли" maxLength={120} value={title} disabled={busy} onChange={(event) => setTitle(event.target.value)} />}{changed && <button disabled={busy || (choice === "custom" && !title.trim())} onClick={() => void onSave(photo.id, roleId, roleTitle)}>Сохранить роль</button>}</div>;
}
