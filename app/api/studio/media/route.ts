import { requireStudioApiUser } from "@/lib/studio-auth";
import { ensureStudioSchema } from "@/lib/studio-db";
import { deleteStudioMedia } from "@/lib/studio-media";
import { getDatabase, getImagesBinding, getMediaBucket } from "@/lib/studio-runtime";
import { assertSameOrigin, StudioRequestError, studioErrorResponse } from "@/lib/studio-security";
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

function extensionFor(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  return "webp";
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
    const original = await file.arrayBuffer();
    let bytes = original;
    let contentType = file.type;
    let width = sourceWidth;
    let height = sourceHeight;

    const images = getImagesBinding();
    if (images) {
      try {
        const targetWidth = Math.min(sourceWidth, MAX_OUTPUT_WIDTH);
        const transformed = await images
          .input(new Blob([original], { type: file.type }).stream())
          .transform(targetWidth < sourceWidth ? { width: targetWidth } : {})
          .output({ format: "image/webp", quality: 84 });
        const response = transformed.response();
        if (response.ok) {
          bytes = await response.arrayBuffer();
          contentType = "image/webp";
          width = targetWidth;
          height = Math.max(1, Math.round(sourceHeight * (targetWidth / sourceWidth)));
        }
      } catch (error) {
        console.error("Image optimization failed; storing the validated original.", error);
      }
    }

    const extension = extensionFor(contentType);
    const key = "studio/" + new Date().getUTCFullYear() + "/" + crypto.randomUUID() + "." + extension;
    const src = "/media/" + key;
    const bucket = getMediaBucket();
    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        originalName: file.name.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120),
      },
    });

    const db = getDatabase();
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
    if (!key.startsWith("studio/")) throw new StudioRequestError(400, "Invalid media key.");
    const db = getDatabase();
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
