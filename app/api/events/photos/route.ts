import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

async function context(request: Request) {
  const services = getAdminServices();
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  let uid: string;
  try { uid = (await services.adminAuth.verifyIdToken(token)).uid; }
  catch { throw new Error("UNAUTHORIZED"); }
  const profile = await services.adminDb.collection("users").doc(uid).get();
  if (profile.data()?.role !== "admin") throw new Error("FORBIDDEN");
  return services;
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
  console.error("Participant photos error", error);
  return NextResponse.json({ error: status === 500 ? "Не удалось обработать фотографии." : "Нет доступа." }, { status });
}

export async function GET(request: Request) {
  try {
    const { adminDb, adminStorage } = await context(request);
    const eventId = new URL(request.url).searchParams.get("eventId");
    if (!eventId || eventId.includes("/")) return NextResponse.json({ error: "Укажите мероприятие." }, { status: 400 });
    const event = await adminDb.collection("events").doc(eventId).get();
    const snapshot = await adminDb.collection("events").doc(eventId).collection("photos").orderBy("createdAt", "desc").get();
    const photos = await Promise.all(snapshot.docs.map(async (item) => {
      let url = "";
      try { [url] = await adminStorage.bucket().file(item.data().photoPath).getSignedUrl({ action: "read", version: "v4", expires: Date.now() + 15 * 60 * 1000 }); } catch { /* Keep the card visible if storage is unavailable. */ }
      return { id: item.id, name: item.data().name, roleTitle: item.data().roleTitle ?? "", roleId: item.data().roleId ?? "", url };
    }));
    const roles = await adminDb.collection("events").doc(eventId).collection("roles").orderBy("title").get();
    return NextResponse.json({ photos, roles: roles.docs.map((item) => ({ id: item.id, title: item.data().title })), winners: event.data()?.photoWinners ?? {} }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const { adminDb, adminStorage } = await context(request);
    if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) return NextResponse.json({ error: "Фото должно быть не больше 10 МБ." }, { status: 413 });
    const form = await request.formData();
    const eventId = form.get("eventId");
    const file = form.get("photo");
    if (typeof eventId !== "string" || !eventId || eventId.includes("/") || !(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Выберите фото до 10 МБ." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? "jpg"
      : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png"
      : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : undefined;
    if (!extension) return NextResponse.json({ error: "Поддерживаются JPG, PNG и WebP." }, { status: 400 });
    const eventRef = adminDb.collection("events").doc(eventId);
    const photoRef = eventRef.collection("photos").doc();
    const path = `participant-photos/${eventId}/${randomUUID()}.${extension}`;
    const object = adminStorage.bucket().file(path);
    if (!(await eventRef.get()).exists) return NextResponse.json({ error: "Мероприятие не найдено." }, { status: 404 });
    await object.save(bytes, { resumable: false, metadata: { contentType: `image/${extension === "jpg" ? "jpeg" : extension}` } });
    try {
      await adminDb.runTransaction(async (transaction) => {
        if (!(await transaction.get(eventRef)).exists) throw new Error("Event no longer exists");
        transaction.create(photoRef, { photoPath: path, name: file.name.slice(0, 240), createdAt: new Date() });
        transaction.update(eventRef, { photoCount: FieldValue.increment(1) });
      });
    } catch (error) { await object.delete().catch(() => undefined); throw error; }
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}

export async function PATCH(request: Request) {
  try {
    const { adminDb } = await context(request);
    const { eventId, photoId, place, roleTitle, roleId } = await request.json();
    if (roleTitle !== undefined) {
      if (typeof eventId !== "string" || !eventId || eventId.includes("/") || typeof photoId !== "string" || !photoId || photoId.includes("/") || typeof roleTitle !== "string" || roleTitle.trim().length > 120 || (roleId !== undefined && (typeof roleId !== "string" || roleId.includes("/")))) return NextResponse.json({ error: "Укажите роль длиной до 120 символов." }, { status: 400 });
      const eventRef = adminDb.collection("events").doc(eventId);
      const photoRef = eventRef.collection("photos").doc(photoId);
      const saved = await adminDb.runTransaction(async (transaction) => {
        const photo = await transaction.get(photoRef);
        if (!photo.exists) throw new Error("Photo not found");
        let title = roleTitle.trim();
        if (roleId) {
          const role = await transaction.get(eventRef.collection("roles").doc(roleId));
          if (!role.exists) throw new Error("Role not found");
          title = String(role.data()?.title ?? "");
        }
        const value = { roleTitle: title, roleId: roleId || "" };
        transaction.update(photoRef, value);
        return value;
      });
      return NextResponse.json(saved);
    }
    if (typeof eventId !== "string" || !eventId || eventId.includes("/") || typeof photoId !== "string" || !photoId || photoId.includes("/") || ![0, 1, 2, 3].includes(place)) return NextResponse.json({ error: "Некорректные данные." }, { status: 400 });
    const eventRef = adminDb.collection("events").doc(eventId);
    const winners = await adminDb.runTransaction(async (transaction) => {
      const [event, photo] = await Promise.all([transaction.get(eventRef), transaction.get(eventRef.collection("photos").doc(photoId))]);
      if (!event.exists || !photo.exists) throw new Error("Photo not found");
      const next: Record<string, string> = { ...(event.data()?.photoWinners ?? {}) };
      for (const key of Object.keys(next)) if (next[key] === photoId) delete next[key];
      if (place) next[String(place)] = photoId;
      transaction.update(eventRef, { photoWinners: next });
      return next;
    });
    return NextResponse.json({ winners });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request) {
  try {
    const { adminDb, adminStorage } = await context(request);
    const { eventId, photoId } = await request.json();
    if (typeof eventId !== "string" || !eventId || eventId.includes("/") || typeof photoId !== "string" || !photoId || photoId.includes("/")) {
      return NextResponse.json({ error: "Некорректные данные." }, { status: 400 });
    }
    const eventRef = adminDb.collection("events").doc(eventId);
    const photoRef = eventRef.collection("photos").doc(photoId);
    const photo = await photoRef.get();
    if (photo.exists) {
      const path = photo.data()?.photoPath;
      if (typeof path !== "string" || ![
        `participant-photos/${eventId}/`,
        `event-photos/${eventId}/`,
      ].some((prefix) => path.startsWith(prefix))) throw new Error("Invalid photo path");
      // Keep metadata available for retry if deleting the object fails.
      await adminStorage.bucket().file(path).delete({ ignoreNotFound: true });
    }
    await adminDb.runTransaction(async (transaction) => {
      const [event, current] = await Promise.all([transaction.get(eventRef), transaction.get(photoRef)]);
      if (event.exists) {
        const winners: Record<string, string> = { ...(event.data()?.photoWinners ?? {}) };
        for (const key of Object.keys(winners)) if (winners[key] === photoId) delete winners[key];
        transaction.update(eventRef, {
          photoWinners: winners,
          ...(current.exists ? { photoCount: Math.max(0, (Number(event.data()?.photoCount) || 0) - 1) } : {}),
        });
      }
      if (current.exists) transaction.delete(photoRef);
    });
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}
