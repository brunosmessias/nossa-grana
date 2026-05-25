ALTER TABLE "accounts" ADD COLUMN "icon" text DEFAULT 'wallet' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "color" text DEFAULT '#1866e4' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "icon" text DEFAULT 'tag' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "color" text DEFAULT '#1866e4' NOT NULL;