import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { projects as legacyProjects, type Project } from "@/lib/projects";
import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase } from "@/lib/studio-runtime";
import { isStaticProjectMediaPath, isStudioStorageKey, StudioRequestError, safeSlug } from "@/lib/studio-security";
import type { ProjectStatus, StudioImage, StudioProject, StudioProjectPayload } from "@/lib/studio-types";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  project_group: string;
  year: string;
  services_json: string;
  layout: string;
  description: string;
  hero_src: string;
  hero_alt: string;
  hero_width: number;
  hero_height: number;
  hero_storage_key: string | null;
  status: string;
  sort_order: number;
  version: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type ImageRow = {
  id: string;
  project_id: string;
  src: string;
  storage_key: string | null;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
};

let seedPromise: Promise<void> | null = null;

async function ensurePortfolioReady() {
  await ensureStudioSchema();
  if (!seedPromise) {
    seedPromise = seedLegacyProjects().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}

async function seedLegacyProjects() {
  const db = await getDatabase();
  const existing = await db.prepare("SELECT COUNT(*) AS count FROM portfolio_projects").first<{ count: number }>();
  if (Number(existing?.count ?? 0) > 0) return;

  const statements: D1PreparedStatement[] = [];
  legacyProjects.forEach((project, projectIndex) => {
    const id = "legacy-" + project.slug;
    statements.push(
      db.prepare("INSERT OR IGNORE INTO portfolio_projects (id, slug, title, category, project_group, year, services_json, layout, description, hero_src, hero_alt, hero_width, hero_height, hero_storage_key, status, sort_order, version, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'published', ?, 1, CURRENT_TIMESTAMP)")
        .bind(
          id,
          project.slug,
          project.title,
          project.category,
          project.group,
          project.year,
          JSON.stringify(project.services),
          project.layout,
          project.description,
          project.hero,
          project.heroAlt,
          project.heroWidth,
          project.heroHeight,
          (projectIndex + 1) * 10,
        ),
    );
    project.gallery.forEach((image, imageIndex) => {
      statements.push(
        db.prepare("INSERT OR IGNORE INTO portfolio_images (id, project_id, src, storage_key, alt, width, height, sort_order) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)")
          .bind(
            id + "-image-" + imageIndex,
            id,
            image.src,
            image.alt,
            image.width ?? 1536,
            image.height ?? 1024,
            (imageIndex + 1) * 10,
          ),
      );
    });
  });
  if (statements.length) await db.batch(statements);
}

function parseServices(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 12) : [];
  } catch {
    return [];
  }
}

function projectGroup(value: string): Project["group"] {
  return value === "music-culture" ? "music-culture" : "commercial";
}

function projectLayout(value: string): Project["layout"] {
  return value === "right" || value === "wide" ? value : "left";
}

function projectStatus(value: string): ProjectStatus {
  return value === "published" || value === "archived" ? value : "draft";
}

async function hydrate(rows: ProjectRow[]) {
  if (!rows.length) return [] as StudioProject[];
  const db = await getDatabase();
  const placeholders = rows.map(() => "?").join(",");
  const imageResult = await db.prepare("SELECT id, project_id, src, storage_key, alt, width, height, sort_order FROM portfolio_images WHERE project_id IN (" + placeholders + ") ORDER BY project_id, sort_order, id")
    .bind(...rows.map((row) => row.id))
    .all<ImageRow>();
  const byProject = new Map<string, StudioImage[]>();
  for (const row of imageResult.results ?? []) {
    const list = byProject.get(row.project_id) ?? [];
    list.push({
      id: row.id,
      src: row.src,
      storageKey: row.storage_key,
      alt: row.alt,
      width: row.width,
      height: row.height,
      sortOrder: row.sort_order,
    });
    byProject.set(row.project_id, list);
  }
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    group: projectGroup(row.project_group),
    year: row.year,
    services: parseServices(row.services_json),
    layout: projectLayout(row.layout),
    description: row.description,
    hero: row.hero_src,
    heroAlt: row.hero_alt,
    heroWidth: row.hero_width,
    heroHeight: row.hero_height,
    heroStorageKey: row.hero_storage_key,
    status: projectStatus(row.status),
    sortOrder: row.sort_order,
    version: row.version,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    gallery: byProject.get(row.id) ?? [],
  }));
}

