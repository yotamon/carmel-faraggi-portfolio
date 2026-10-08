CREATE TABLE `portfolio_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`project_group` text NOT NULL,
	`year` text NOT NULL,
	`services_json` text DEFAULT '[]' NOT NULL,
	`layout` text DEFAULT 'left' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`hero_src` text DEFAULT '' NOT NULL,
	`hero_alt` text DEFAULT '' NOT NULL,
	`hero_width` integer DEFAULT 1 NOT NULL,
	`hero_height` integer DEFAULT 1 NOT NULL,
	`hero_storage_key` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolio_projects_slug_unique` ON `portfolio_projects` (`slug`);
--> statement-breakpoint
CREATE INDEX `portfolio_projects_status_order_idx` ON `portfolio_projects` (`status`, `project_group`, `sort_order`);
--> statement-breakpoint
CREATE TABLE `portfolio_images` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`src` text NOT NULL,
	`storage_key` text,
	`alt` text DEFAULT '' NOT NULL,
	`width` integer DEFAULT 1 NOT NULL,
	`height` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `portfolio_images_project_order_idx` ON `portfolio_images` (`project_id`, `sort_order`);
--> statement-breakpoint
CREATE TABLE `portfolio_media` (
	`storage_key` text PRIMARY KEY NOT NULL,
	`src` text NOT NULL,
	`content_type` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`size_bytes` integer NOT NULL,
	`attached_project_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `portfolio_media_attachment_idx` ON `portfolio_media` (`attached_project_id`, `created_at`);
--> statement-breakpoint
CREATE TABLE `studio_admins` (
	`email` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`display_name` text,
	`role` text DEFAULT 'editor' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `studio_admins_user_id_unique` ON `studio_admins` (`user_id`);
--> statement-breakpoint
CREATE TABLE `studio_audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_email` text NOT NULL,
	`actor_user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`details_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `studio_audit_created_idx` ON `studio_audit_log` (`created_at`);
