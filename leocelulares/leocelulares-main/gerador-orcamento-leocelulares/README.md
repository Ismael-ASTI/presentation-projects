# Gerador de Orcamentos da Leo Celulares

Ferramenta auxiliar para criar propostas comerciais em PDF e DOCX, com interface web e geracao pelo terminal.

## Uso

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm start
```

Acesse `http://localhost:3030` no navegador.

Para usar a CLI interativa:

```bash
npm run gerar
```

O modelo fixo da HB Medicinal fica disponivel em:

```bash
npm run gerar:hb
```

## Recursos

- Preenchimento de cliente, servico, escopo e valores.
- Calculo de subtotais e descontos.
- Exportacao em PDF e DOCX.
- Modelo especifico para a HB Medicinal.

## Arquivos principais

- `index.html`: interface web.
- `gerar-orcamento-cli.js`: fluxo interativo no terminal.
- `generate-orcamento-hb.js`: modelo fixo.
- `media`: logos e arquivos de apoio.

Revise os documentos gerados antes de enviar e nao publique informacoes de clientes no GitHub.
