"use client";

import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AccessGate } from "./AccessGate";
import { getFirebase } from "../lib/firebase";
import type { Participant, UserRole, WeddingRole } from "../lib/access";

export function Workspace() { return <AccessGate>{({ profile, logout }) => <WorkspaceContent role={profile.role} name={profile.name} logout={logout} />}</AccessGate>; }

function WorkspaceContent({ role, name, logout }: { role: UserRole; name: string; logout: () => Promise<void> }) {
  return <main className="workspacePage"><header className="workspaceHeader"><div><span>Fake Wedding</span><h1>{role === "admin" ? "Панель администратора" : "Регистрация участника"}</h1></div><div className="workspaceUser"><small>{name} · {role === "admin" ? "администратор" : "менеджер"}</small><button onClick={logout}>Выйти</button></div></header>{role === "admin" ? <AdminWorkspace /> : <ManagerRegistration />}</main>;
}

function ManagerRegistration() {
  const [file, setFile] = useState<File>(); const [preview, setPreview] = useState(""); const [notice, setNotice] = useState(""); const [saving, setSaving] = useState(false); const [gender, setGender] = useState<"male" | "female" | "">(""); const [selectedRole, setSelectedRole] = useState<{ id: string; title: string }>();
  useEffect(() => { if (!file) return setPreview(""); const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) { setFile(event.target.files?.[0]); setNotice(""); }
  async function chooseRole() {
    if (!gender) return setNotice("Сначала выберите пол участника.");
    setNotice(""); setSelectedRole(undefined);
    try { const token = await getFirebase().auth.currentUser?.getIdToken(); const response = await fetch("/api/participants/choose-role", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` }, body: JSON.stringify({ gender }) }); if (response.status === 409) throw new Error("Нет подходящих ролей. Попросите администратора создать их."); if (!response.ok) throw new Error("Не удалось выбрать роль."); setSelectedRole(await response.json()); } catch (error) { setNotice(error instanceof Error ? error.message : "Не удалось выбрать роль."); }
  }
  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!file || !selectedRole) return setNotice("Выберите фотографию и роль."); setSaving(true); setNotice("");
    const form = new FormData(event.currentTarget); const { auth, storage } = getFirebase(); const currentUser = auth.currentUser;
    try { if (!currentUser) throw new Error(); const extension = file.name.split(".").pop() || "jpg"; const photoPath = `participant-photos/${currentUser.uid}/${crypto.randomUUID()}.${extension}`; await uploadBytes(ref(storage, photoPath), file, { contentType: file.type }); const token = await currentUser.getIdToken(); const response = await fetch("/api/participants", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: String(form.get("name")).trim(), gender, photoPath, roleId: selectedRole.id }) }); if (response.status === 409) throw new Error("Эту роль уже получил другой участник. Выберите новую."); if (!response.ok) throw new Error("Не удалось сохранить участника."); event.currentTarget.reset(); setFile(undefined); setGender(""); setSelectedRole(undefined); setNotice("Участник сохранён. Роль больше не доступна для выбора."); } catch (error) { setNotice(error instanceof Error ? error.message : "Не удалось сохранить участника."); } finally { setSaving(false); }
  }
  return <section className="managerRegistration"><div className="registrationIntro"><p className="portalLabel">Шаг 1 из 2</p><h2>Выберите фото и роль</h2><p>Роль выбирается случайно из ролей, которые администратор подготовил для пола участника.</p></div><form className="registrationCard" onSubmit={register}><label>Имя участника<input name="name" required placeholder="Как к вам обращаться?" /></label><fieldset><legend>Кто вы?</legend><label className="choice"><input name="gender" type="radio" value="male" required checked={gender === "male"} onChange={() => { setGender("male"); setSelectedRole(undefined); }} /><span>Мужчина</span></label><label className="choice"><input name="gender" type="radio" value="female" required checked={gender === "female"} onChange={() => { setGender("female"); setSelectedRole(undefined); }} /><span>Женщина</span></label></fieldset><label className="photoPicker">{preview ? <img src={preview} alt="Выбранный портрет" /> : <span>Выбрать фото с компьютера</span>}<input type="file" accept="image/*" onChange={selectPhoto} required /></label><p className="photoHint">Загрузите отдельный портрет гостя. Позже это поле заменим автоматической передачей фотоаппарата.</p><button className="rolePickButton" type="button" onClick={chooseRole} disabled={!gender}>Выбрать роль</button>{selectedRole && <div className="selectedRole"><span>Ваша роль</span><strong>{selectedRole.title}</strong><button type="button" onClick={chooseRole}>Выбрать другую</button></div>}{notice && <p className="portalNotice">{notice}</p>}<button className="portalButton" disabled={saving || !file || !selectedRole}>{saving ? "Сохраняем…" : "Участвовать"}</button></form></section>;
}

function AdminWorkspace() {
  const [tab, setTab] = useState<"roles" | "participants">("roles"); const [roles, setRoles] = useState<WeddingRole[]>([]); const [participants, setParticipants] = useState<Participant[]>([]); const [notice, setNotice] = useState("");
  useEffect(() => {
    const { db } = getFirebase();
    const stopRoles = onSnapshot(query(collection(db, "roles"), orderBy("title")), (snapshot) => {
      setRoles(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as WeddingRole)));
    });
    const stopParticipants = onSnapshot(query(collection(db, "participants"), orderBy("createdAt", "desc")), (snapshot) => {
      setParticipants(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Participant)));
    });
    return () => { stopRoles(); stopParticipants(); };
  }, []);
  async function addRole(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await addDoc(collection(getFirebase().db, "roles"), { title: String(form.get("title")).trim(), description: String(form.get("description")).trim(), gender: String(form.get("gender")), isActive: true, createdAt: serverTimestamp() }); event.currentTarget.reset(); setNotice("Роль добавлена."); } catch { setNotice("Не удалось добавить роль."); } }
  async function removeRole(role: WeddingRole) { if (!confirm(`Удалить роль «${role.title}»?`)) return; await deleteDoc(doc(getFirebase().db, "roles", role.id)); }
  const roleNames = useMemo(() => new Map(roles.map(role => [role.id, role.title])), [roles]);
  const roleCards = roles.map((role) => <article className={`roleCard ${role.isActive === false ? "roleUsed" : ""}`} key={role.id}><div className="roleCardCopy"><strong>{role.title}</strong><span>{role.gender === "any" ? "для всех" : role.gender === "male" ? "для мужчин" : "для женщин"}</span>{role.description ? <p>{role.description}</p> : null}</div><div className="roleCardActions"><span className={`roleStatus ${role.isActive === false ? "occupied" : "available"}`}><i />{role.isActive === false ? "Занята" : "Свободна"}</span><button onClick={() => removeRole(role)}>Удалить</button></div></article>);
  const rolesView = <section className="adminColumns"><form className="portalPanel" onSubmit={addRole}><h2>Новая роль</h2><label>Название<input name="title" required placeholder="Например, свидетель" /></label><label>Описание<textarea name="description" placeholder="Что нужно делать участнику" /></label><label>Кому доступна<select name="gender"><option value="any">Всем</option><option value="male">Мужчинам</option><option value="female">Женщинам</option></select></label><button className="portalButton">Создать роль</button></form><section className="portalPanel"><h2>Созданные роли</h2><div className="roleList">{roleCards}{!roles.length && <p className="emptyGuests">Создайте роли до начала регистрации.</p>}</div></section></section>;
  const participantsView = <section className="participantsGrid">{participants.map((participant) => <ParticipantCard key={participant.id} participant={participant} roleName={roleNames.get(participant.roleId) || "Удалённая роль"} />)}{!participants.length && <p className="emptyGuests">Здесь появятся участники после регистрации.</p>}</section>;
  return <>
    <section className="workspaceStats"><div><b>{roles.filter((role) => role.isActive !== false).length}</b><span>активных ролей</span></div><div><b>{participants.length}</b><span>участников</span></div><div><b>{participants.filter(person => person.gender === "female").length}</b><span>женщин</span></div></section>
    <nav className="workspaceTabs"><button className={tab === "roles" ? "active" : ""} onClick={() => setTab("roles")}>Роли</button><button className={tab === "participants" ? "active" : ""} onClick={() => setTab("participants")}>Участники</button></nav>
    {notice && <p className="portalNotice workspaceNotice">{notice}</p>}
    {tab === "roles" ? rolesView : participantsView}
  </>;
}

function ParticipantCard({ participant, roleName }: { participant: Participant; roleName: string }) { const [url, setUrl] = useState(""); useEffect(() => { getDownloadURL(ref(getFirebase().storage, participant.photoPath)).then(setUrl).catch(() => undefined); }, [participant.photoPath]); return <article className="participantCard">{url ? <img src={url} alt={participant.name} /> : <div className="photoLoading">Фото загружается…</div>}<div><p className="portalLabel">{participant.gender === "male" ? "Мужчина" : "Женщина"}</p><h2>{participant.name}</h2><strong>{roleName}</strong></div></article>; }
