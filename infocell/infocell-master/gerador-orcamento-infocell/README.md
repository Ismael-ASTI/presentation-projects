# Gerador de Orcamentos do Infocell

Ferramenta auxiliar para montar propostas comerciais em PDF e DOCX. Ela pode ser usada pelo navegador, para preenchimento visual, ou pelo terminal, para um fluxo mais rapido e repetivel.

## Uso

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm start
```

Abra `http://localhost:3030` para usar a interface web.

Para gerar pelo terminal:

```bash
npm run gerar
```

O modelo fixo da HB Medicinal pode ser gerado com:

```bash
npm run gerar:hb
```

## Recursos

- Preview do documento durante o preenchimento.
- Itens com quantidade, valor unitario e subtotal.
- Desconto percentual ou fixo.
- Formas de pagamento e observacoes.
- Exportacao em PDF e DOCX.

## Arquivos

- `index.html`: interface web.
- `gerar-orcamento-cli.js`: gerador interativo.
- `generate-orcamento-hb.js`: modelo da HB Medicinal.
- `media`: logo e recursos usados nos documentos.

Nao inclua propostas com dados reais de clientes no repositorio publico.