async function queryProjects(whereSql: string, binds: unknown[] = []) {
  const db = await getDatabase();
  const result = await db.prepare(
    "SELECT id, slug, title, category, project_group, year, services_json, layout, description, hero_src, hero_alt, hero_width, hero_height, hero_storage_key, status, sort_order, version, published_at, created_at, updated_at FROM portfolio_projects " +
      whereSql +
      " ORDER BY sort_order, created_at",
  ).bind(...binds).all<ProjectRow>();
  return hydrate(result.results ?? []);
}

function legacyFallback(group?: Project["group"]) {
  return legacyProjects.filter((project) => !group || project.group === group);
}

export async function listPublishedProjects(group?: Project["group"]): Promise<Project[]> {
  try {
    await ensurePortfolioReady();
    const items = group
      ? await queryProjects("WHERE status = 'published' AND project_group = ?", [group])
      : await queryProjects("WHERE status = 'published'");
    return items;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("URL scheme")) {
      console.error("Portfolio database unavailable; using bundled project data.", error);
    }
    return legacyFallback(group);
  }
}

export async function getPublishedProject(slug: string): Promise<Project | undefined> {
  const projects = await listPublishedProjects();
  return projects.find((project) => project.slug === slug);
}

export async function getPublishedProjectRedirect(slug: string): Promise<string | null> {
  try {
    await ensurePortfolioReady();
    const db = await getDatabase();
    const row = await db.prepare(
      "SELECT p.slug FROM portfolio_slug_redirects r JOIN portfolio_projects p ON p.id = r.project_id WHERE r.old_slug = ? AND p.status = 'published' LIMIT 1",
    ).bind(slug).first<{ slug: string }>();
    return row?.slug ?? null;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("URL scheme")) {
      console.error("Unable to resolve portfolio slug redirect.", error);
    }
    return null;
  }
}

export async function getNextPublishedProject(slug: string): Promise<Project> {
  const current = await getPublishedProject(slug);
  if (!current) return legacyProjects[0];
  const group = await listPublishedProjects(current.group);
  const index = group.findIndex((project) => project.slug === slug);
  return group[(index + 1) % group.length] ?? current;
}

export async function listStudioProjects() {
  await ensurePortfolioReady();
  return queryProjects("WHERE status IN ('draft', 'published', 'archived')");
}

export async function getStudioProject(id: string) {
  await ensurePortfolioReady();
  const projects = await queryProjects("WHERE id = ?", [id]);
  return projects[0] ?? null;
}

function validatePayload(input: StudioProjectPayload) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const slug = safeSlug(input.slug);
  const category = typeof input.category === "string" ? input.category.trim().slice(0, 80) : "";
  const year = typeof input.year === "string" ? input.year.trim().slice(0, 20) : "";
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 5000) : "";
  const services = Array.isArray(input.services)
    ? [...new Set(input.services.map((item) => String(item).trim()).filter(Boolean))].slice(0, 12)
    : [];
  const group: Project["group"] = input.group === "music-culture" ? "music-culture" : "commercial";
  const layout: Project["layout"] = input.layout === "right" || input.layout === "wide" ? input.layout : "left";
  const status: ProjectStatus = input.status === "published" || input.status === "archived" ? input.status : "draft";
  const hero = typeof input.hero === "string" ? input.hero.trim() : "";
  const heroAlt = typeof input.heroAlt === "string" ? input.heroAlt.trim().slice(0, 300) : "";
  const heroStorageKey = typeof input.heroStorageKey === "string" && input.heroStorageKey ? input.heroStorageKey : null;
  const heroWidth = positiveInt(input.heroWidth);
  const heroHeight = positiveInt(input.heroHeight);

  if (!title || title.length > 120) throw new StudioRequestError(400, "Add a project title under 120 characters.");
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new StudioRequestError(400, "Use a simple URL slug with letters, numbers and hyphens.");
  if (!category) throw new StudioRequestError(400, "Choose a category.");
  if (!year) throw new StudioRequestError(400, "Add a year.");
  if (services.some((service) => service.length > 80)) throw new StudioRequestError(400, "Keep each service under 80 characters.");
  if (hero && !isAllowedMediaPath(hero)) throw new StudioRequestError(400, "The cover image must come from this site.");
  if (hero.startsWith("/media/") && !heroStorageKey) throw new StudioRequestError(400, "The cover image storage reference is missing.");
  if (heroStorageKey && (!isStudioStorageKey(heroStorageKey) || hero !== "/media/" + heroStorageKey)) {
    throw new StudioRequestError(400, "The cover image reference is invalid.");
  }
  if (hero.startsWith("/projects/") && heroStorageKey) throw new StudioRequestError(400, "The cover image reference is invalid.");

  const gallery = Array.isArray(input.gallery) ? input.gallery.slice(0, 40).map((image, index) => {
    const src = typeof image.src === "string" ? image.src.trim() : "";
    const alt = typeof image.alt === "string" ? image.alt.trim().slice(0, 300) : "";
    const storageKey = typeof image.storageKey === "string" && image.storageKey ? image.storageKey : null;
    if (!src || !isAllowedMediaPath(src)) throw new StudioRequestError(400, "Gallery image " + (index + 1) + " is invalid.");
    if (src.startsWith("/media/") && !storageKey) throw new StudioRequestError(400, "Gallery image " + (index + 1) + " is missing its storage reference.");
    if (storageKey && (!isStudioStorageKey(storageKey) || src !== "/media/" + storageKey)) {
      throw new StudioRequestError(400, "Gallery image " + (index + 1) + " has an invalid storage reference.");
    }
    if (src.startsWith("/projects/") && storageKey) throw new StudioRequestError(400, "Gallery image " + (index + 1) + " has an invalid storage reference.");
    return {
      src,
      alt,
      storageKey,
      width: positiveInt(image.width),
      height: positiveInt(image.height),
    };
  }) : [];

  if (status === "published") {
    if (!description) throw new StudioRequestError(400, "Add a project description before publishing.");
    if (!hero) throw new StudioRequestError(400, "Upload a cover image before publishing.");
    if (!heroAlt) throw new StudioRequestError(400, "Add alt text for the cover image before publishing.");
    if (gallery.some((image) => !image.alt)) throw new StudioRequestError(400, "Add alt text to every gallery image before publishing.");
  }

  return {
    title,
    slug,
    category,
    group,
    year,
    services,
    layout,
    description,
    hero,
    heroAlt,
    heroWidth,
    heroHeight,
    heroStorageKey,
    gallery,
    status,
  };
}

