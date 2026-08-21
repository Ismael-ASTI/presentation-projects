# BertzTech Landing

Landing page da BertzTech, desenvolvida para apresentar a empresa, seus serviços e canais de contato em uma experiência responsiva.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI e Lucide React

## Desenvolvimento

Requisitos: Node.js 20 ou superior e pnpm.

```bash
pnpm install
pnpm dev
```

O Vite informa no terminal a URL local da aplicação.

## Scripts

- `pnpm dev`: inicia o ambiente de desenvolvimento.
- `pnpm build`: gera os arquivos de produção.
- `pnpm preview`: serve a build localmente.
- `pnpm check`: executa a verificação de tipos TypeScript.
- `pnpm format`: formata os arquivos do projeto.

## Estrutura

- `client/src`: páginas, componentes e estilos da aplicação.
- `client/public`: arquivos estáticos.
- `patches`: ajustes pontuais aplicados às dependências.
- `netlify.toml`: configuração de publicação na Netlify.

## Deploy

O projeto está preparado para deploy na Netlify. O comando de build é `pnpm build`; a pasta de saída deve seguir a configuração definida em `netlify.toml`.
