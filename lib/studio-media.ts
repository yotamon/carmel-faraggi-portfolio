import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase, getMediaBucket } from "@/lib/studio-runtime";

export async function deleteStudioMedia(keys: string[]) {
  const unique = [...new Set(keys.filter((key) => key.startsWith("studio/")))];
  if (!unique.length) return;
  await ensureStudioSchema();
  const bucket = await getMediaBucket();
  const db = await getDatabase();
  try {
    await bucket.delete(unique);
  } catch (error) {
    console.error("Unable to delete R2 objects", unique, error);
    return;
  }
  await db.batch(unique.map((key) => db.prepare("DELETE FROM portfolio_media WHERE storage_key = ?").bind(key)));
}

export async function cleanupStaleStudioMedia() {
  try {
    await ensureStudioSchema();
    const db = await getDatabase();
    const result = await db.prepare("SELECT storage_key FROM portfolio_media WHERE attached_project_id IS NULL AND created_at < datetime('now', '-7 days') ORDER BY created_at LIMIT 20")
      .all<{ storage_key: string }>();
    const keys = (result.results ?? []).map((row) => row.storage_key);
    await deleteStudioMedia(keys);
  } catch (error) {
    console.error("Unable to clean stale Carmel Studio uploads", error);
  }
}
