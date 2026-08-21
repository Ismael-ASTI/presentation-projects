# Gerador de Orcamentos

Ferramenta da ITS COMPORTS para criar propostas comerciais em PDF e DOCX. O projeto oferece uma interface web para uso no navegador e uma CLI interativa para gerar documentos pelo terminal.

## O que faz

- Preenche dados do cliente, servico, valores e formas de pagamento.
- Calcula subtotais e descontos.
- Permite salvar rascunhos no navegador.
- Gera PDF e DOCX a partir dos dados informados.
- Mantem um modelo especifico para a HB Medicinal.

## Requisitos

Node.js 20 ou superior e npm.

## Instalacao

```bash
npm install
```

## Uso

Para abrir a versao web, inicie um servidor local:

```bash
npm start
```

Depois acesse `http://localhost:3030`.

Para gerar uma proposta pelo terminal:

```bash
npm run gerar
```

Para gerar o modelo da HB Medicinal:

```bash
npm run gerar:hb
```

Os documentos gerados sao salvos na pasta do projeto. Antes de publicar o repositorio, confira se nenhum documento com dados reais de clientes foi incluido no commit.

## Arquivos principais

- `index.html`: interface web do gerador.
- `gerar-orcamento-cli.js`: fluxo interativo no terminal.
- `generate-orcamento-hb.js`: geracao do modelo fixo da HB Medicinal.
- `media`: logos e arquivos usados nos documentos.
