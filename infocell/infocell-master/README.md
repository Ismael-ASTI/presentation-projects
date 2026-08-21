# Infocell

Aplicacao web para a presenca digital de uma assistencia tecnica e loja de celulares. O projeto foi construido com Next.js e reune uma interface comercial, navegacao responsiva e componentes interativos para apresentar servicos e produtos.

## Stack

- Next.js 16 com App Router
- React 19 e TypeScript
- Tailwind CSS
- Framer Motion para animacoes
- Lucide React e tsParticles para elementos visuais

## Rodando localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev
```

A aplicacao fica disponivel em `http://localhost:3000`.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versao de producao.
- `npm run start`: executa a versao gerada.
- `npm run lint`: verifica padroes e possiveis problemas no codigo.

## Estrutura

- `src/app`: paginas, layout e estilos globais do App Router.
- `src/components`: componentes reutilizaveis da interface.
- `src/lib`: funcoes e configuracoes compartilhadas.
- `public`: imagens e arquivos estaticos.
- `gerador-orcamento-infocell`: ferramenta separada para gerar propostas comerciais.

## Deploy

O projeto possui configuracao para deploy em plataformas compativeis com Next.js. Antes do deploy, execute `npm run build` e configure no provedor as variaveis de ambiente exigidas pelo codigo, caso existam.

## Observacoes

O gerador de orcamento e um projeto auxiliar e pode ser usado de forma independente. Ele nao precisa ser executado para iniciar o site principal.
