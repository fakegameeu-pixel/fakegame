import { NextResponse } from "next/server";
import { getAdminServices } from "../../lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get("eventId");
  if (!eventId || eventId.includes("/") || eventId.length > 128) return NextResponse.json({ error: "Некорректная ссылка на розыгрыш." }, { status: 400 });
  try {
    const { adminDb, adminStorage } = getAdminServices();
    const eventRef = adminDb.collection("events").doc(eventId);
    const event = await eventRef.get();
    if (!event.exists || event.data()?.isActive === false) return NextResponse.json({ error: "Розыгрыш недоступен." }, { status: 404 });
    const snapshot = await eventRef.collection("photos").orderBy("createdAt", "desc").get();
    const photos = await Promise.all(snapshot.docs.map(async (item, index) => {
      let url = "";
      const path = item.data().photoPath;
      if (typeof path === "string" && [`participant-photos/${eventId}/`, `event-photos/${eventId}/`].some((prefix) => path.startsWith(prefix))) {
        try { [url] = await adminStorage.bucket().file(path).getSignedUrl({ action: "read", version: "v4", expires: Date.now() + 15 * 60 * 1000 }); }
        catch { /* An unavailable file must not break the carousel. */ }
      }
      return { id: item.id, name: `Фото ${index + 1}`, roleTitle: item.data().roleTitle ?? "", url };
    }));
    return NextResponse.json({ photos, winners: event.data()?.photoWinners ?? {} }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public draw load error", error);
    return NextResponse.json({ error: "Не удалось загрузить розыгрыш. Попробуйте позже." }, { status: 500 });
  }
}
