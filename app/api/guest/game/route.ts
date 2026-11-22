import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

type GuestProfile = { role?: string; eventId?: string; clientId?: string; name?: string };

async function guestContext(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  const { adminAuth, adminDb, adminStorage } = getAdminServices();
  const identity = await adminAuth.verifyIdToken(token);
  const profile = (await adminDb.collection("users").doc(identity.uid).get()).data() as GuestProfile | undefined;
  if (profile?.role !== "guest" || !profile.eventId) throw new Error("FORBIDDEN");
  const event = await adminDb.collection("events").doc(profile.eventId).get();
  if (!event.exists || event.data()?.isActive === false || event.data()?.guestAccessEnabled === false) throw new Error("FORBIDDEN");
  return { identity, profile, adminDb, adminStorage };
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
  return NextResponse.json({ error: status === 403 ? "Guest access is not available for this email." : "Unable to load the guest portal." }, { status });
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { adminAuth, adminDb } = getAdminServices();
    const identity = await adminAuth.verifyIdToken(token);
    const email = identity.email?.trim().toLowerCase();
    if (!email || !identity.email_verified) return NextResponse.json({ error: "Confirm your email before continuing." }, { status: 403 });

    const current = (await adminDb.collection("users").doc(identity.uid).get()).data() as GuestProfile | undefined;
    if (current && current.role !== "guest") return NextResponse.json({ error: "This account is not a guest account." }, { status: 403 });

    const matches = await adminDb.collection("clients").where("email", "==", email).limit(5).get();
    let invitation = matches.docs.find((item) => Boolean(item.data().eventId || item.data().eventIds?.[0]));
    let eventId = invitation ? (invitation.data().eventId ?? invitation.data().eventIds?.[0]) as string | undefined : undefined;
    if (!invitation) {
      for (const candidate of matches.docs) {
        const eventMatch = await adminDb.collection("events").where("clientIds", "array-contains", candidate.id).limit(1).get();
        if (!eventMatch.empty) { invitation = candidate; eventId = eventMatch.docs[0].id; break; }
      }
    }
    if (!invitation || !eventId) return NextResponse.json({ error: "Этот e-mail не привязан к активному мероприятию." }, { status: 403 });
    const event = await adminDb.collection("events").doc(eventId).get();
    if (!event.exists || event.data()?.isActive === false || event.data()?.guestAccessEnabled === false) return NextResponse.json({ error: "Это мероприятие сейчас недоступно." }, { status: 403 });

    await invitation.ref.set({ eventId, eventIds: FieldValue.arrayUnion(eventId) }, { merge: true });

    await adminDb.collection("users").doc(identity.uid).set({
      email,
      name: invitation.data().name ?? identity.name ?? "Гость",
      role: "guest",
      eventId,
      clientId: invitation.id,
      updatedAt: FieldValue.serverTimestamp(),
      ...(current ? {} : { createdAt: FieldValue.serverTimestamp() }),
    }, { merge: true });
    return NextResponse.json({ ok: true, name: invitation.data().name ?? "Гость" });
  } catch (error) {
    console.error("Guest portal bootstrap error", error);
    return failure(error);
  }
}

export async function GET(request: Request) {
  try {
    const { identity, profile, adminDb, adminStorage } = await guestContext(request);
    const [event, participants, finds] = await Promise.all([
      adminDb.collection("events").doc(profile.eventId!).get(),
      adminDb.collection("participants").where("eventId", "==", profile.eventId).get(),
      adminDb.collection("guestFinds").where("guestId", "==", identity.uid).get(),
    ]);
    const found = new Set(finds.docs.map((item) => item.data().participantId as string));
    const bucket = adminStorage.bucket();
    // Собственная запись гостя (билет) не участвует в игре, а её роль показываем отдельно.
    const guestEmail = identity.email?.trim().toLowerCase();
    const mine = (profile.clientId ? participants.docs.find((item) => item.data().clientId === profile.clientId) : undefined)
      ?? participants.docs.find((item) => Boolean(guestEmail) && String(item.data().email ?? "").trim().toLowerCase() === guestEmail);
    const others = participants.docs.filter((item) => item.id !== mine?.id);
    const roleDocs = await Promise.all(others.map((item) => item.data().roleId ? adminDb.collection("events").doc(profile.eventId!).collection("roles").doc(item.data().roleId).get() : Promise.resolve(undefined)));
    // Если запись участника не найдена, роль берём из билета с тем же e-mail.
    const ticketMatch = !mine && guestEmail ? await adminDb.collection("events").doc(profile.eventId!).collection("tickets").where("email", "==", guestEmail).limit(1).get() : undefined;
    const ticketData = ticketMatch?.docs[0]?.data();
    const myRoleId = mine?.data().roleId ?? ticketData?.roleId;
    const myRoleDoc = myRoleId ? await adminDb.collection("events").doc(profile.eventId!).collection("roles").doc(String(myRoleId)).get() : undefined;
    let myRole: { title: string; description: string; photoUrl?: string } | null = null;
    if (myRoleDoc?.exists) {
      const rolePhotoPath = myRoleDoc.data()?.photoPath as string | undefined;
      let photoUrl: string | undefined;
      if (rolePhotoPath) {
        const [url] = await bucket.file(rolePhotoPath).getSignedUrl({ action: "read", version: "v4", expires: Date.now() + 15 * 60 * 1000 });
        photoUrl = url;
      }
      myRole = { title: String(myRoleDoc.data()?.title ?? ""), description: String(myRoleDoc.data()?.description ?? ""), photoUrl };
    }
    const targets = await Promise.all(others.map(async (item, index) => {
      const photoPath = item.data().photoPath as string | undefined;
      const rolePhotoPath = roleDocs[index]?.data()?.photoPath as string | undefined;
      let photoUrl: string | undefined;
      if (photoPath || rolePhotoPath) {
        const [url] = await bucket.file(photoPath || rolePhotoPath!).getSignedUrl({ action: "read", version: "v4", expires: Date.now() + 15 * 60 * 1000 });
        photoUrl = url;
      }
      return { id: item.id, photoUrl, found: found.has(item.id) };
    }));
    return NextResponse.json({ event: { title: event.data()?.title ?? "Fake Wedding", date: event.data()?.date, location: event.data()?.location }, guestName: String(mine?.data().name ?? (ticketData ? `${ticketData.firstName ?? ""} ${ticketData.lastName ?? ""}`.trim() : "") ?? profile.name ?? identity.name ?? ""), myRole, targets });
  } catch (error) {
    console.error("Guest game load error", error);
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { identity, profile, adminDb } = await guestContext(request);
    const { participantId } = await request.json() as { participantId?: string };
    if (!participantId) return NextResponse.json({ error: "Participant is required." }, { status: 400 });
    const participant = await adminDb.collection("participants").doc(participantId).get();
    if (!participant.exists || participant.data()?.eventId !== profile.eventId) return NextResponse.json({ error: "Invalid participant." }, { status: 400 });
    await adminDb.collection("guestFinds").doc(`${identity.uid}_${participantId}`).set({ guestId: identity.uid, participantId, eventId: profile.eventId, foundAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Guest game update error", error);
    return failure(error);
  }
}
