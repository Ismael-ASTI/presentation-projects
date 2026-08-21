CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity" varchar(100),
	"entity_id" uuid,
	"details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"item" text,
	"ddd" varchar(3),
	"numero" varchar(20),
	"nome" varchar(255),
	"custo_flutuante" text,
	"custo_real" text,
	"conta" varchar(50),
	"tipo" varchar(100),
	"code" varchar(50),
	"name" varchar(255),
	"description" text,
	"status" varchar(50) DEFAULT 'Ativa',
	"origin" varchar(100),
	"destination" varchar(100),
	"route" varchar(255),
	"validation_status" varchar(50) DEFAULT 'Pendente',
	"metadata" jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"account_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"is_active" boolean DEFAULT true,
	"email_verified" boolean DEFAULT false,
	"permissions" jsonb DEFAULT '[]',
	"assigned_cost_centers" text[],
	"last_login_at" timestamp,
	"is_online" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
