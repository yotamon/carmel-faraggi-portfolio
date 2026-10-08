import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contactSubmissions = sqliteTable("contact_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  interest: text("interest").notNull(),
  project: text("project").notNull(),
  submissionKey: text("submission_key").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const studioEventCounts = sqliteTable("studio_event_counts", {
  eventDay: text("event_day").notNull(),
  eventKey: text("event_key").notNull(),
  eventPath: text("event_path").notNull(),
  eventCount: integer("event_count").notNull().default(0),
});

export const studioSocialLinks = sqliteTable("studio_social_links", {
  linkKey: text("link_key").primaryKey(),
  linkUrl: text("link_url").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const studioCovers = sqliteTable("studio_covers", {
  id: text("id").primaryKey(),
  src: text("src").notNull().unique(),
  alt: text("alt").notNull(),
  width: integer("width").notNull(),
  storageKey: text("storage_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: integer("visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const studioContactState = sqliteTable("studio_contact_state", {
  submissionId: integer("submission_id").primaryKey(),
  status: text("status").notNull().default("new"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const portfolioProjects = sqliteTable("portfolio_projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  projectGroup: text("project_group").notNull(),
  year: text("year").notNull(),
  servicesJson: text("services_json").notNull().default("[]"),
  layout: text("layout").notNull().default("left"),
  description: text("description").notNull().default(""),
  heroSrc: text("hero_src").notNull().default(""),
  heroAlt: text("hero_alt").notNull().default(""),
  heroWidth: integer("hero_width").notNull().default(1),
  heroHeight: integer("hero_height").notNull().default(1),
  heroStorageKey: text("hero_storage_key"),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  version: integer("version").notNull().default(1),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("portfolio_projects_status_order_idx").on(table.status, table.projectGroup, table.sortOrder),
]);

export const portfolioSlugRedirects = sqliteTable("portfolio_slug_redirects", {
  oldSlug: text("old_slug").primaryKey(),
  projectId: text("project_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("portfolio_slug_redirects_project_idx").on(table.projectId),
]);

export const portfolioImages = sqliteTable("portfolio_images", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  src: text("src").notNull(),
  storageKey: text("storage_key"),
  alt: text("alt").notNull().default(""),
  width: integer("width").notNull().default(1),
  height: integer("height").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("portfolio_images_project_order_idx").on(table.projectId, table.sortOrder),
]);

export const portfolioGalleryCaptions = sqliteTable("portfolio_gallery_captions", {
  projectId: text("project_id").notNull(),
  sortOrder: integer("sort_order").notNull(),
  caption: text("caption").notNull(),
});

export const portfolioMedia = sqliteTable("portfolio_media", {
  storageKey: text("storage_key").primaryKey(),
  src: text("src").notNull(),
  contentType: text("content_type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  attachedProjectId: text("attached_project_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("portfolio_media_attachment_idx").on(table.attachedProjectId, table.createdAt),
]);

export const studioAdmins = sqliteTable("studio_admins", {
  email: text("email").primaryKey(),
  userId: text("user_id").unique(),
  displayName: text("display_name"),
  role: text("role").notNull().default("editor"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at"),
});

export const studioAuditLog = sqliteTable("studio_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorEmail: text("actor_email").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  detailsJson: text("details_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("studio_audit_created_idx").on(table.createdAt),
]);
