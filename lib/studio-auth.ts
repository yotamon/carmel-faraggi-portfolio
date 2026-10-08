import { redirect } from "next/navigation";
import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";
import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase } from "@/lib/studio-runtime";
import { StudioRequestError } from "@/lib/studio-security";

export async function getStudioAccess(user: ChatGPTUser | null) {
  if (!user) return { user: null, allowed: false };
  try {
    await ensureStudioSchema();
    const db = getDatabase();
    const email = user.email.trim().toLowerCase();
    const admin = await db.prepare("SELECT email, role FROM studio_admins WHERE lower(email) = ? LIMIT 1")
      .bind(email)
      .first<{ email: string; role: string }>();
    if (!admin) return { user, allowed: false };
    await db.prepare("UPDATE studio_admins SET user_id = ?, display_name = ?, last_seen_at = CURRENT_TIMESTAMP WHERE lower(email) = ?")
      .bind(user.userId, user.fullName ?? user.displayName, email)
      .run();
    return { user, allowed: true, role: admin.role };
  } catch (error) {
    console.error("Unable to verify Carmel Studio access", error);
    return { user, allowed: false, unavailable: true };
  }
}

export async function requireStudioPage(returnTo: string) {
  const user = await getChatGPTUser();
  if (!user) redirect("/studio?return_to=" + encodeURIComponent(returnTo));
  const access = await getStudioAccess(user);
  if (!access.allowed) redirect("/studio?denied=1");
  return user;
}

export async function requireStudioApiUser() {
  const user = await getChatGPTUser();
  if (!user) throw new StudioRequestError(401, "Sign in to Carmel Studio to continue.");
  const access = await getStudioAccess(user);
  if (!access.allowed) throw new StudioRequestError(403, "You do not have access to Carmel Studio.");
  return user;
}
