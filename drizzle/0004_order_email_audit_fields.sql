ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "receipt_email_sent_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "payment_instructions_email_sent_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "status_email_sent_at" timestamp with time zone;
