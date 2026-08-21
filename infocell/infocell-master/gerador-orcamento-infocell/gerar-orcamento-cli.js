#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
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

const companyInfo = {
  company: 'InfoCell',
  whatsapp: '+55 62 8200-9594',
  email: 'contato@infocell.com.br',
};

async function promptForProposal() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'proposalNumber',
      message: 'Número da proposta (ex: ORC-2026-0610-02):',
      default: `ORC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
    },
    {
      type: 'input',
      name: 'clientName',
      message: 'Nome do cliente:',
      default: 'João Silva',
    },
    {
      type: 'input',
      name: 'serviceTitle',
      message: 'Título do serviço:',
      default: 'Assistência técnica em celulares e reparos de bancada',
    },
    {
      type: 'input',
      name: 'serviceDescription',
      message: 'Descrição breve do serviço:',
      default: 'Proposta comercial para manutenção de celulares, troca de componentes e ajustes técnicos em dispositivos móveis.',
    },
    {
      type: 'input',
      name: 'value',
      message: 'Valor fechado (ex: 550,00):',
      default: '550,00',
    },
    {
      type: 'input',
      name: 'pixValue',
      message: 'Valor Pix especial (ex: 550,00):',
      default: '550,00',
    },
    {
      type: 'confirm',
      name: 'addScope',
      message: 'Deseja adicionar itens de escopo customizados?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'addIncludes',
      message: 'Deseja adicionar itens inclusos customizados?',
      default: false,
    },
  ]);

  let scope = [
    'Avaliação técnica inicial do aparelho e identificação de falhas.',
    'Desmontagem controlada com ferramentas adequadas.',
    'Troca de componente aprovado (tela, bateria, conector ou similar).',
    'Limpeza técnica interna e revisão de conectores.',
    'Testes de funcionamento de toque, carga, áudio e câmera.',
    'Atualização e validação final do sistema quando necessário.',
    'Entrega com orientações de uso e conservação.',
  ];

  if (answers.addScope) {
    const scopeAnswers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'scopeText',
        message: 'Edite os itens de escopo (um por linha):',
        default: scope.join('\n'),
      },
    ]);
    scope = scopeAnswers.scopeText.split('\n').filter((item) => item.trim());
  }

  let includes = [
    'Atendimento técnico especializado.',
    'Mão de obra e testes completos do reparo.',
    'Validação final antes da entrega.',
    'Orientação de uso e cuidados pós-serviço.',
    'Cortesia: aplicação de película ou limpeza técnica básica, quando aplicável, sem custo adicional.',
  ];

  if (answers.addIncludes) {
    const includesAnswers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'includesText',
        message: 'Edite os itens inclusos (um por linha):',
        default: includes.join('\n'),
      },
    ]);
    includes = includesAnswers.includesText.split('\n').filter((item) => item.trim());
  }

  return {
    proposalNumber: answers.proposalNumber,
    clientName: answers.clientName,
    serviceTitle: answers.serviceTitle,
    serviceDescription: answers.serviceDescription,
    value: answers.value,
    pixValue: answers.pixValue,
    scope,
    includes,
    date: new Date().toLocaleDateString('pt-BR'),
  };
}

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

async function generateDocx(proposal, logoBuffer, outputPath) {
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
                  new TextRun({ text: companyInfo.company, bold: true, size: 30, color: '1F3A56' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 160 },
                children: [
                  new TextRun({
                    text: `WhatsApp: ${companyInfo.whatsapp}  |  Email: ${companyInfo.email}`,
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
            children: [new TextRun({ text: 'ORÇAMENTO DE SERVIÇO TÉCNICO', bold: true, size: 30 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `Proposta ${proposal.proposalNumber}  |  Emissão: ${proposal.date}`,
                italics: true,
                size: 18,
                color: '4A5568',
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              detailRow('Cliente', proposal.clientName),
              detailRow('Data', proposal.date),
              detailRow('Serviço', proposal.serviceTitle),
            ],
          }),
          sectionTitle('1. Objeto da Proposta'),
          new Paragraph({ text: proposal.serviceDescription, spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED }),
          sectionTitle('2. Escopo'),
          ...proposal.scope.map((item) => makeBulletParagraph(item)),
          sectionTitle('3. Itens Inclusos'),
          ...proposal.includes.map((item) => makeBulletParagraph(item)),
          sectionTitle('4. Investimento'),
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
                          new TextRun({ text: `R$ ${proposal.value}`, bold: true, size: 36, color: '1F3A56' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 90 } }),
          new Paragraph({
            children: [new TextRun({ text: `• Pagamento único: R$ ${proposal.value}.`, bold: false })],
            bullet: { level: 0 },
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `• Condição especial no Pix: R$ ${proposal.pixValue}.`, bold: false })],
            bullet: { level: 0 },
            spacing: { after: 120 },
          }),
          new Paragraph({
            spacing: { before: 180, after: 90 },
            children: [new TextRun({ text: 'Validade da proposta: 7 dias corridos.', italics: true })],
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
  fs.writeFileSync(outputPath, buffer);
}

function generatePdf(proposal, logoBuffer, outputPath) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, right: 55, bottom: 50, left: 55 },
  });

  doc.pipe(fs.createWriteStream(outputPath));

  doc.rect(0, 0, 595, 210).fill('#F4F7FA');
  doc.image(logoPath, 247, 34, { fit: [96, 96], align: 'center' });
  doc.fillColor('#1F3A56').font('Helvetica-Bold').fontSize(19).text(companyInfo.company, 55, 136, { align: 'center' });
  doc.fillColor('#111111').font('Helvetica').fontSize(9.5).text(
    `WhatsApp: ${companyInfo.whatsapp} | Email: ${companyInfo.email}`,
    55,
    160,
    { align: 'center' }
  );
  doc.font('Helvetica').fontSize(9.5).text(`Proposta ${proposal.proposalNumber} | Emissão: ${proposal.date}`, 55, 176, {
    align: 'center',
  });

  doc.moveTo(55, 202).lineTo(540, 202).lineWidth(1.6).strokeColor('#1F3A56').stroke();

  doc.fillColor('#111111').font('Helvetica-Bold').fontSize(16).text('ORÇAMENTO DE SERVIÇO TÉCNICO', 55, 220, { align: 'center' });

  doc.roundedRect(55, 254, 485, 96, 4).lineWidth(1).strokeColor('#C8D1DB').stroke();
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1F3A56').text('Cliente:', 70, 270);
  doc.font('Helvetica').fillColor('#111111').text(proposal.clientName, 130, 270);
  doc.font('Helvetica-Bold').fillColor('#1F3A56').text('Data:', 70, 293);
  doc.font('Helvetica').fillColor('#111111').text(proposal.date, 130, 293);
  doc.font('Helvetica-Bold').fillColor('#1F3A56').text('Serviço:', 70, 316);
  doc.font('Helvetica').fillColor('#111111').text(proposal.serviceTitle, 130, 316, { width: 385 });

  doc.y = 370;
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).text('1. Objeto da Proposta', { underline: true });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10.5).text(proposal.serviceDescription, { align: 'justify' });

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).text('2. Escopo', { underline: true });
  doc.moveDown(0.3);
  proposal.scope.forEach((item) => {
    doc.font('Helvetica').fontSize(10.5).text(`• ${item}`, { align: 'left' });
    doc.moveDown(0.25);
  });

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).text('3. Itens Inclusos', { underline: true });
  doc.moveDown(0.3);
  proposal.includes.forEach((item) => {
    doc.font('Helvetica').fontSize(10.5).text(`• ${item}`, { align: 'left' });
    doc.moveDown(0.25);
  });

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).text('4. Investimento', { underline: true });
  doc.moveDown(0.3);
  doc.roundedRect(55, doc.y + 2, 485, 52, 4).fillAndStroke('#E9F1F8', '#9EB5CC');
  doc.fillColor('#1F3A56').font('Helvetica-Bold').fontSize(10).text('VALOR FECHADO DO SERVIÇO', 70, doc.y + 14);
  doc.fillColor('#1F3A56').font('Helvetica-Bold').fontSize(20).text(`R$ ${proposal.value}`, 360, doc.y + 10, {
    width: 165,
    align: 'right',
  });
  doc.moveDown(3.1);
  doc.fillColor('#111111');
  doc.font('Helvetica').fontSize(10.5).text(`• Pagamento único: R$ ${proposal.value}.`, { align: 'left' });
  doc.moveDown(0.25);
  doc.font('Helvetica').fontSize(10.5).text(`• Condição especial no Pix: R$ ${proposal.pixValue}.`, { align: 'left' });
  doc.moveDown(0.25);
  doc.font('Helvetica-Oblique').fontSize(10).text('Validade da proposta: 7 dias corridos.');

  doc.moveDown(2.8);
  doc.font('Helvetica').fontSize(10).text('____________________________________________', { align: 'center' });
  doc.font('Helvetica-Bold').text('ITS COMPORTS', { align: 'center' });

  doc.end();
}

async function main() {
  console.clear();
  console.log('\n🔧 GERADOR DE ORÇAMENTOS - ITS COMPORTS\n');

  const proposal = await promptForProposal();

  const logoBuffer = fs.readFileSync(logoPath);
  const baseFilename = `orcamento-${proposal.clientName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const outputDocx = path.join(rootDir, `${baseFilename}.docx`);
  const outputPdf = path.join(rootDir, `${baseFilename}.pdf`);

  try {
    await generateDocx(proposal, logoBuffer, outputDocx);
    generatePdf(proposal, logoBuffer, outputPdf);

    console.log('\n✅ Orçamentos gerados com sucesso!\n');
    console.log(`📄 DOCX: ${outputDocx}`);
    console.log(`📕 PDF:  ${outputPdf}\n`);
  } catch (error) {
    console.error('❌ Erro ao gerar orçamentos:', error);
    process.exitCode = 1;
  }
}

main();
