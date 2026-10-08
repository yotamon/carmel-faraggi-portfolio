import { getMediaBucket } from "@/lib/studio-runtime";
import { isStudioStorageKey } from "@/lib/studio-security";

function mediaKey(parts: string[]) {
  const key = parts.join("/");
  if (!isStudioStorageKey(key)) return null;
  return key;
}

async function serve(context: { params: Promise<{ key: string[] }> }, head = false) {
  const { key: parts } = await context.params;
  const key = mediaKey(parts);
  if (!key) return new Response("Not found", { status: 404 });
  try {
    const object = await (await getMediaBucket()).get(key);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
    return new Response(head ? null : object.body, { headers });
  } catch (error) {
    console.error("Unable to serve portfolio media", error);
    return new Response("Not found", { status: 404 });
  }
}

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  return serve(context);
}

export async function HEAD(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  return serve(context, true);
}
