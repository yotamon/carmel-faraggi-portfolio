import { getDatabase } from "@/lib/studio-runtime";

const BOOTSTRAP_EDITOR_EMAIL = "carmelfaraggi@gmail.com";
let schemaPromise: Promise<void> | null = null;

export function ensureStudioSchema() {
  if (!schemaPromise) {
    schemaPromise = createSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

async function createSchema() {
  const db = await getDatabase();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS contact_submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, interest TEXT NOT NULL, project TEXT NOT NULL, submission_key TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS studio_contact_state (submission_id INTEGER PRIMARY KEY NOT NULL, status TEXT NOT NULL DEFAULT 'new', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS portfolio_projects (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, category TEXT NOT NULL, project_group TEXT NOT NULL, year TEXT NOT NULL, services_json TEXT NOT NULL DEFAULT '[]', layout TEXT NOT NULL DEFAULT 'left', description TEXT NOT NULL DEFAULT '', hero_src TEXT NOT NULL DEFAULT '', hero_alt TEXT NOT NULL DEFAULT '', hero_width INTEGER NOT NULL DEFAULT 1, hero_height INTEGER NOT NULL DEFAULT 1, hero_storage_key TEXT, status TEXT NOT NULL DEFAULT 'draft', sort_order INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1, published_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS portfolio_projects_slug_unique ON portfolio_projects (slug)"),
    db.prepare("CREATE INDEX IF NOT EXISTS portfolio_projects_status_order_idx ON portfolio_projects (status, project_group, sort_order)"),
    db.prepare("CREATE TABLE IF NOT EXISTS portfolio_slug_redirects (old_slug TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE INDEX IF NOT EXISTS portfolio_slug_redirects_project_idx ON portfolio_slug_redirects (project_id)"),
    db.prepare("CREATE TABLE IF NOT EXISTS portfolio_images (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL, src TEXT NOT NULL, storage_key TEXT, alt TEXT NOT NULL DEFAULT '', width INTEGER NOT NULL DEFAULT 1, height INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE INDEX IF NOT EXISTS portfolio_images_project_order_idx ON portfolio_images (project_id, sort_order)"),
    db.prepare("CREATE TABLE IF NOT EXISTS portfolio_media (storage_key TEXT PRIMARY KEY NOT NULL, src TEXT NOT NULL, content_type TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, size_bytes INTEGER NOT NULL, attached_project_id TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE INDEX IF NOT EXISTS portfolio_media_attachment_idx ON portfolio_media (attached_project_id, created_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS studio_admins (email TEXT PRIMARY KEY NOT NULL, user_id TEXT UNIQUE, display_name TEXT, role TEXT NOT NULL DEFAULT 'editor', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, last_seen_at TEXT)"),
    db.prepare("CREATE TABLE IF NOT EXISTS studio_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, actor_email TEXT NOT NULL, actor_user_id TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, details_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE INDEX IF NOT EXISTS studio_audit_created_idx ON studio_audit_log (created_at)"),
    db.prepare("INSERT OR IGNORE INTO studio_admins (email, role) VALUES (?, 'owner')").bind(BOOTSTRAP_EDITOR_EMAIL),
    db.prepare("INSERT OR IGNORE INTO studio_admins (email, role) VALUES (?, 'owner')").bind("yotamon@gmail.com"),
  ]);
}

export function bootstrapStudioEmail() {
  return BOOTSTRAP_EDITOR_EMAIL;
}
