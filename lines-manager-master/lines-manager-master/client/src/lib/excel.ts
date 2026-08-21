import * as XLSX from 'xlsx';
import { api } from './api-new';

export interface ExcelImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates?: number;
}

export class ExcelService {
  static async exportLines(): Promise<void> {
    try {
      const blob = await api.exportLinesToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `linhas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error(`Erro ao exportar linhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static async importLines(file: File): Promise<ExcelImportResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      // Normalize columns from template to internal fields
      const normalized = (json as any[]).map(row => {
        // Accept uppercase headers from template
        const item = row['ITEM'] ?? row['item'] ?? row['Item'] ?? '';
        const ddd = String(row['DDD'] ?? row['ddd'] ?? '');
  const numero = String((row['NUMERO'] ?? row['numero'] ?? row['Numero'] ?? row['NUMERO']) || '');
        const nome = String(row['NOME'] ?? row['nome'] ?? row['Nome'] ?? '');
        const custoFlutuante = row['CUSTO FLUTUANTE'] ?? row['CUSTO FLUTUANTE'] ?? row['CUSTO_FLUTUANTE'] ?? '';
        const custoReal = row['CUSTO REAL'] ?? row['CUSTO_REAL'] ?? '';
        const conta = row['CONTA'] ?? '';
        const tipo = row['TIPO'] ?? row['tipo'] ?? '';
        const whatsappRaw = row['WHATSAPP'] ?? row['Whatsapp'] ?? row['whatsapp'] ?? '';

        // Extract numeric whatsapp number if full wa.me link provided
        let whatsappNumber = '';
        if (typeof whatsappRaw === 'string' && whatsappRaw.includes('wa.me')) {
          const m = whatsappRaw.match(/wa\.me\/(\d+)/);
          if (m) whatsappNumber = m[1];
        } else {
          whatsappNumber = String(whatsappRaw || '');
        }

        return {
          item,
          ddd,
          numero,
          nome,
          custoFlutuante,
          custoReal,
          conta,
          tipo,
          hasWhatsapp: !!whatsappNumber,
          whatsappNumber,
          description: row['OBS'] ?? row['DESCRIPTION'] ?? row['description'] ?? ''
        };
      });

      const result = await api.importLinesFromExcelData(normalized);
      return {
        success: true,
        imported: result.success ? result.imported : result.imported || 0,
        errors: result.errors || []
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Erro ao importar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
      };
    }
  }

  static downloadTemplate(): void {
    const templateData = [
      {
        'ITEM': '364',
        'DDD': '62',
        'NUMERO': '996447703',
        'NOME': 'AILSON FERREIRA DE OLIVEIRA',
        'CUSTO FLUTUANTE': 'TROCA DE POSTES - CPFL RS',
        'CUSTO REAL': 'TROCA DE POSTES - CPFL RS',
        'CONTA': '335640117',
        'TIPO': 'VIVO',
        'WHATSAPP': 'https://wa.me/5562996447703',
      },
      {
        'ITEM': '250',
        'DDD': '62',
        'NUMERO': '998238341',
        'NOME': 'TALIANE TATIANE GOMES DE OLIVEIRA',
        'CUSTO FLUTUANTE': 'SOT AT RIO - ENEL RJ',
        'CUSTO REAL': 'SOT AT RIO - ENEL RJ',
        'CONTA': '402818783',
        'TIPO': 'VIVO',
        'WHATSAPP': 'https://wa.me/5562998238341',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Set column widths
    const colWidths = [
      { wch: 8 },  // ITEM
      { wch: 8 },  // DDD
      { wch: 15 }, // NUMERO
      { wch: 30 }, // NOME
      { wch: 35 }, // CUSTO FLUTUANTE
      { wch: 35 }, // CUSTO REAL
      { wch: 15 }, // CONTA
      { wch: 15 }, // TIPO
      { wch: 30 }, // WHATSAPP
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'template_linhas.xlsx');
  }
}
