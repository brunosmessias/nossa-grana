DROP INDEX `transactions_date_idx`;--> statement-breakpoint
CREATE INDEX `family_date_idx` ON `transactions` (`family_id`,`transaction_date`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "family_id", "name", "color", "icon", "type", "created_at") SELECT "id", "family_id", "name", "color", "icon", "type", "created_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `categories_family_idx` ON `categories` (`family_id`);--> statement-breakpoint
CREATE INDEX `categories_type_idx` ON `categories` (`type`);