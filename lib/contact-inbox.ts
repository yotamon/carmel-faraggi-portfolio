import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase } from "@/lib/studio-runtime";
import { StudioRequestError } from "@/lib/studio-security";

export type InquiryStatus = "new" | "replied" | "archived";
export type StudioInquiry = {
  id: number;
  name: string;
  email: string;
  interest: string;
  project: string;
  createdAt: string;
  status: InquiryStatus;
};

export async function listInquiries(): Promise<StudioInquiry[]> {
  await ensureStudioSchema();
  const db = await getDatabase();
  const result = await db.prepare(
    "SELECT s.id, s.name, s.email, s.interest, s.project, s.created_at, COALESCE(st.status,'new') AS status FROM contact_submissions s LEFT JOIN studio_contact_state st ON st.submission_id=s.id ORDER BY s.created_at DESC, s.id DESC LIMIT 250",
  ).all<{id:number;name:string;email:string;interest:string;project:string;created_at:string;status:InquiryStatus}>();
  return (result.results ?? []).map(row => ({
    id: row.id, name: row.name, email: row.email, interest: row.interest,
    project: row.project, createdAt: row.created_at, status: row.status,
  }));
}

export async function countNewInquiries(): Promise<number> {
  await ensureStudioSchema();
  const db = await getDatabase();
  const row = await db.prepare(
    "SELECT COUNT(*) AS total FROM contact_submissions s LEFT JOIN studio_contact_state st ON st.submission_id=s.id WHERE COALESCE(st.status,'new')='new'",
  ).first<{total:number}>();
  return Number(row?.total ?? 0);
}

export async function setInquiryStatus(id: number, status: InquiryStatus, actor: { email: string; userId: string }) {
  if (!Number.isSafeInteger(id) || id < 1) throw new StudioRequestError(400, "Invalid inquiry ID.");
  if (!["new", "replied", "archived"].includes(status)) throw new StudioRequestError(400, "Invalid inquiry status.");
  await ensureStudioSchema();
  const db = await getDatabase();
  const exists = await db.prepare("SELECT id FROM contact_submissions WHERE id=? LIMIT 1").bind(id).first();
  if (!exists) throw new StudioRequestError(404, "Inquiry not found.");
  await db.batch([
    db.prepare("INSERT INTO studio_contact_state (submission_id,status,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(submission_id) DO UPDATE SET status=excluded.status,updated_at=CURRENT_TIMESTAMP").bind(id,status),
    db.prepare("INSERT INTO studio_audit_log (actor_email,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,?,'inquiry',?,?)")
      .bind(actor.email.toLowerCase(),actor.userId,"inquiry_status",String(id),JSON.stringify({status})),
  ]);
}
