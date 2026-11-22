import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { getAdminServices } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 300 * 1024 * 1024;
const extensions: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

// Принимает видео от формы и сохраняет его в Firebase Storage.
// Файл идёт на свой сервер, поэтому CORS для бакета не нужен. Ошибки отдаём кодами.
export async function POST(request: Request) {
  try {
    const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim();
    const size = Number(request.headers.get("x-file-size") ?? 0);
    const extension = extensions[contentType];
    if (!extension) return NextResponse.json({ code: "VIDEO_TYPE" }, { status: 400 });
    if (!Number.isFinite(size) || size <= 0 || size > MAX_VIDEO_BYTES) return NextResponse.json({ code: "VIDEO_SIZE" }, { status: 400 });
    if (!request.body) return NextResponse.json({ code: "VIDEO_EMPTY" }, { status: 400 });

    const { adminStorage } = getAdminServices();
    const path = `candidates/${randomUUID()}.${extension}`;
    const file = adminStorage.bucket().file(path);
    await pipeline(
      Readable.fromWeb(request.body as unknown as Parameters<typeof Readable.fromWeb>[0]),
      file.createWriteStream({ resumable: false, contentType, metadata: { contentType } }),
    );
    return NextResponse.json({ path });
  } catch (error) {
    console.error("Candidate video upload error", error);
    return NextResponse.json({ code: "SAVE_FAILED" }, { status: 500 });
  }
}
