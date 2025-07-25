CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`icon` text,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `categories_family_idx` ON `categories` (`family_id`);--> statement-breakpoint
CREATE INDEX `categories_type_idx` ON `categories` (`type`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`create_by` text NOT NULL,
	`category_id` text,
	`description` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`type` text NOT NULL,
	`transaction_date` integer NOT NULL,
	`is_paid` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`create_by`) REFERENCES `family_members`(`email`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `transactions_family_id_idx` ON `transactions` (`family_id`);--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transactions` (`transaction_date`);--> statement-breakpoint
CREATE INDEX `family_members_family_id_idx` ON `family_members` (`family_id`);--> statement-breakpoint
CREATE INDEX `family_members_clerk_user_id_idx` ON `family_members` (`clerk_user_id`);