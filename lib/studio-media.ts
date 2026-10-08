import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase, getMediaBucket } from "@/lib/studio-runtime";

export async function deleteStudioMedia(keys: string[]) {
  const unique = [...new Set(keys.filter((key) => key.startsWith("studio/")))];
  if (!unique.length) return;
  await ensureStudioSchema();
  const bucket = getMediaBucket();
  const db = getDatabase();
  for (const key of unique) {
    try {
      await bucket.delete(key);
    } catch (error) {
      console.error("Unable to delete R2 object", key, error);
      continue;
    }
    await db.prepare("DELETE FROM portfolio_media WHERE storage_key = ?").bind(key).run();
  }
}

export async function cleanupStaleStudioMedia() {
  try {
    await ensureStudioSchema();
    const db = getDatabase();
    const result = await db.prepare("SELECT storage_key FROM portfolio_media WHERE attached_project_id IS NULL AND created_at < datetime('now', '-48 hours') ORDER BY created_at LIMIT 20")
      .all<{ storage_key: string }>();
    const keys = (result.results ?? []).map((row) => row.storage_key);
    await deleteStudioMedia(keys);
  } catch (error) {
    console.error("Unable to clean stale Carmel Studio uploads", error);
  }
}
