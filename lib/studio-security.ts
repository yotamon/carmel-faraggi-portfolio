export class StudioRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "StudioRequestError";
    this.status = status;
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) throw new StudioRequestError(403, "Unable to verify this request.");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) throw new StudioRequestError(403, "Unable to verify this request.");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new StudioRequestError(403, "Unable to verify this request.");
  }
  if (originHost !== host) throw new StudioRequestError(403, "Cross-site requests are not allowed.");
}

export function studioErrorResponse(error: unknown) {
  if (error instanceof StudioRequestError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Carmel Studio request failed", error);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function safeSlug(value: unknown) {
  return cleanText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isStudioStorageKey(value: string) {
  return /^studio\/\d{4}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i.test(value);
}

export function isStaticProjectMediaPath(value: string) {
  return /^\/projects\/[a-z0-9-]+\/[a-zA-Z0-9._-]+$/.test(value);
}
