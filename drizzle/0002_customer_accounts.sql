ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'customer';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text,
	"phone" text,
	"address_1" text NOT NULL,
	"address_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_addresses_user_id_idx" ON "customer_addresses" ("user_id");--> statement-breakpoint

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders" ("customer_id");--> statement-breakpoint




