import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-new';
import { useToast } from '@/hooks/use-toast';

const INTERNAL_FIELDS = [
  'item', 'ddd', 'numero', 'nome', 'custoFlutuante', 'custoReal', 'conta', 'tipo', 'whatsapp', 'description'
];

// Helpers para normalização
function stripDiacritics(s: string) {
  // fallback sem \p{Diacritic} para compatibilidade de target TS
  try {
    return s?.normalize?.('NFD').replace(/[\u0300-\u036f]/g, '') ?? s;
  } catch (e) {
    return s;
  }
}

function normalizeHeader(h: string) {
  if (h === undefined || h === null) return '';
  return stripDiacritics(String(h))
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function mapKey(normalizedHeader: string) {
  switch (normalizedHeader) {
    case 'ITEM': return 'item';
    case 'DDD': return 'ddd';
    case 'NUMERO':
    case 'NUMERO ':
    case 'NUMERO': return 'numero';
    case 'NOME': return 'nome';
    case 'CUSTO FLUTUANTE': return 'custoFlutuante';
    case 'CUSTO REAL': return 'custoReal';
    case 'CONTA': return 'conta';
    case 'TIPO': return 'tipo';
    case 'WHATSAPP': return 'whatsapp';
    default: return null;
  }
}

function normalizeValue(v: any) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const upper = s.toUpperCase();
  if (upper === '#N/D' || upper === 'N/D' || upper === 'NA' || upper === 'N/A') return null;
  return s;
}

export function ExcelImportPreview({ onDone }: { onDone?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string,string>>({});
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const detectDefaultMapping = (rawHeaders: string[]) => {
    const m: Record<string,string> = {};
    rawHeaders.forEach(h => {
      const norm = normalizeHeader(h as string);
      const key = mapKey(norm);
      m[h] = key ?? '';
    });
    return m;
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })[0] || [];
  const rawHeaders = Array.isArray(headerRow) ? headerRow.map(String) : [];
  setHeaders(rawHeaders);
  // Mostrar apenas 3 linhas no preview para foco visual
  setPreviewRows(rawRows.slice(0, 3));
  };

  // Load saved mapping for this user (if any) when headers or user change
  useEffect(() => {
    if (!headers || headers.length === 0) return;
    const key = user ? `excel_import_mapping_${user.id}` : null;
    if (key) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          // ensure parsed keys match current headers
          const ok = Object.keys(parsed).length > 0;
          if (ok) {
            setMapping(parsed);
            return;
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    // fallback: detect default mapping
    setMapping(detectDefaultMapping(headers));
  }, [headers, user]);

  // Persist mapping per user when it changes
  useEffect(() => {
    if (!user) return;
    try {
      const key = `excel_import_mapping_${user.id}`;
      localStorage.setItem(key, JSON.stringify(mapping || {}));
    } catch (e) {
      // ignore storage errors
    }
  }, [mapping, user]);

  const buildNormalized = (rows: any[]) => {
    const out: any[] = [];
    for (const row of rows) {
      const norm: any = {};
      for (const entry of Object.entries(mapping)) {
        const rawHeader = entry[0];
        const field = entry[1] as string;
        if (!field) continue;
        const rawVal = (row as any)[rawHeader] ?? (row as any)[rawHeader.toUpperCase()] ?? (row as any)[rawHeader.toLowerCase()] ?? '';
        const v = normalizeValue(rawVal);
        if (field === 'whatsapp') {
          let w = '';
          if (typeof v === 'string' && v.includes('wa.me')) {
            const m = v.match(/wa\.me\/(\d+)/);
            if (m) w = m[1];
          } else if (v) {
            w = String(v).replace(/[^0-9]/g, '');
          }
          norm.hasWhatsapp = !!w;
          norm.whatsappNumber = w || '';
        } else {
          // definir dinamicamente a propriedade segura
          (norm as any)[field] = v;
        }
      }

      const dddDigits = String(norm.ddd ?? '').replace(/\D/g, '');
      const numeroDigits = String(norm.numero ?? '').replace(/\D/g, '');

      // Skip rows without a valid numero
      if (!numeroDigits) continue;

      out.push({
        item: norm.item ?? '',
        ddd: dddDigits || null,
        numero: numeroDigits,
        nome: norm.nome ?? '',
        custoFlutuante: norm.custoFlutuante ?? null,
        custoReal: norm.custoReal ?? null,
        conta: norm.conta ?? null,
        tipo: norm.tipo ?? null,
        hasWhatsapp: norm.hasWhatsapp ?? false,
        whatsappNumber: norm.whatsappNumber ?? '',
        description: norm.description ?? ''
      });
    }

    return out;
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const normalized = buildNormalized(rawRows);
      // chama a API de import e valida a resposta antes de usar
      let res: any;
      try {
        res = await api.importLinesFromExcelData(normalized);
      } catch (apiErr) {
        console.error('Erro ao chamar API de importação:', apiErr);
        throw new Error((apiErr as any)?.message || 'Erro de comunicação com o servidor durante a importação');
      }

      // validação mínima do formato de resposta
      if (!res || typeof res !== 'object') {
        console.error('Resposta de importação inesperada:', res);
        throw new Error('Resposta de importação inesperada. Verifique os logs do servidor.');
      }

      const importedCount = typeof res.imported === 'number' ? res.imported : (res.importedCount ?? res.imported ?? 0);
      toast({ title: 'Importação concluída', description: `${importedCount} importadas` });
      onDone && onDone();
    } catch (err) {
      console.error('Falha na importação de Excel:', err);
      toast({ title: 'Erro', description: (err as any)?.message ?? 'Falha na importação. Verifique o console ou logs do servidor.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          id="excel-file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
        />
        <div className="text-sm text-neutral-600">{fileName}</div>
      </div>

      {headers.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Colunas detectadas:</div>
          <div className="flex flex-wrap gap-2">
            {headers.map(h => (
              <div key={h} className="px-3 py-1 bg-neutral-100 rounded">{h}</div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {headers.map(h => (
              <div key={`map-${h}`} className="space-y-1">
                <Label>{h}</Label>
                <Select value={mapping[h] ?? ''} onValueChange={(v) => setMapping(prev => ({ ...prev, [h]: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- ignore --</SelectItem>
                    {INTERNAL_FIELDS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium">Preview (primeiras 3 linhas):</div>
              <div className="bg-neutral-50 p-3 rounded text-xs overflow-auto">
                <pre className="m-0 font-mono text-sm">{JSON.stringify(buildNormalized(previewRows.slice(0,3)), null, 2)}</pre>
              </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setHeaders([]); setPreviewRows([]); setFileName(''); }}>
              Limpar
            </Button>
            <Button onClick={() => {
              const input = document.getElementById('excel-file-input') as HTMLInputElement | null;
              handleImport(input && input.files ? input.files[0] : null);
            }} disabled={loading || headers.length === 0}>
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelImportPreview;
