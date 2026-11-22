import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 300 * 1024 * 1024;
const extensions: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

// Выдаёт короткоживущую ссылку, по которой браузер загружает видео прямо в Firebase Storage.
// Так большой файл не проходит через сервер сайта.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { contentType?: string; size?: number };
    const contentType = String(body.contentType ?? "");
    const size = Number(body.size ?? 0);
    const extension = extensions[contentType];
    if (!extension) return NextResponse.json({ error: "Загрузите видео в формате MP4, MOV или WebM.", code: "VIDEO_TYPE" }, { status: 400 });
    if (!Number.isFinite(size) || size <= 0 || size > MAX_VIDEO_BYTES)
      return NextResponse.json({ error: "Видео должно быть не больше 300 МБ.", code: "VIDEO_SIZE" }, { status: 400 });

    const { adminStorage } = getAdminServices();
    const path = `candidates/${randomUUID()}.${extension}`;
    const [uploadUrl] = await adminStorage.bucket().file(path).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });
    return NextResponse.json({ uploadUrl, path });
  } catch (error) {
    console.error("Candidate upload url error", error);
    return NextResponse.json({ error: "Не удалось подготовить загрузку видео. Попробуйте ещё раз." }, { status: 500 });
  }
}