function positiveInt(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1 || numeric > 20000) return 1;
  return Math.round(numeric);
}

function isAllowedMediaPath(src: string) {
  if (isStaticProjectMediaPath(src)) return true;
  if (!src.startsWith("/media/")) return false;
  return isStudioStorageKey(src.slice("/media/".length));
}

async function assertUniqueSlug(slug: string, exceptId?: string) {
  const db = await getDatabase();
  const row = exceptId
    ? await db.prepare("SELECT id FROM portfolio_projects WHERE slug = ? AND id <> ? LIMIT 1").bind(slug, exceptId).first<{ id: string }>()
    : await db.prepare("SELECT id FROM portfolio_projects WHERE slug = ? LIMIT 1").bind(slug).first<{ id: string }>();
  if (row) throw new StudioRequestError(409, "That URL slug is already used by another project.");

  const redirect = await db.prepare("SELECT project_id FROM portfolio_slug_redirects WHERE old_slug = ? LIMIT 1")
    .bind(slug)
    .first<{ project_id: string }>();
  if (redirect && redirect.project_id !== exceptId) {
    throw new StudioRequestError(409, "That URL slug is reserved by an older project URL.");
  }
}

function auditStatement(db: D1Database, actor: ChatGPTUser, action: string, entityId: string | null, details: Record<string, unknown>) {
  return db.prepare("INSERT INTO studio_audit_log (actor_email, actor_user_id, action, entity_type, entity_id, details_json) VALUES (?, ?, ?, 'project', ?, ?)")
    .bind(actor.email.toLowerCase(), actor.userId, action, entityId, JSON.stringify(details));
}

