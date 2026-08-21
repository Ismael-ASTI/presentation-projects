const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require('docx');

const rootDir = __dirname;
const logoPath = path.join(rootDir, 'media', 'logo.jpg');
const outputDocx = path.join(rootDir, 'orcamento-hb-medicinal-oficial.docx');
const outputPdf = path.join(rootDir, 'orcamento-hb-medicinal-oficial.pdf');

const proposal = {
  company: 'ITS COMPORTS',
  whatsapp: '(62) 99627-0693',
  email: 'ismaelthoma0016@gmail.com',
  proposalNumber: 'ORC-2026-0610-01',
  client: 'HB Medicinal / HB Treinamentos',
  title: 'ORCAMENTO DE SERVICO TECNICO',
  date: '10/06/2026',
  value: 'R$ 550,00',
  pixValue: 'R$ 550,00',
  validity: 'x dias corridos',
  service: 'Reestruturacao de acessos Microsoft / OneDrive e organizacao de arquivos corporativos',
  intro:
    'Proposta comercial para reorganizacao de contas corporativas, backup preventivo de arquivos e reconfiguracao de ambiente OneDrive nas estacoes atendidas.',
  scope: [
    'Levantamento do ambiente atual e validacao das maquinas com acesso administrativo.',
    'Backup local preventivo dos arquivos sincronizados antes das alteracoes.',
    'Verificacao do status de sincronizacao do OneDrive em cada equipamento.',
    'Remocao das contas compartilhadas atualmente utilizadas nas estacoes.',
    'Configuracao de contas individuais conforme a estrutura definida pelo cliente.',
    'Reorganizacao e validacao de pastas para acesso local e em nuvem.',
    'Teste final de acesso e sincronizacao nas maquinas do escopo.',
  ],
  environment: [
    '5 computadores no escritorio principal.',
    '1 computador em escritorio separado.',
    '1 computador na sala de raio-x.',
  ],
  includes: [
    'Atendimento tecnico presencial.',
    'Configuracao das 7 maquinas previstas neste escopo.',
    'Validacao final do ambiente reorganizado.',
    'Orientacao rapida de uso ao responsavel.',
  ],
  courtesy: [
    'Limpeza profunda preventiva incluindo troca de pasta termica e troca de bateria da BIOS, quando identificado no atendimento, sem custo adicional.',
  ],
  excludes: [
    'Licencas Microsoft 365, OneDrive ou outros servicos de terceiros.',
    'Recuperacao avancada de arquivos excluidos antes do inicio do servico.',
    'Suporte recorrente apos a conclusao desta proposta.',
    'Atendimento a maquinas adicionais fora do escopo informado.',
  ],
  payment: [
    'Pagamento unico: R$ 550,00.',
    'Chave PIX: 064.837.491-20',
  ],
};

function makeBulletParagraph(text, options = {}) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: options.after ?? 120 },
  });
}

function sectionTitle(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
      }),
    ],
    spacing: { before: 220, after: 120 },
    border: {
      bottom: {
        color: '1F3A56',
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

function detailRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        shading: { fill: 'EDF2F7' },
        width: { size: 28, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 72, type: WidthType.PERCENTAGE },
        children: [new Paragraph(value)],
      }),
    ],
  });
}

async function generateDocx() {
  const logoBuffer = fs.readFileSync(logoPath);

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: { width: 95, height: 95 },
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: proposal.company, bold: true, size: 30, color: '1F3A56' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 160 },
                children: [
                  new TextRun({
                    text: `WhatsApp: ${proposal.whatsapp}  |  Email: ${proposal.email}`,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Documento comercial emitido pela ITS COMPORTS.', size: 16 })],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 320, after: 70 },
            children: [new TextRun({ text: proposal.title, bold: true, size: 30 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `Proposta ${proposal.proposalNumber}  |  Emissao: ${proposal.date}`,
                italics: true,
                size: 18,
                color: '4A5568',
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              detailRow('Cliente', proposal.client),
              detailRow('Data', proposal.date),
              detailRow('Servico', proposal.service),
            ],
          }),
          sectionTitle('1. Objeto da Proposta'),
          new Paragraph({ text: proposal.intro, spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED }),
          sectionTitle('2. Escopo do Atendimento'),
          ...proposal.scope.map((item) => makeBulletParagraph(item)),
          sectionTitle('3. Ambiente Contemplado'),
          ...proposal.environment.map((item) => makeBulletParagraph(item)),
          new Paragraph({
            spacing: { after: 140 },
            children: [new TextRun({ text: 'Total previsto: 7 computadores.', bold: true })],
          }),
          sectionTitle('4. Itens Inclusos'),
          ...proposal.includes.map((item) => makeBulletParagraph(item)),
          sectionTitle('5. Bonus de Cortesia (Sem Custo)'),
          ...proposal.courtesy.map((item) => makeBulletParagraph(item)),
          sectionTitle('6. Itens Nao Inclusos'),
          ...proposal.excludes.map((item) => makeBulletParagraph(item)),
          sectionTitle('7. Investimento'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: '1F3A56' },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'INVESTIMENTO TOTAL', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({ text: proposal.value, bold: true, size: 36, color: '1F3A56' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 90 } }),
          ...proposal.payment.map((item) => makeBulletParagraph(item)),
          new Paragraph({
            spacing: { before: 180, after: 90 },
            children: [new TextRun({ text: `Validade da proposta: ${proposal.validity}.`, italics: true })],
          }),
          new Paragraph({
            spacing: { before: 440, after: 40 },
            alignment: AlignmentType.CENTER,
            children: [new TextRun('____________________________________________')],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'ITS COMPORTS', bold: true })],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputDocx, buffer);
}

