-- ================================================
-- SCRIPT: Multi-Tenant Database Schema Enhancement
-- Descrição: Melhorias para isolamento completo de dados
-- Data: Agosto 2025
-- ================================================

-- 1. Tabela de organizações/empresas clientes
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL, -- para subdomain
  domain varchar(255), -- domínio personalizado
  logo_url text,
  theme_config jsonb DEFAULT '{}',
  billing_config jsonb DEFAULT '{}',
  plan varchar(50) DEFAULT 'starter',
  max_users integer DEFAULT 5,
  max_lines integer DEFAULT 1000,
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  trial_ends_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 2. Tabela de assinaturas/billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  plan varchar(50) NOT NULL,
  status varchar(50) DEFAULT 'active', -- active, cancelled, past_due, trialing
  current_period_start timestamp NOT NULL,
  current_period_end timestamp NOT NULL,
  amount_cents integer NOT NULL,
  currency varchar(3) DEFAULT 'BRL',
  payment_method jsonb,
  stripe_subscription_id varchar(255),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 3. Tabela de usage metrics (para billing por uso)
CREATE TABLE IF NOT EXISTS usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  metric_type varchar(50) NOT NULL, -- 'users', 'lines', 'api_calls'
  value integer NOT NULL,
  recorded_at timestamp DEFAULT now(),
  period_start timestamp NOT NULL,
  period_end timestamp NOT NULL
);

-- 4. Tabela de convites de usuários
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  role varchar(50) DEFAULT 'user',
  invited_by uuid REFERENCES users(id),
  token varchar(255) UNIQUE NOT NULL,
  expires_at timestamp NOT NULL,
  accepted_at timestamp,
  created_at timestamp DEFAULT now()
);

-- 5. RLS (Row Level Security) policies para isolamento
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy para users: só podem ver da mesma organização
CREATE POLICY users_isolation ON users
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Policy para lines: só podem ver da mesma organização  
CREATE POLICY lines_isolation ON lines
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Policy para activity_logs: só podem ver da mesma organização
CREATE POLICY activity_logs_isolation ON activity_logs
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = activity_logs.user_id 
    AND users.organization_id = current_setting('app.current_organization_id')::uuid
  ));

-- 6. Função para verificar limites do plano
CREATE OR REPLACE FUNCTION check_plan_limits(org_id uuid, resource_type varchar)
RETURNS boolean AS $$
DECLARE
  org_plan varchar;
  current_count integer;
  max_allowed integer;
BEGIN
  -- Buscar o plano da organização
  SELECT plan INTO org_plan FROM organizations WHERE id = org_id;
  
  IF resource_type = 'users' THEN
    SELECT COUNT(*) INTO current_count FROM users WHERE organization_id = org_id;
    SELECT max_users INTO max_allowed FROM organizations WHERE id = org_id;
  ELSIF resource_type = 'lines' THEN
    SELECT COUNT(*) INTO current_count FROM lines WHERE organization_id = org_id;
    SELECT max_lines INTO max_allowed FROM organizations WHERE id = org_id;
  END IF;
  
  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para validar limites antes de inserção
CREATE OR REPLACE FUNCTION validate_plan_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'users' THEN
    IF NOT check_plan_limits(NEW.organization_id, 'users') THEN
      RAISE EXCEPTION 'Plan limit exceeded for users. Upgrade your plan.';
    END IF;
  ELSIF TG_TABLE_NAME = 'lines' THEN
    IF NOT check_plan_limits(NEW.organization_id, 'lines') THEN
      RAISE EXCEPTION 'Plan limit exceeded for lines. Upgrade your plan.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER users_plan_limit_check
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION validate_plan_limits();

CREATE TRIGGER lines_plan_limit_check
  BEFORE INSERT ON lines  
  FOR EACH ROW EXECUTE FUNCTION validate_plan_limits();

-- 8. Dados iniciais para organizacao padrao
INSERT INTO organizations (
  id,
  name,
  slug,
  plan,
  max_users,
  max_lines,
  features,
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Line Manager Organization',
  'line-manager-organization',
  'enterprise',
  999,
  999999,
  '["whatsapp", "backup", "api", "custom_reports", "sso"]',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  plan = EXCLUDED.plan,
  max_users = EXCLUDED.max_users,
  max_lines = EXCLUDED.max_lines,
  features = EXCLUDED.features,
  updated_at = now();

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_org_period ON usage_metrics(organization_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_lines_org_id ON lines(organization_id);

-- 10. Views para métricas de billing
CREATE OR REPLACE VIEW organization_usage AS
SELECT 
  o.id,
  o.name,
  o.plan,
  o.max_users,
  o.max_lines,
  (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND is_active = true) as current_users,
  (SELECT COUNT(*) FROM lines WHERE organization_id = o.id) as current_lines,
  ROUND(
    (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND is_active = true)::float / o.max_users * 100, 
    2
  ) as users_usage_percent,
  ROUND(
    (SELECT COUNT(*) FROM lines WHERE organization_id = o.id)::float / o.max_lines * 100, 
    2
  ) as lines_usage_percent
FROM organizations o
WHERE o.is_active = true;
