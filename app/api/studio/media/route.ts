import { requireStudioApiUser } from "@/lib/studio-auth";
import { ensureStudioSchema } from "@/lib/studio-db";
import { deleteStudioMedia } from "@/lib/studio-media";
import { getDatabase, getImagesBinding, getMediaBucket } from "@/lib/studio-runtime";
import { assertSameOrigin, isStudioStorageKey, StudioRequestError, studioErrorResponse } from "@/lib/studio-security";
import type { UploadedStudioMedia } from "@/lib/studio-types";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_SOURCE_DIMENSION = 20000;
const MAX_OUTPUT_WIDTH = 2400;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function dimension(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_SOURCE_DIMENSION) {
    throw new StudioRequestError(400, "The image dimensions could not be read.");
  }
  return Math.round(parsed);
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireStudioApiUser();
    await ensureStudioSchema();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new StudioRequestError(400, "Choose an image to upload.");
    if (!allowedTypes.has(file.type)) throw new StudioRequestError(415, "Upload a JPEG, PNG or WebP image.");
    if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new StudioRequestError(413, "Images must be smaller than 25 MB.");

    const sourceWidth = dimension(form.get("width"));
    const sourceHeight = dimension(form.get("height"));
    const images = await getImagesBinding();
    if (!images) throw new StudioRequestError(503, "Image processing is temporarily unavailable. Please try again shortly.");

    const original = await file.arrayBuffer();
    const targetWidth = Math.min(sourceWidth, MAX_OUTPUT_WIDTH);
    let response: Response;
    try {
      const transformed = await images
        .input(new Blob([original], { type: file.type }).stream())
        .transform({ width: targetWidth })
        .output({ format: "image/webp", quality: 84 });
      response = transformed.response();
    } catch (error) {
      console.error("Carmel Studio image processing failed", error);
      throw new StudioRequestError(422, "This image could not be processed. Export it again as JPEG, PNG or WebP and retry.");
    }
    if (!response.ok) throw new StudioRequestError(422, "This image could not be processed. Export it again and retry.");

    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength) throw new StudioRequestError(422, "The processed image was empty. Please try another export.");
    const contentType = "image/webp";
    const width = targetWidth;
    const height = Math.max(1, Math.round(sourceHeight * (targetWidth / sourceWidth)));
    const key = "studio/" + new Date().getUTCFullYear() + "/" + crypto.randomUUID() + ".webp";
    const src = "/media/" + key;

    const bucket = await getMediaBucket();
    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        originalName: file.name.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120),
      },
    });

    const db = await getDatabase();
    await db.prepare("INSERT INTO portfolio_media (storage_key, src, content_type, width, height, size_bytes, attached_project_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, CURRENT_TIMESTAMP)")
      .bind(key, src, contentType, width, height, bytes.byteLength)
      .run();
    await db.prepare("INSERT INTO studio_audit_log (actor_email, actor_user_id, action, entity_type, entity_id, details_json) VALUES (?, ?, 'upload', 'media', ?, ?)")
      .bind(user.email.toLowerCase(), user.userId, key, JSON.stringify({ originalName: file.name, width, height, contentType }))
      .run();

    const media: UploadedStudioMedia = {
      src,
      storageKey: key,
      width,
      height,
      contentType,
      sizeBytes: bytes.byteLength,
    };
    return Response.json({ media }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    await requireStudioApiUser();
    await ensureStudioSchema();
    const key = new URL(request.url).searchParams.get("key") ?? "";
    if (!isStudioStorageKey(key)) throw new StudioRequestError(400, "Invalid media key.");
    const db = await getDatabase();
    const media = await db.prepare("SELECT attached_project_id FROM portfolio_media WHERE storage_key = ? LIMIT 1")
      .bind(key)
      .first<{ attached_project_id: string | null }>();
    if (media?.attached_project_id) throw new StudioRequestError(409, "Save the project without this image before deleting the file.");
    await deleteStudioMedia([key]);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}
