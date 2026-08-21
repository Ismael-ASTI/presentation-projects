-- Tabela de usuários
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" varchar(50) NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" varchar(20) NOT NULL DEFAULT 'user',
  "name" text NOT NULL,
  "last_login_at" timestamp,
  "is_online" boolean DEFAULT false,
  "assigned_cost_centers" text[],
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Tabela de linhas
CREATE TABLE IF NOT EXISTS "lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "item" text,
  "ddd" varchar(3),
  "numero" varchar(20) NOT NULL,
  "nome" text NOT NULL,
  "custo_flutuante" text,
  "custo_real" text,
  "conta" text,
  "tipo" text,
  "whatsapp" text,
  "validation_status" varchar(20) DEFAULT 'Pendente',
  "validated_by" text,
  "validation_date" timestamp,
  "code" text NOT NULL,
  "description" text,
  "status" varchar(20) DEFAULT 'Ativa',
  "origin" text NOT NULL,
  "destination" text NOT NULL,
  "route" text NOT NULL,
  "department" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Tabela de logs de atividade
CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES "users"("id"),
  "action" text NOT NULL,
  "entity" text NOT NULL,
  "entity_id" text,
  "details" text,
  "created_at" timestamp DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "idx_lines_numero" ON "lines" ("numero");
CREATE INDEX IF NOT EXISTS "idx_lines_nome" ON "lines" ("nome");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_user_id" ON "activity_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_created_at" ON "activity_logs" ("created_at");
