ALTER TABLE "lines" ADD COLUMN "has_whatsapp" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "lines" ADD COLUMN "whatsapp_number" varchar(20);