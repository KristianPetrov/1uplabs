CREATE TABLE IF NOT EXISTS "shop_settings" (
	"id" text PRIMARY KEY NOT NULL DEFAULT 'default',
	"flat_shipping_cents" integer NOT NULL DEFAULT 1000,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "shop_settings" ("id", "flat_shipping_cents") VALUES ('default', 1000)
ON CONFLICT ("id") DO NOTHING;
