import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase } from "@/lib/studio-runtime";

export type EventSummary={event:string;path:string;count:number};
export async function listStudioInsights():Promise<EventSummary[]> {
  await ensureStudioSchema();
  const db=await getDatabase();
  const rows=await db.prepare(
    "SELECT event_key AS event,event_path AS path,SUM(event_count) AS count FROM studio_event_counts WHERE event_day>=date('now','-29 days') GROUP BY event_key,event_path ORDER BY count DESC LIMIT 100",
  ).all<EventSummary>();
  return rows.results??[];
}
