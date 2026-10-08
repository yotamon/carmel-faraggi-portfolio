import { env } from "cloudflare:workers";

export type StudioImagesBinding = {
  input(stream: ReadableStream): {
    transform(options: Record<string, unknown>): {
      output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
    };
  };
};

type RuntimeBindings = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  IMAGES?: StudioImagesBinding;
};

function bindings() {
  return env as unknown as RuntimeBindings;
}

export function getDatabase(): D1Database {
  const db = bindings().DB;
  if (!db) throw new Error("Carmel Studio database binding is unavailable.");
  return db;
}

export function getMediaBucket(): R2Bucket {
  const bucket = bindings().MEDIA;
  if (!bucket) throw new Error("Carmel Studio media storage is unavailable.");
  return bucket;
}

export function getImagesBinding(): StudioImagesBinding | null {
  return bindings().IMAGES ?? null;
}
