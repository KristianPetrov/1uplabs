CREATE TABLE IF NOT EXISTS "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"discount_type" text DEFAULT 'none' NOT NULL,
	"percent_off" integer,
	"amount_off_cents" integer,
	"shipping_mode" text DEFAULT 'none' NOT NULL,
	"shipping_amount_off_cents" integer,
	"product_slugs" text[] DEFAULT '{}'::text[] NOT NULL,
	"min_subtotal_cents" integer DEFAULT 0 NOT NULL,
	"max_discount_cents" integer,
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"per_customer_limit" integer,
	"first_order_only" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code"),
	CONSTRAINT "promo_codes_discount_type_check" CHECK ("discount_type" IN ('none', 'percent', 'fixed')),
	CONSTRAINT "promo_codes_shipping_mode_check" CHECK ("shipping_mode" IN ('none', 'free', 'fixed')),
	CONSTRAINT "promo_codes_percent_check" CHECK ("discount_type" <> 'percent' OR ("percent_off" BETWEEN 1 AND 100)),
	CONSTRAINT "promo_codes_amount_check" CHECK ("discount_type" <> 'fixed' OR ("amount_off_cents" > 0)),
	CONSTRAINT "promo_codes_shipping_amount_check" CHECK ("shipping_mode" <> 'fixed' OR ("shipping_amount_off_cents" > 0)),
	CONSTRAINT "promo_codes_has_benefit_check" CHECK ("discount_type" <> 'none' OR "shipping_mode" <> 'none'),
	CONSTRAINT "promo_codes_used_count_check" CHECK ("used_count" >= 0),
	CONSTRAINT "promo_codes_min_subtotal_check" CHECK ("min_subtotal_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promo_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"email" text NOT NULL,
	"merchandise_discount_cents" integer DEFAULT 0 NOT NULL,
	"shipping_discount_cents" integer DEFAULT 0 NOT NULL,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_redemptions_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'promo_redemptions_promo_code_id_promo_codes_id_fk'
	) THEN
		ALTER TABLE "promo_redemptions"
			ADD CONSTRAINT "promo_redemptions_promo_code_id_promo_codes_id_fk"
			FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE RESTRICT;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'promo_redemptions_order_id_orders_id_fk'
	) THEN
		ALTER TABLE "promo_redemptions"
			ADD CONSTRAINT "promo_redemptions_order_id_orders_id_fk"
			FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_redemptions_code_email_idx" ON "promo_redemptions" ("promo_code_id", "email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_email_idx" ON "orders" ("email");
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_cents" integer;
--> statement-breakpoint
UPDATE "orders"
SET "shipping_cents" = GREATEST(0, "total_cents" - "subtotal_cents")
WHERE "shipping_cents" IS NULL;
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping_cents" SET DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping_cents" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_cents" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_discount_cents" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promo_code" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promo_code_id" uuid;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'orders_promo_code_id_promo_codes_id_fk'
	) THEN
		ALTER TABLE "orders"
			ADD CONSTRAINT "orders_promo_code_id_promo_codes_id_fk"
			FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL;
	END IF;
END $$;
