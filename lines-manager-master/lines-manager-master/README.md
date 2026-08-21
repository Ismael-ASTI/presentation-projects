# Lines Manager

Sistema web para organizar linhas de transporte, usuários e dados operacionais. A aplicação combina um painel React com uma API em Node.js, banco PostgreSQL e atualização de informações em tempo real.

## Principais recursos

- Cadastro e manutenção de linhas de transporte.
- Controle de usuários e autenticação.
- Importação de dados a partir de planilhas Excel.
- Dashboard com informações operacionais.
- Atualização em tempo real entre as sessões conectadas.
- Interface responsiva para desktop e celular.

## Stack

- React 18, TypeScript, Vite e Tailwind CSS no frontend.
- Node.js, Express e TypeScript no backend.
- PostgreSQL com Drizzle ORM.
- WebSocket para sincronização em tempo real.
- Vitest para testes automatizados.
- Railway para deploy e banco de dados em produção.

## Rodando localmente

Requisitos: Node.js 20 ou superior, npm e uma instância PostgreSQL.

```bash
npm install
Copy-Item .env.example .env
```

Preencha `DATABASE_URL` e `JWT_SECRET` no arquivo `.env`. Depois aplique o schema e inicie o ambiente de desenvolvimento:

```bash
npm run db:push
npm run dev
```

A porta usada é definida pela aplicação ou pela variável `PORT`.

## Scripts

- `npm run dev`: inicia o servidor com recarregamento automático.
- `npm run build`: gera o frontend e empacota o servidor.
- `npm start`: executa a build de produção.
- `npm run check`: verifica os tipos TypeScript.
- `npm run test:run`: executa os testes uma vez.
- `npm run test:coverage`: gera o relatório de cobertura.
- `npm run db:generate`: cria migrations do Drizzle.
- `npm run db:migrate`: aplica migrations existentes.
- `npm run db:push`: sincroniza o schema com o banco.
- `npm run db:studio`: abre o Drizzle Studio.

## Estrutura

- `client`: interface React e componentes do painel.
- `server`: API, autenticação, banco e sincronização.
- `shared`: tipos e schema compartilhados entre frontend e backend.
- `tests`: testes automatizados.
- `drizzle`: migrations e configuração relacionada ao banco.
- `docs`: documentação complementar.

## Deploy

O projeto inclui `Dockerfile` e `railway.toml` para deploy na Railway. Em produção, configure as variáveis de ambiente no provedor e execute o comando de build definido no `package.json`.

Não inclua `.env`, credenciais, dumps do banco ou planilhas de clientes no repositório. O arquivo `.env.example` serve apenas como referência das variáveis necessárias.
