ALTER TABLE "accounts" ADD COLUMN "target_amount_cents" integer;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "target_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "monthly_budget_cents" integer;