type RuntimeBindings = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  IMAGES?: StudioImagesBinding;
};

export type StudioImagesBinding = {
  input(stream: ReadableStream): {
    transform(options: Record<string, unknown>): {
      output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
    };
  };
};

let bindingsPromise: Promise<RuntimeBindings> | null = null;

async function bindings(): Promise<RuntimeBindings> {
  if (!bindingsPromise) {
    bindingsPromise = import("cloudflare:workers")
      .then(({ env }) => env as unknown as RuntimeBindings)
      .catch((error) => {
        bindingsPromise = null;
        throw error;
      });
  }
  return bindingsPromise;
}

export async function getDatabase(): Promise<D1Database> {
  const db = (await bindings()).DB;
  if (!db) throw new Error("Carmel Studio database binding is unavailable.");
  return db;
}

export async function getMediaBucket(): Promise<R2Bucket> {
  const bucket = (await bindings()).MEDIA;
  if (!bucket) throw new Error("Carmel Studio media storage is unavailable.");
  return bucket;
}

export async function getImagesBinding(): Promise<StudioImagesBinding | null> {
  return (await bindings()).IMAGES ?? null;
}
