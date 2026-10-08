CREATE TABLE `portfolio_slug_redirects` (
	`old_slug` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `portfolio_slug_redirects_project_idx` ON `portfolio_slug_redirects` (`project_id`);