function imageInsertStatements(
  db: D1Database,
  projectId: string,
  gallery: ReturnType<typeof validatePayload>["gallery"],
  requiredVersion?: number,
) {
  return gallery.map((image, index) => {
    const values = [crypto.randomUUID(), projectId, image.src, image.storageKey, image.alt, image.width, image.height, (index + 1) * 10];
    if (requiredVersion === undefined) {
      return db.prepare("INSERT INTO portfolio_images (id, project_id, src, storage_key, alt, width, height, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(...values);
    }
    return db.prepare("INSERT INTO portfolio_images (id, project_id, src, storage_key, alt, width, height, sort_order) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM portfolio_projects WHERE id = ? AND version = ?)")
      .bind(...values, projectId, requiredVersion);
  });
}

function conditionalAuditStatement(
  db: D1Database,
  actor: ChatGPTUser,
  action: string,
  entityId: string,
  details: Record<string, unknown>,
  requiredVersion: number,
) {
  return db.prepare("INSERT INTO studio_audit_log (actor_email, actor_user_id, action, entity_type, entity_id, details_json) SELECT ?, ?, ?, 'project', ?, ? WHERE EXISTS (SELECT 1 FROM portfolio_projects WHERE id = ? AND version = ?)")
    .bind(actor.email.toLowerCase(), actor.userId, action, entityId, JSON.stringify(details), entityId, requiredVersion);
}

function mediaKeys(project: StudioProject | ReturnType<typeof validatePayload>) {
  const keys = new Set<string>();
  if ("heroStorageKey" in project && project.heroStorageKey) keys.add(project.heroStorageKey);
  for (const image of project.gallery) if (image.storageKey) keys.add(image.storageKey);
  return keys;
}

async function assertMediaKeysAvailable(project: ReturnType<typeof validatePayload>, projectId?: string) {
  const keys = [...mediaKeys(project)];
  if (!keys.length) return;
  const db = await getDatabase();
  const placeholders = keys.map(() => "?").join(",");
  const result = await db.prepare(
    "SELECT storage_key, attached_project_id FROM portfolio_media WHERE storage_key IN (" + placeholders + ")",
  ).bind(...keys).all<{ storage_key: string; attached_project_id: string | null }>();
  const rows = new Map((result.results ?? []).map((row) => [row.storage_key, row.attached_project_id]));
  for (const key of keys) {
    if (!rows.has(key)) throw new StudioRequestError(409, "One of the uploaded images is no longer available. Upload it again.");
    const attachedProjectId = rows.get(key);
    if (attachedProjectId && attachedProjectId !== projectId) {
      throw new StudioRequestError(409, "One of the uploaded images already belongs to another project.");
    }
  }
}

export async function createStudioProject(input: StudioProjectPayload, actor: ChatGPTUser) {
  await ensurePortfolioReady();
  const data = validatePayload(input);
  await assertUniqueSlug(data.slug);
  await assertMediaKeysAvailable(data);
  const db = await getDatabase();
  const max = await db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS value FROM portfolio_projects WHERE project_group = ?")
    .bind(data.group)
    .first<{ value: number }>();
  const id = crypto.randomUUID();
  const sortOrder = (Number(max?.value) || 0) + 10;
  const statements: D1PreparedStatement[] = [
    db.prepare("INSERT INTO portfolio_projects (id, slug, title, category, project_group, year, services_json, layout, description, hero_src, hero_alt, hero_width, hero_height, hero_storage_key, status, sort_order, version, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)")
      .bind(id, data.slug, data.title, data.category, data.group, data.year, JSON.stringify(data.services), data.layout, data.description, data.hero, data.heroAlt, data.heroWidth, data.heroHeight, data.heroStorageKey, data.status, sortOrder, data.status),
    ...imageInsertStatements(db, id, data.gallery),
  ];
  for (const key of mediaKeys(data)) {
    statements.push(db.prepare("UPDATE portfolio_media SET attached_project_id = ?, updated_at = CURRENT_TIMESTAMP WHERE storage_key = ?").bind(id, key));
  }
  statements.push(auditStatement(db, actor, "create", id, { slug: data.slug, status: data.status }));
  await db.batch(statements);
  return getStudioProject(id);
}

export async function updateStudioProject(id: string, input: StudioProjectPayload, actor: ChatGPTUser) {
  await ensurePortfolioReady();
  const existing = await getStudioProject(id);
  if (!existing) throw new StudioRequestError(404, "Project not found.");
  if (Number(input.version) !== existing.version) throw new StudioRequestError(409, "This project changed in another tab. Reload before saving again.");
  const data = validatePayload(input);
  await assertUniqueSlug(data.slug, id);
  await assertMediaKeysAvailable(data, id);
  const db = await getDatabase();
  const nextVersion = existing.version + 1;

  let sortOrder = existing.sortOrder;
  if (data.group !== existing.group || (existing.status === "archived" && data.status !== "archived")) {
    const max = await db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS value FROM portfolio_projects WHERE project_group = ? AND id <> ?")
      .bind(data.group, id)
      .first<{ value: number }>();
    sortOrder = (Number(max?.value) || 0) + 10;
  }

  const statements: D1PreparedStatement[] = [
    db.prepare("UPDATE portfolio_projects SET slug = ?, title = ?, category = ?, project_group = ?, year = ?, services_json = ?, layout = ?, description = ?, hero_src = ?, hero_alt = ?, hero_width = ?, hero_height = ?, hero_storage_key = ?, status = ?, sort_order = ?, version = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, CURRENT_TIMESTAMP) ELSE published_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND version = ?")
      .bind(data.slug, data.title, data.category, data.group, data.year, JSON.stringify(data.services), data.layout, data.description, data.hero, data.heroAlt, data.heroWidth, data.heroHeight, data.heroStorageKey, data.status, sortOrder, nextVersion, data.status, id, existing.version),
    db.prepare("DELETE FROM portfolio_images WHERE project_id = ? AND EXISTS (SELECT 1 FROM portfolio_projects WHERE id = ? AND version = ?)")
      .bind(id, id, nextVersion),
    ...imageInsertStatements(db, id, data.gallery, nextVersion),
  ];

  if (data.slug !== existing.slug) {
    statements.push(
      db.prepare("DELETE FROM portfolio_slug_redirects WHERE old_slug = ? AND project_id = ? AND EXISTS (SELECT 1 FROM portfolio_projects WHERE id = ? AND version = ?)")
        .bind(data.slug, id, id, nextVersion),
      db.prepare("INSERT OR REPLACE INTO portfolio_slug_redirects (old_slug, project_id, created_at) SELECT ?, ?, CURRENT_TIMESTAMP WHERE EXISTS (SELECT 1 FROM portfolio_projects WHERE id = ? AND version = ?)")
        .bind(existing.slug, id, id, nextVersion),
    );
  }

  const previousKeys = mediaKeys(existing);
  const nextKeys = mediaKeys(data);
  const removedStorageKeys = [...previousKeys].filter((key) => !nextKeys.has(key));
  for (const key of nextKeys) {
    statements.push(
      db.prepare("UPDATE portfolio_media SET attached_project_id = ?, updated_at = CURRENT_TIMESTAMP WHERE storage_key = ? AND EXISTS (SELECT 1 FROM portfolio_projects WHERE id = ? AND version = ?)")
        .bind(id, key, id, nextVersion),
    );
  }
  for (const key of removedStorageKeys) {
    statements.push(
      db.prepare("UPDATE portfolio_media SET attached_project_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE storage_key = ? AND attached_project_id = ? AND EXISTS (SELECT 1 FROM portfolio_projects WHERE id = ? AND version = ?)")
        .bind(key, id, id, nextVersion),
    );
  }
  statements.push(conditionalAuditStatement(db, actor, "update", id, { slug: data.slug, status: data.status, version: nextVersion }, nextVersion));

  const results = await db.batch(statements);
  const updateResult = results[0] as D1Result;
  if (!updateResult.success || Number(updateResult.meta?.changes ?? 0) !== 1) {
    throw new StudioRequestError(409, "This project changed before the save completed. Reload and try again.");
  }
  return { project: await getStudioProject(id), removedStorageKeys };
}

export async function archiveStudioProject(id: string, version: number, actor: ChatGPTUser) {
  await ensurePortfolioReady();
  const existing = await getStudioProject(id);
  if (!existing) throw new StudioRequestError(404, "Project not found.");
  if (version !== existing.version) throw new StudioRequestError(409, "This project changed in another tab. Reload before archiving.");
  const db = await getDatabase();
  const nextVersion = existing.version + 1;
  const result = await db.batch([
    db.prepare("UPDATE portfolio_projects SET status = 'archived', version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND version = ?").bind(nextVersion, id, version),
    conditionalAuditStatement(db, actor, "archive", id, { slug: existing.slug }, nextVersion),
  ]);
  const updateResult = result[0] as D1Result;
  if (!updateResult.success || Number(updateResult.meta?.changes ?? 0) !== 1) {
    throw new StudioRequestError(409, "This project changed before the archive completed.");
  }
  return getStudioProject(id);
}

export async function reorderStudioProjects(group: Project["group"], ids: string[], actor: ChatGPTUser) {
  await ensurePortfolioReady();
  if (!Array.isArray(ids) || ids.length > 100 || new Set(ids).size !== ids.length) throw new StudioRequestError(400, "Invalid project order.");
  const current = (await listStudioProjects()).filter((project) => project.group === group && project.status !== "archived");
  const expected = new Set(current.map((project) => project.id));
  if (ids.length !== expected.size || ids.some((id) => !expected.has(id))) {
    throw new StudioRequestError(409, "The project list changed. Reload before reordering.");
  }
  const db = await getDatabase();
  const statements = ids.map((id, index) =>
    db.prepare("UPDATE portfolio_projects SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_group = ?")
      .bind((index + 1) * 10, id, group),
  );
  statements.push(auditStatement(db, actor, "reorder", null, { group, ids }));
  await db.batch(statements);
  return listStudioProjects();
}
