# HS Hair Vitamin

Landing page da HS Hair Vitamin, criada para apresentar o produto, seus beneficios e os canais de contato da marca. A interface foi feita para funcionar bem em telas pequenas e grandes, com foco em leitura e conversao.

## Stack

- React 19
- TypeScript
- Vite
- CSS e componentes proprios

## Desenvolvimento

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev
```

O Vite mostra no terminal o endereco local da aplicacao.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: verifica os tipos e gera a build de producao.
- `npm run lint`: executa o ESLint.
- `npm run preview`: abre a build localmente.

## Estrutura

- `src`: componentes, paginas e estilos da landing page.
- `public`: imagens e arquivos estaticos.
- `netlify.toml`: configuracao de deploy na Netlify.

## Deploy

Execute `npm run build` e publique a pasta `dist` em um provedor de sites estaticos. O projeto ja inclui configuracao para Netlify.