function drawSectionTitle(doc, text) {
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).text(text, { underline: true });
  doc.moveDown(0.3);
}

function drawBullets(doc, items) {
  items.forEach((item) => {
    doc.font('Helvetica').fontSize(10.5).text(`• ${item}`, { align: 'left' });
    doc.moveDown(0.25);
  });
}

function generatePdf() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, right: 55, bottom: 50, left: 55 },
  });

  doc.pipe(fs.createWriteStream(outputPdf));

  doc.rect(0, 0, 595, 210).fill('#F4F7FA');
  doc.image(logoPath, 247, 34, { fit: [96, 96], align: 'center' });
  doc.fillColor('#1F3A56').font('Helvetica-Bold').fontSize(19).text(proposal.company, 55, 136, { align: 'center' });
  doc.fillColor('#111111').font('Helvetica').fontSize(9.5).text(
    `WhatsApp: ${proposal.whatsapp} | Email: ${proposal.email}`,
    55,
    160,
    { align: 'center' }
  );
  doc.font('Helvetica').fontSize(9.5).text(`Proposta ${proposal.proposalNumber} | Emissao: ${proposal.date}`, 55, 176, {
    align: 'center',
  });

  doc.moveTo(55, 202).lineTo(540, 202).lineWidth(1.6).strokeColor('#1F3A56').stroke();

  doc.fillColor('#111111').font('Helvetica-Bold').fontSize(16).text(proposal.title, 55, 220, { align: 'center' });

  doc.roundedRect(55, 254, 485, 96, 4).lineWidth(1).strokeColor('#C8D1DB').stroke();
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1F3A56').text('Cliente:', 70, 270);
  doc.font('Helvetica').fillColor('#111111').text(proposal.client, 130, 270);
  doc.font('Helvetica-Bold').fillColor('#1F3A56').text('Data:', 70, 293);
  doc.font('Helvetica').fillColor('#111111').text(proposal.date, 130, 293);
  doc.font('Helvetica-Bold').fillColor('#1F3A56').text('Servico:', 70, 316);
  doc.font('Helvetica').fillColor('#111111').text(proposal.service, 130, 316, { width: 385 });

  doc.y = 370;
  drawSectionTitle(doc, '1. Objeto da Proposta');
  doc.font('Helvetica').fontSize(10.5).text(proposal.intro, { align: 'justify' });

  drawSectionTitle(doc, '2. Escopo do Atendimento');
  drawBullets(doc, proposal.scope);

  drawSectionTitle(doc, '3. Ambiente Contemplado');
  drawBullets(doc, proposal.environment);
  doc.font('Helvetica-Bold').fontSize(10.5).text('Total previsto: 7 computadores.');

  drawSectionTitle(doc, '4. Itens Inclusos');
  drawBullets(doc, proposal.includes);

  drawSectionTitle(doc, '5. Bonus de Cortesia (Sem Custo)');
  drawBullets(doc, proposal.courtesy);

  drawSectionTitle(doc, '6. Itens Nao Inclusos');
  drawBullets(doc, proposal.excludes);

  drawSectionTitle(doc, '7. Investimento');
  doc.roundedRect(55, doc.y + 2, 485, 52, 4).fillAndStroke('#E9F1F8', '#9EB5CC');
  doc.fillColor('#1F3A56').font('Helvetica-Bold').fontSize(10).text('VALOR FECHADO DO SERVICO', 70, doc.y + 14);
  doc.fillColor('#1F3A56').font('Helvetica-Bold').fontSize(20).text(proposal.value, 360, doc.y + 10, {
    width: 165,
    align: 'right',
  });
  doc.moveDown(3.1);
  doc.fillColor('#111111');
  drawBullets(doc, proposal.payment);
  doc.font('Helvetica-Oblique').fontSize(10).text(`Validade da proposta: ${proposal.validity}.`);

  doc.moveDown(2.8);
  doc.font('Helvetica').fontSize(10).text('____________________________________________', { align: 'center' });
  doc.font('Helvetica-Bold').text('ITS COMPORTS', { align: 'center' });

  doc.end();
}

async function main() {
  await generateDocx();
  generatePdf();
  console.log('Arquivos gerados com sucesso:');
  console.log(outputDocx);
  console.log(outputPdf);
}

main().catch((error) => {
  console.error('Falha ao gerar documentos:', error);
  process.exitCode = 1;
});