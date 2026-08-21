import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, Database, FileUp } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { useAuth } from '@/components/auth/auth-provider';
import { api } from '@/lib/api-new';
import { ExcelProcessor, type ProcessedExcelData, type ExcelLineData } from '@/lib/excel-processor';
import * as XLSX from 'xlsx';

export default function ExcelAnalyzer() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number; errors: string[] } | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedExcelData | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [replaceExisting, setReplaceExisting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);
    setProcessedData(null);
    setProcessing(true);

    try {
      // Preview básico do arquivo
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length > 0) {
        const headerRow = data[0] as string[];
        const dataRows = data.slice(1, 6); // Show first 5 rows
        
        setHeaders(headerRow);
        setFileData(dataRows);
      }

      // Processar arquivo para validação
      const processed = await ExcelProcessor.processFile(file);
      setProcessedData(processed);

    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      setProcessedData({
        validLines: [],
        errors: ['Erro ao processar arquivo: ' + (error instanceof Error ? error.message : 'Erro desconhecido')],
        totalRows: 0,
        validRows: 0
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleImportData = async () => {
    if (!processedData || processedData.validLines.length === 0) {
      return;
    }

    setImporting(true);
    setImportResult(null);
    setImportProgress(0);

    try {
      if (replaceExisting) {
        if (!isSuperAdmin) {
          throw new Error('Apenas super admin pode substituir toda a base de linhas.');
        }
        await api.deleteAllLines();
      }
      let imported = 0;
      const errors: string[] = [];

      // Preparar dados para importação em lote
      const linesToImport = processedData.validLines.map(line => ({
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        ddd: line.ddd || '',
        numero: line.numero || line.item || '',
        nome: line.nome || '',
        custoFlutuante: line.custoFlutuante || line.origem || '',
        custoReal: line.custoReal || line.destino || '',
        conta: line.conta || '',
        tipo: line.tipo || '',
        status: line.status || 'ativa',
        // hasWhatsapp: line.hasWhatsapp || !!(line.ddd && line.numero),
        // whatsappNumber: line.whatsapp || (line.ddd && line.numero ? `55${line.ddd}${line.numero.replace(/\D/g, '')}` : ''),
        description: line.observacoes || (line.tipo ? `Tipo: ${line.tipo}` : '')
      }));

      console.log('Enviando para importação em lote:', linesToImport);

      // Usar nova rota de importação em lote
      const response = await fetch('/api/lines/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ lines: linesToImport })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na importação');
      }

      const result = await response.json();
      console.log('Resultado da importação:', result);

      setImportResult({
        success: result.success > 0,
        imported: result.success,
        errors: result.errors || []
      });

    } catch (error) {
      console.error('Erro na importação:', error);
      setImportResult({
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const handleImportSampleData = async () => {
    setImporting(true);
    setImportResult(null);

    try {
      const sampleData = ExcelProcessor.generateSampleData();
      let imported = 0;
      const errors: string[] = [];

      for (const line of sampleData) {
        try {
          await api.createLine({
            organizationId: '550e8400-e29b-41d4-a716-446655440000',
            ddd: line.ddd || '',
            numero: line.numero || line.item || '',
            nome: line.nome || '',
            custoFlutuante: line.custoFlutuante || line.origem || '',
            custoReal: line.custoReal || line.destino || '',
            conta: line.conta || '',
            tipo: line.tipo || '',
            status: line.status || 'ativa',
            // hasWhatsapp: line.hasWhatsapp || !!(line.ddd && line.numero),
            // whatsappNumber: line.whatsapp || (line.ddd && line.numero ? `55${line.ddd}${line.numero.replace(/\D/g, '')}` : ''),
            description: line.observacoes || (line.tipo ? `Tipo: ${line.tipo}` : '')
          });
          imported++;
        } catch (error) {
          errors.push(`Erro ao importar dados de exemplo: ${error instanceof Error ? error.message : 'Erro'}`);
        }
      }

      setImportResult({
        success: imported > 0,
        imported,
        errors
      });

    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Erro ao importar dados de exemplo']
      });
    } finally {
      setImporting(false);
    }
  };

  const clearData = () => {
    setFileData([]);
    setHeaders([]);
    setFileName('');
    setImportResult(null);
    setProcessedData(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      ['ITEM', 'DDD', 'NUMERO', 'NOME', 'CUSTO FLUTUANTE', 'CUSTO REAL', 'TIPO'],
      ['364', '62', '996447703', 'AILSON FERREIRA DE OLIVEIRA', 'TROCA DE POSTES - CPFL RS', 'TROCA DE POSTES - CPFL RS', 'VIVO'],
      ['150', '62', '998233841', 'TATIANE ROCHA DE OLIVEIRA', 'SOT AT RIO - ENEL RJ', 'SOT AT RIO - ENEL RJ', 'VIVO'],
      ['238', '62', '999492100', 'FELIPE PIVETTA DE CARVALHO', 'SE LAGOS 500KV NEOENERGIA', 'SE LAGOS 500KV NEOENERGIA', 'VIVO'],
      ['258', '62', '996705058', 'JOSIEL PEDROSO LIMA', 'TROCA DE POSTES - CPFL RS', 'TROCA DE POSTES - CPFL RS', 'VIVO']
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Linhas');
    XLSX.writeFile(wb, 'template-linhas.xlsx');
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Analisador de Excel" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analisador de Excel</h1>
              <p className="text-muted-foreground">
                Analise e importe dados de arquivos Excel para o sistema
              </p>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Importar Dados de Linhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Importe 4 linhas de exemplo no formato padrao para testar o sistema
                  </p>
                  <Button 
                    onClick={handleImportSampleData}
                    disabled={importing}
                    className="w-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Importar Dados de Exemplo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Template Excel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Baixe um template no formato padrao (ITEM, DDD, NUMERO, NOME, etc.)
                  </p>
                  <Button 
                    onClick={downloadSampleTemplate}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API:</span>
                      <span className="text-green-600">Online</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Banco:</span>
                      <span className="text-green-600">Conectado</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Import:</span>
                      <span className="text-green-600">Disponível</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload e Análise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Upload e Análise de Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="max-w-md"
                    disabled={processing || importing}
                  />
                  <Button variant="outline" onClick={clearData} disabled={processing || importing}>
                    <Upload className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                  {processedData && processedData.validLines.length > 0 && (
                    <div className="ml-auto flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={replaceExisting}
                          onChange={(e) => setReplaceExisting(e.target.checked)}
                          disabled={importing || processing || !isSuperAdmin}
                        />
                        Substituir base atual (apagar todas antes)
                      </label>
                      <Button
                        onClick={handleImportData}
                        disabled={importing || processing}
                      >
                        {importing ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <FileUp className="w-4 h-4 mr-2" />
                            Importar Dados Validos ({processedData.validLines.length})
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {importing && importProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso da importação:</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="w-full" />
                  </div>
                )}

                {processing && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span>Processando arquivo...</span>
                  </div>
                )}

                {processedData && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Resultado do Processamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{processedData.totalRows}</div>
                          <div className="text-sm text-muted-foreground">Total de linhas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{processedData.validRows}</div>
                          <div className="text-sm text-muted-foreground">Linhas válidas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{processedData.errors.length}</div>
                          <div className="text-sm text-muted-foreground">Erros</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {processedData.totalRows > 0 ? Math.round((processedData.validRows / processedData.totalRows) * 100) : 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">Taxa de sucesso</div>
                        </div>
                      </div>

                      {processedData.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-600">Erros encontrados:</h4>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {processedData.errors.map((error, index) => (
                              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {importResult && (
                  <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {importResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <AlertDescription className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                        {importResult.success ? (
                          `Sucesso! ${importResult.imported} linhas importadas.`
                        ) : (
                          `Erro na importação. ${importResult.errors.join(', ')}`
                        )}
                      </AlertDescription>
                    </div>
                    {importResult.errors.length > 0 && importResult.success && (
                      <div className="mt-2 text-sm text-amber-600">
                        Avisos: {importResult.errors.join(', ')}
                      </div>
                    )}
                  </Alert>
                )}

                {headers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Colunas Encontradas:</h3>
                    <div className="flex flex-wrap gap-2">
                      {headers.map((header, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {header}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium">Dados de Exemplo (primeiras 5 linhas):</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map((header, index) => (
                              <TableHead key={index} className="min-w-32">
                                {header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fileData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {headers.map((_, colIndex) => (
                                <TableCell key={colIndex} className="font-mono text-sm">
                                  {row[colIndex] || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {!fileName && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione um arquivo Excel (.xlsx ou .xls) para analisar</p>
                    <p className="text-sm">O arquivo "Linhas Atualizadas.xlsx" está disponível na raiz do projeto</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações sobre formato */}
            <Card>
              <CardHeader>
                <CardTitle>Formato Esperado do Excel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    O sistema pode processar arquivos Excel com diferentes formatos de cabeçalho. Os campos são mapeados automaticamente:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <strong>Campos Obrigatórios:</strong>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• Número da linha (numero, linha, codigo)</li>
                        <li>• Nome da linha (nome, denominacao)</li>
                        <li>• Origem (origem, partida, inicial)</li>
                        <li>• Destino (destino, chegada, final)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Campos Opcionais:</strong>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• Telefone (telefone, fone, contato)</li>
                        <li>• WhatsApp (whatsapp, whats, wpp)</li>
                        <li>• Status (status, situacao, ativo)</li>
                        <li>• Observações (observacoes, obs, horario)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Formatos Aceitos:</strong>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• .xlsx (Excel 2007+)</li>
                        <li>• .xls (Excel 97-2003)</li>
                        <li>• Primeira linha = cabeçalhos</li>
                        <li>• Mapeamento automático de campos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}