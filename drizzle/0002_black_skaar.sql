CREATE TABLE `portfolio_slug_redirects` (
	`old_slug` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `portfolio_slug_redirects_project_idx` ON `portfolio_slug_redirects` (`project_id`);

[executed on device: Yotam-Laptop (7ef219fe-97fc-4bd5-88b6-788de1804c9f)]