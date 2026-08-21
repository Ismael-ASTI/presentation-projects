# Relatorio tecnico do sistema - Line Manager

Data da analise: 2026-05-31
Escopo: frontend, backend, rotas, seguranca de acesso, estrutura de banco e documentacao.

## 1. Resumo executivo

O projeto esta funcional para uso em producao com deploy no Railway e possui arquitetura full-stack consistente:
- Frontend React com roteamento protegido e modulos por area.
- Backend Express com autenticacao JWT e controle de permissoes por perfil.
- Persistencia PostgreSQL com Drizzle e migracoes.
- Suporte a importacao Excel e atualizacao em tempo real via WebSocket.

Ajustes aplicados nesta revisao:
- Remocao de referencias de marca STN no codigo ativo.
- Padronizacao de nome para Line Manager.
- Remocao de credenciais hardcoded do fallback de login.
- Parametrizacao de admin por variaveis de ambiente.
- Limpeza de documentacao raiz (arquivos md vazios removidos).

## 2. Inventario de funcionalidades

### 2.1 Frontend

1. Login
- Arquivo: client/src/pages/login.tsx
- Objetivo: autenticar usuario e iniciar sessao.
- Estado: funcional, rota protegida no App.

2. Dashboard
- Arquivo: client/src/pages/dashboard.tsx
- Objetivo: mostrar indicadores de linhas, usuarios, status e atividade recente.
- Estado: funcional, com fallback de dados mock se API indisponivel.

3. Gerenciamento de linhas
- Arquivo: client/src/pages/lines.tsx
- Objetivo: CRUD de linhas, filtros, busca, selecao em lote, validacao em lote e acoes de contato.
- Estado: funcional, com chamadas para API e tratamento de erro.

4. Administracao de usuarios
- Arquivo: client/src/pages/admin.tsx
- Objetivo: CRUD de usuarios, perfis, backup/import local e leitura de logs.
- Estado: funcional, exige permissao admin/super_admin.

5. Analisador de Excel
- Arquivo: client/src/pages/excel-analyzer.tsx
- Objetivo: preview, validacao e importacao em lote de planilhas.
- Estado: funcional, usa parser dedicado e rota de importacao em lote.

6. Navegacao e permissao visual
- Arquivo: client/src/components/layout/sidebar.tsx
- Objetivo: exibir menus por permissao do usuario.
- Estado: funcional.

### 2.2 Backend API

Base principal: server/routes.ts

Rotas principais mapeadas:
- GET /api/health
- GET /api/test
- POST /api/test-line
- POST /api/migrate/whatsapp
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/auth/verify
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/lines
- GET /api/lines/:id
- POST /api/lines/bulk-import
- POST /api/lines
- PUT /api/lines/:id
- DELETE /api/lines/:id
- DELETE /api/lines
- POST /api/lines/bulk-delete
- POST /api/lines/bulk-validate
- GET /api/logs
- GET /api/backup
- POST /api/restore
- GET /api/dashboard/stats
- GET /api/activity-logs
- GET /api/system/status
- POST /api/admin/execute-sql

Justificativa geral:
- O conjunto cobre operacao diaria (linhas), governanca (usuarios/permissoes), observabilidade (logs/stats), continuidade (backup/restore) e operacao assistida (execute-sql para super_admin).

### 2.3 Banco de dados

Arquivos base:
- shared/schema.ts
- server/schema.ts
- server/migrations/0000_dazzling_hydra.sql
- server/migrations/0001_shallow_hawkeye.sql
- server/migrations/0002_multi_tenant.sql

Entidades principais:
- users
- lines
- activity_logs
- organizations
- subscriptions
- usage_metrics
- user_invitations

Justificativa:
- O modelo suporta multi-tenant e crescimento por organizacao/plano.
- Linhas e usuarios estao ligados a organization_id para isolamento logico.

## 3. Acesso administrador

Pergunta respondida: "o acesso admin e meu nome?"

Resultado da analise de codigo:
- Antes desta revisao, existiam valores hardcoded com identidade pessoal.
- Agora, o seed/fallback foi ajustado para valores genericos por variavel de ambiente:
  - ADMIN_EMAIL (padrao: admin@linemanager.com)
  - ADMIN_NAME (padrao: System Administrator)
  - DEFAULT_ADMIN_PASSWORD (seed local)
  - FALLBACK_ADMIN_PASSWORD (uso emergencial com flag explicita)

Importante:
- Nao foi feita leitura direta do banco de producao nesta sessao (sem acesso direto a credenciais de banco neste ambiente).
- Portanto, o usuario admin atualmente salvo no banco de producao pode ser conferido com consulta SQL no Railway ou pela tela Admin.

## 4. Validacao de configuracao e ligacoes

1. Ligacao Frontend -> API
- Evidencia: chamadas em client/src/lib/api-new.ts e paginas.
- Status: ok.

2. Ligacao API -> PostgreSQL
- Evidencia: server/database.ts e modulos database-storage.
- Status: ok.

3. JWT e autenticacao
- Evidencia: middlewares e rotas auth em server/routes.ts.
- Status: ok, com melhoria aplicada para evitar fallback hardcoded.

4. Real-time
- Evidencia: WebSocket em server/routes.ts + hook client/src/hooks/use-realtime-sync.ts.
- Status: ok.

5. Deploy
- Evidencia: Dockerfile + railway.toml.
- Status: ok, deploy validado por voce no Railway.

## 5. Riscos observados e recomendacoes

1. Risco medio: fallback de login em producao
- Arquivo: server/railway-hotfix.ts
- Situacao: ainda existe por design emergencial, mas agora depende de variaveis e flag explicita.
- Recomendacao: manter ENABLE_PRODUCTION_FALLBACK_LOGIN desativado (false) em operacao normal.

2. Risco medio: rota de SQL administrativo
- Arquivo: server/routes.ts
- Situacao: protegida para super_admin e bloqueada em producao por padrao.
- Recomendacao: manter ALLOW_RAW_SQL=false e habilitar so em janela controlada.

3. Risco medio: organizationId fixo em alguns fluxos de importacao/form
- Arquivos: client/src/pages/lines.tsx, client/src/pages/excel-analyzer.tsx
- Recomendacao: evoluir para organizationId vindo da sessao/token.

## 6. Limpeza de documentacao

Foi identificado que os arquivos md da raiz (exceto README.md) estavam vazios e foram removidos.

Resultado final da raiz:
- Mantido: README.md
- Removidos: todos os .md vazios
- Novo: docs/relatorio-sistema.md e docs/relatorio-funcionalidades.json

## 7. Conclusao

O sistema esta pronto para distribuicao como produto generico de gerenciamento de linhas sem vinculo de marca STN no codigo ativo. A estrutura esta coerente, as areas principais estao implementadas e os fluxos de deploy/autenticacao foram endurecidos para reduzir risco operacional.
