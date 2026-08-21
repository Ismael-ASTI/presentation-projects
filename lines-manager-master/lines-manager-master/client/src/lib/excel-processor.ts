import * as XLSX from 'xlsx';

export interface ExcelLineData {
  item?: string;
  ddd?: string;
  numero?: string;
  nome?: string;
  custoFlutuante?: string;
  custoReal?: string;
  tipo?: string;
  telefone?: string;
  whatsapp?: string;
  hasWhatsapp?: boolean;
  observacoes?: string;
  status?: 'ativa' | 'inativa';
  [key: string]: any;
}

export interface ProcessedExcelData {
  validLines: ExcelLineData[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

// Mapear cabeçalhos comuns para campos padrão
const HEADER_MAPPING: Record<string, string> = {
  // Formato padrao - novo formato principal
  'item': 'item',
  'ddd': 'ddd', 
  'numero': 'numero',
  'nome': 'nome',
  'custo flutuante': 'custoFlutuante',
  'custo_flutuante': 'custoFlutuante',
  'custoflutuante': 'custoFlutuante',
  'custo real': 'custoReal',
  'custo_real': 'custoReal',
  'custoreal': 'custoReal',
  'tipo': 'tipo',
  
  // Número da linha (formato antigo)
  'número': 'numero',
  'num': 'numero',
  'linha': 'numero',
  'codigo': 'numero',
  'código': 'numero',
  
  // Nome (formato antigo)
  'nome_linha': 'nome',
  'denominacao': 'nome',
  'denominação': 'nome',
  'descricao': 'nome',
  'descrição': 'nome',
  
  // Origem (formato antigo)
  'origem': 'custoFlutuante',
  'ponto_origem': 'custoFlutuante',
  'inicial': 'custoFlutuante',
  'saida': 'custoFlutuante',
  'partida': 'custoFlutuante',
  
  // Destino (formato antigo)
  'destino': 'custoReal',
  'ponto_destino': 'custoReal',
  'final': 'custoReal',
  'chegada': 'custoReal',
  
  // Telefone
  'telefone': 'telefone',
  'fone': 'telefone',
  'tel': 'telefone',
  'contato': 'telefone',
  
  // WhatsApp
  'whatsapp': 'whatsapp',
  'whats': 'whatsapp',
  'wpp': 'whatsapp',
  'zap': 'whatsapp',
  
  // Status
  'status': 'status',
  'situacao': 'status',
  'situação': 'status',
  'ativo': 'status',
  'estado': 'status',
  
  // Observações
  'observacoes': 'observacoes',
  'observações': 'observacoes',
  'obs': 'observacoes',
  'comentarios': 'observacoes',
  'comentários': 'observacoes',
  'notas': 'observacoes',
  'horario': 'observacoes',
  'horário': 'observacoes'
};

export class ExcelProcessor {
  static async processFile(file: File): Promise<ProcessedExcelData> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON mantendo cabeçalhos originais
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (rawData.length < 2) {
        return {
          validLines: [],
          errors: ['Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados'],
          totalRows: 0,
          validRows: 0
        };
      }

      const headers = rawData[0] as string[];
      const dataRows = rawData.slice(1);
      
      // Mapear cabeçalhos
      const mappedHeaders = this.mapHeaders(headers);
      
      const validLines: ExcelLineData[] = [];
      const errors: string[] = [];
      
      dataRows.forEach((row, index) => {
        const rowNumber = index + 2; // +2 porque começamos da segunda linha e índice é 0-based
        
        try {
          const lineData = this.processRow(row, mappedHeaders, rowNumber);
          if (lineData) {
            validLines.push(lineData);
          }
        } catch (error) {
          errors.push(`Linha ${rowNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      });

      return {
        validLines,
        errors,
        totalRows: dataRows.length,
        validRows: validLines.length
      };
      
    } catch (error) {
      return {
        validLines: [],
        errors: [`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
        totalRows: 0,
        validRows: 0
      };
    }
  }

  private static mapHeaders(headers: string[]): Record<number, string> {
    const mapped: Record<number, string> = {};
    
    headers.forEach((header, index) => {
      if (!header) return;
      
      const normalizedHeader = header.toString().toLowerCase().trim();
      const mappedField = HEADER_MAPPING[normalizedHeader];
      
      if (mappedField) {
        mapped[index] = mappedField;
      } else {
        // Se não encontrou mapeamento direto, tentar busca parcial
        for (const [key, value] of Object.entries(HEADER_MAPPING)) {
          if (normalizedHeader.includes(key) || key.includes(normalizedHeader)) {
            mapped[index] = value;
            break;
          }
        }
      }
    });
    
    return mapped;
  }

  private static processRow(row: any[], mappedHeaders: Record<number, string>, rowNumber: number): ExcelLineData | null {
    const lineData: ExcelLineData = {};
    let hasRequiredData = false;
    
    // Processar cada célula da linha
    row.forEach((cell, index) => {
      const fieldName = mappedHeaders[index];
      if (!fieldName || !cell) return;
      
      const cellValue = cell.toString().trim();
      if (!cellValue) return;
      
      switch (fieldName) {
        case 'item':
          lineData.item = cellValue;
          hasRequiredData = true;
          break;
          
        case 'ddd':
          lineData.ddd = cellValue;
          break;
          
        case 'numero':
          lineData.numero = cellValue;
          hasRequiredData = true;
          // Criar telefone combinando DDD + NUMERO
          if (lineData.ddd) {
            lineData.telefone = `(${lineData.ddd}) ${this.formatPhone(cellValue)}`;
            lineData.whatsapp = `55${lineData.ddd}${cellValue.replace(/\D/g, '')}`;
            lineData.hasWhatsapp = true;
          }
          break;
          
        case 'nome':
          lineData.nome = cellValue;
          hasRequiredData = true;
          break;
          
        case 'custoFlutuante':
          lineData.custoFlutuante = cellValue;
          break;
          
        case 'custoReal':
          lineData.custoReal = cellValue;
          break;
          
        case 'tipo':
          lineData.tipo = cellValue;
          break;
          
        case 'telefone':
          lineData.telefone = this.formatPhone(cellValue);
          break;
          
        case 'whatsapp':
          lineData.whatsapp = this.formatWhatsApp(cellValue);
          lineData.hasWhatsapp = !!lineData.whatsapp;
          break;
          
        case 'status':
          lineData.status = this.parseStatus(cellValue);
          break;
          
        case 'observacoes':
          lineData.observacoes = cellValue;
          break;
          
        default:
          // Campo não mapeado, adicionar como está
          lineData[fieldName] = cellValue;
          break;
      }
    });

    // Verificar se tem dados mínimos necessários
    if (!hasRequiredData) {
      return null; // Linha vazia ou sem dados essenciais
    }

    // Aplicar valores padrão
    lineData.status = lineData.status || 'ativa';
    lineData.hasWhatsapp = !!lineData.whatsapp;
    
    // Para formato padrao, usar custos como origem/destino se necessario
    if (lineData.custoFlutuante && !lineData.origem) {
      lineData.origem = lineData.custoFlutuante;
    }
    if (lineData.custoReal && !lineData.destino) {
      lineData.destino = lineData.custoReal;
    }
    
    // Usar tipo como observação se necessário
    if (lineData.tipo && !lineData.observacoes) {
      lineData.observacoes = `Tipo: ${lineData.tipo}`;
    }

    // Validacoes basicas para formato padrao
    if (!lineData.numero && !lineData.nome && !lineData.item) {
      throw new Error('Linha deve ter pelo menos item, número ou nome');
    }

    return lineData;
  }

  private static formatPhone(phone: string): string {
    // Remove caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Formatar telefone brasileiro
    if (numbers.length === 11) {
      return `(${numbers.substr(0, 2)}) ${numbers.substr(2, 5)}-${numbers.substr(7, 4)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.substr(0, 2)}) ${numbers.substr(2, 4)}-${numbers.substr(6, 4)}`;
    }
    
    return phone; // Retorna como estava se não conseguir formatar
  }

  private static formatWhatsApp(whatsapp: string): string {
    // Remove caracteres não numéricos
    const numbers = whatsapp.replace(/\D/g, '');
    
    // Se não tem código do país, adicionar 55 (Brasil)
    if (numbers.length === 11) {
      return `55${numbers}`;
    } else if (numbers.length === 10) {
      return `55${numbers}`;
    }
    
    return numbers;
  }

  private static parseStatus(status: string): 'ativa' | 'inativa' {
    const normalizedStatus = status.toLowerCase().trim();
    
    const activeValues = ['ativa', 'ativo', 'sim', 'yes', 'true', '1', 'operando', 'funcionando'];
    const inactiveValues = ['inativa', 'inativo', 'não', 'nao', 'no', 'false', '0', 'parada', 'desativada'];
    
    if (activeValues.includes(normalizedStatus)) {
      return 'ativa';
    } else if (inactiveValues.includes(normalizedStatus)) {
      return 'inativa';
    }
    
    // Padrão: ativa
    return 'ativa';
  }

  static generateSampleData(): ExcelLineData[] {
    return [
      {
        item: '364',
        ddd: '62',
        numero: '996447703',
        nome: 'AILSON FERREIRA DE OLIVEIRA',
        custoFlutuante: 'TROCA DE POSTES - CPFL RS',
        custoReal: 'TROCA DE POSTES - CPFL RS',
        tipo: 'VIVO',
        telefone: '(62) 99644-7703',
        whatsapp: '5562996447703',
        hasWhatsapp: true,
        status: 'ativa',
        observacoes: 'Tipo: VIVO'
      },
      {
        item: '150',
        ddd: '62',
        numero: '998233841',
        nome: 'TATIANE ROCHA DE OLIVEIRA',
        custoFlutuante: 'SOT AT RIO - ENEL RJ',
        custoReal: 'SOT AT RIO - ENEL RJ',
        tipo: 'VIVO',
        telefone: '(62) 99823-3841',
        whatsapp: '5562998233841',
        hasWhatsapp: true,
        status: 'ativa',
        observacoes: 'Tipo: VIVO'
      },
      {
        item: '238',
        ddd: '62',
        numero: '999492100',
        nome: 'FELIPE PIVETTA DE CARVALHO',
        custoFlutuante: 'SE LAGOS 500KV NEOENERGIA',
        custoReal: 'SE LAGOS 500KV NEOENERGIA',
        tipo: 'VIVO',
        telefone: '(62) 99949-2100',
        whatsapp: '5562999492100',
        hasWhatsapp: true,
        status: 'ativa',
        observacoes: 'Tipo: VIVO'
      },
      {
        item: '258',
        ddd: '62',
        numero: '996705058',
        nome: 'JOSIEL PEDROSO LIMA',
        custoFlutuante: 'TROCA DE POSTES - CPFL RS',
        custoReal: 'TROCA DE POSTES - CPFL RS',
        tipo: 'VIVO',
        telefone: '(62) 99670-5058',
        whatsapp: '5562996705058',
        hasWhatsapp: true,
        status: 'ativa',
        observacoes: 'Tipo: VIVO'
      }
    ];
  }
}
