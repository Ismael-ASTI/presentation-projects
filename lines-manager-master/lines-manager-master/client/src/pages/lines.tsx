import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import { Sidebar } from '../components/layout/sidebar';
import { TopBar } from '../components/layout/topbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge'; 
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Search, Phone, MessageCircle, Plus, Edit, Trash2, Save, X, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api-new';
import { useAuth } from '../components/auth/auth-provider';
import { useToast } from '../hooks/use-toast';
import { useRealTimeSync } from '../hooks/use-realtime-sync';
import type { Line } from '../types';
import { LineForm } from '../components/lines/line-form-new';
import ExcelImportPreview from '../components/lines/excel-import-preview';

// Removido mock local: operação somente via API/DB

interface LineFormData {
  organizationId?: string;
  ddd?: string;
  numero: string;
  nome: string;
  origin: string;
  destination: string;
  // telefone removido do schema; usar description para observações/contato
  hasWhatsapp: boolean;
  whatsappNumber: string;
  description: string;
  status: 'ativa' | 'inativa' | string;
}

export default function LinesPage() {
  // sidebar sempre expandida: margem fixa aplicada ao conteúdo
  const [lines, setLines] = useState<Line[]>([]);
  const [filteredLines, setFilteredLines] = useState<Line[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ativa' | 'inativa'>('all');
  const [dddFilter, setDddFilter] = useState<string>('all');
  const [custoFilter, setCustoFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const isSuperAdmin = user?.role === 'super_admin';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState<Record<string, boolean>>({});
  const [showBulkValidateDialog, setShowBulkValidateDialog] = useState(false);
  const [bulkValidationStatus, setBulkValidationStatus] = useState<string>('');
  const { toast } = useToast();
  const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
  
  // Hook para sincronização em tempo real
  const { lastUpdate, forceRefresh } = useRealTimeSync();

  // Normaliza valores de status para correspondência consistente
  const normalizeStatus = (s: any) => {
    if (!s && s !== 0) return '';
    const str = String(s).toLowerCase().trim();
    if (str === 'ativa' || str === 'active' || str.startsWith('a')) return 'ativa';
    if (str === 'inativa' || str === 'inactive' || str.startsWith('i')) return 'inativa';
    return str;
  };

  const displayStatus = (s: any) => {
    const n = normalizeStatus(s);
    if (!n) return String(s || '');
    return n.charAt(0).toUpperCase() + n.slice(1);
  };

  // Form state
  const [formData, setFormData] = useState<LineFormData>({
    organizationId: '550e8400-e29b-41d4-a716-446655440000',
    ddd: '',
    numero: '',
    nome: '',
    origin: '',
    destination: '',
    hasWhatsapp: false,
    whatsappNumber: '',
    description: '',
    status: 'ativa'
  });

  useEffect(() => {
    loadLines();
  }, []);

  // Filtrar linhas baseado nos filtros ativos
  const applyFilters = () => {
    let filtered = lines;

    // Filtro por texto
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(line =>
        (line.numero ?? '').toLowerCase().includes(q) ||
        (line.nome ?? '').toLowerCase().includes(q) ||
        (line.origin ?? '').toLowerCase().includes(q) ||
        (line.destination ?? '').toLowerCase().includes(q) ||
        (line.conta ?? '').toLowerCase().includes(q) ||
        (line.tipo ?? '').toLowerCase().includes(q) ||
        (String(line.custoFlutuante || '').toLowerCase().includes(q)) ||
        (String(line.custoReal || '').toLowerCase().includes(q))
      );
    }

    // Filtro por status (usa normalização consistente)
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(line => normalizeStatus(line.status) === selectedStatus);
    }

    // Filtro por DDD
    if (dddFilter && dddFilter !== 'all') {
      filtered = filtered.filter(line => String(line.ddd || '').trim() === dddFilter);
    }

    // Filtro por custo
    if (custoFilter !== 'all') {
      filtered = filtered.filter(line => {
        const key = String(line.custoFlutuante ?? line.custoReal ?? 'Sem Custo').trim();
        return key === custoFilter;
      });
    }

    setFilteredLines(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [lines, searchTerm, selectedStatus, dddFilter, custoFilter]);

  // Opções de DDD para o filtro
  const dddOptions = Array.from(new Set(lines.map(l => String(l.ddd || '').trim())))
    .filter(s => s !== '')
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));

  // Opções deduplicadas de custo flutuante para o select do formulário
  const custoOptions = Array.from(new Set(lines.map(l => String(l.custoFlutuante ?? l.custoReal ?? 'Sem Custo'))))
    .map(s => s.trim())
    .filter(s => s !== '')
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));

  const loadLines = async () => {
    try {
      setLoading(true);
  const response = await api.getLines();
  setLines(response.lines || []);
    } catch (error) {
  console.warn('Erro ao carregar linhas da API:', error);
  toast({ title: 'Erro', description: 'Falha ao carregar linhas do servidor.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const setItemLoadingFor = (id: string, v: boolean) => setItemLoading(s => ({ ...s, [id]: v }));

  const renderValidationBadge = (status?: string) => {
    if (!status) return null;
    const s = String(status).toLowerCase();
    const cls = s.includes('valid') ? 'bg-green-100 text-green-800' : s.includes('rej') ? 'bg-red-100 text-red-800' : s.includes('pend') ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
    return (
      <Badge className={cls}>{status}</Badge>
    );
  };

  const resetForm = () => {
    setFormData({
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      ddd: '',
      numero: '',
      nome: '',
      origin: '',
      destination: '',
      hasWhatsapp: false,
      whatsappNumber: '',
      description: '',
      status: 'ativa'
    });
  };

  const handleCreateLine = async () => {
    // kept for backward compatibility; prefer using LineForm submit
  };

  const handleCreateLineFromForm = async (data: any) => {
    try {
      const payload = { ...data, organizationId: data.organizationId || '550e8400-e29b-41d4-a716-446655440000' };
      const newLine = await api.createLine(payload);
      setLines([...lines, newLine]);
      setShowCreateModal(false);
      resetForm();
      toast({ title: 'Sucesso', description: 'Linha criada com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao criar linha.', variant: 'destructive' });
    }
  };

  const handleEditLine = async () => {
    // legacy handler kept; prefer LineForm submit handler
  };

  const handleEditLineFromForm = async (data: any) => {
    if (!editingLine) return;
    try {
      const updatedLine = await api.updateLine(editingLine.id, data);
      setLines(lines.map(line => line.id === editingLine.id ? updatedLine : line));
      setEditingLine(null);
      resetForm();
      toast({ title: 'Sucesso', description: 'Linha atualizada com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar linha.', variant: 'destructive' });
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    try {
      await api.deleteLine(lineId);
      setLines(lines.filter(line => line.id !== lineId));
      toast({
        title: "Sucesso",
        description: "Linha excluída com sucesso!"
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir linha.', variant: 'destructive' });
    }
  };

  const handleDeleteAllLines = async () => {
    try {
      setIsBulkLoading(true);
      await api.deleteAllLines();
      await loadLines();
      setSelectedIds({});
      setSelectAll(false);
      toast({
        title: 'Sucesso',
        description: 'Todas as linhas foram excluídas com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as any)?.message || 'Falha ao excluir todas as linhas.',
        variant: 'destructive'
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const startEdit = (line: Line) => {
    setEditingLine(line);
    setFormData({
      organizationId: line.organizationId,
      ddd: line.ddd || '',
      numero: line.numero || '',
      nome: line.nome || '',
      origin: line.origin || '',
      destination: line.destination || '',
      hasWhatsapp: !!line.hasWhatsapp,
      whatsappNumber: line.whatsappNumber || '',
      description: line.description || '',
      status: (line.status as any) || 'ativa'
    });
  };

  const handleWhatsAppClick = (whatsappNumber: string, lineName: string) => {
    if (!whatsappNumber) return;
    
    const message = encodeURIComponent(`Olá! Gostaria de informações sobre a ${lineName}.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Telefone removido do schema principal; manter função no caso de descrição conter contato
  const handlePhoneClick = (phoneNumber: string) => {
    if (!phoneNumber) return;
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
        <Sidebar />
  <div className={`flex-1 flex flex-col overflow-hidden transition-all`}>
          <TopBar title="Gerenciamento de Linhas" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
            <div className="container mx-auto px-6 py-8">
              {/* Cabeçalho da página */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  Gerenciamento de Linhas
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                  Gerencie as linhas de transporte e seus contatos
                </p>
              </div>

              {/* Controles e filtros */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Busca */}
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por número, nome, origem ou destino..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10"
                        id="lines-search-input"
                      />
                      <button
                        type="button"
                        aria-label="Buscar"
                        onClick={() => {
                          applyFilters();
                          const el = document.getElementById('lines-search-input') as HTMLInputElement | null;
                          if (el) el.focus();
                        }}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Filtro por status */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as any)}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="all">Todos os status</option>
                      <option value="ativa">Ativas</option>
                      <option value="inativa">Inativas</option>
                    </select>

                    {/* Filtro DDD */}
                    <select
                      value={dddFilter}
                      onChange={(e) => setDddFilter(e.target.value)}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="all">Todos os DDDs</option>
                      {dddOptions.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {/* Filtro por custo (dinâmico) */}
                    <select
                      value={custoFilter}
                      onChange={(e) => setCustoFilter(e.target.value)}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="all">Todos os custos</option>
                      {Array.from(new Set(lines.map(l => String(l.custoFlutuante ?? l.custoReal ?? 'Sem Custo'))))
                        .map(s => s.trim())
                        .filter(s => s !== '')
                        .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }))
                        .map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                  </div>

                  <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Linha
                      </Button>
                    </DialogTrigger>
                      <DialogContent className="max-w-7xl w-full h-[60vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Nova Linha de Transporte</DialogTitle>
                      </DialogHeader>
                        <LineForm
                          onSubmit={handleCreateLineFromForm}
                          onCancel={() => setShowCreateModal(false)}
                          custoOptions={custoOptions}
                        />
                    </DialogContent>
                  </Dialog>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm mr-2">Selecionar:</label>
                        <input type="checkbox" checked={selectAll} disabled={isBulkLoading} onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectAll(checked);
                          if (checked) {
                            const map: Record<string, boolean> = {};
                            filteredLines.forEach(l => { map[l.id] = true; });
                            setSelectedIds(map);
                          } else {
                            setSelectedIds({});
                          }
                        }} />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="text-sm" disabled={isBulkLoading || selectedCount === 0}>
                              {isBulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                              {isBulkLoading ? 'Processando...' : 'Excluir selecionadas'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Para confirmar, digite <strong>APAGAR</strong> no campo abaixo. Esta ação removerá permanentemente as linhas selecionadas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="p-4">
                              <label className="block text-sm mb-2">Confirmação</label>
                              <input id="bulk-delete-confirm" placeholder="Digite APAGAR para confirmar" className="w-full p-2 border rounded" />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={async () => {
                                const input = document.getElementById('bulk-delete-confirm') as HTMLInputElement | null;
                                if (!input || input.value !== 'APAGAR') {
                                  toast({ title: 'Confirmação inválida', description: 'Digite APAGAR para confirmar.', variant: 'destructive' });
                                  return;
                                }
                                // Construir lista de ids
                                const ids = Object.keys(selectedIds).filter(k => selectedIds[k]);
                                try {
                                  setIsBulkLoading(true);
                                  const res = await api.bulkDeleteLines(ids);
                                  toast({ title: 'Sucesso', description: `${res.deleted} linhas excluídas.` });
                                  await loadLines();
                                  setSelectedIds({});
                                  setSelectAll(false);
                                } catch (error) {
                                  console.error('Erro no bulk delete:', error);
                                  toast({ title: 'Erro', description: (error as any)?.message || 'Falha ao excluir linhas', variant: 'destructive' });
                                } finally {
                                  setIsBulkLoading(false);
                                }
                              }}>
                                Excluir selecionadas
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {isSuperAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="text-sm" disabled={isBulkLoading || lines.length === 0}>
                                {isBulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                {isBulkLoading ? 'Processando...' : 'Apagar todas'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apagar todas as linhas</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acao remove permanentemente todas as linhas do banco. Para confirmar, digite <strong>APAGAR TUDO</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="p-4">
                                <label className="block text-sm mb-2">Confirmacao</label>
                                <input id="delete-all-confirm" placeholder="Digite APAGAR TUDO para confirmar" className="w-full p-2 border rounded" />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={async () => {
                                  const input = document.getElementById('delete-all-confirm') as HTMLInputElement | null;
                                  if (!input || input.value !== 'APAGAR TUDO') {
                                    toast({ title: 'Confirmacao invalida', description: 'Digite APAGAR TUDO para confirmar.', variant: 'destructive' });
                                    return;
                                  }
                                  await handleDeleteAllLines();
                                }}>
                                  Apagar todas
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {/* Botão de validação em massa */}
                        <Dialog open={showBulkValidateDialog} onOpenChange={setShowBulkValidateDialog}>
                            <DialogTrigger asChild>
                            <Button variant="outline" className="text-sm ml-2" disabled={isBulkLoading || selectedCount === 0} onClick={() => setShowBulkValidateDialog(true)}>
                              {isBulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                              {isBulkLoading ? 'Validando...' : 'Validar selecionadas'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Validar Linhas Selecionadas</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Status de validação</Label>
                                <Select value={bulkValidationStatus} onValueChange={(v) => setBulkValidationStatus(v)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Validada">Validada</SelectItem>
                                    <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Observação (opcional)</Label>
                                <Textarea id="bulk-validate-note" placeholder="Digite uma descrição ou observação para registrar na validação" />
                              </div>
                            </div>
                              <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" onClick={() => setShowBulkValidateDialog(false)} disabled={isBulkLoading}>
                                Cancelar
                              </Button>
                              <Button disabled={isBulkLoading} onClick={async () => {
                                const status = bulkValidationStatus;
                                const noteEl = document.getElementById('bulk-validate-note') as HTMLTextAreaElement | null;
                                const note = noteEl ? noteEl.value : '';

                                if (!status) {
                                  toast({ title: 'Erro', description: 'Selecione um status de validação.', variant: 'destructive' });
                                  return;
                                }

                                const ids = Object.keys(selectedIds).filter(k => selectedIds[k]);
                                  if (!ids || ids.length === 0) {
                                    toast({ title: 'Erro', description: 'Nenhuma linha selecionada para validar.', variant: 'destructive' });
                                    return;
                                  }

                                  // Validar formato dos ids antes de enviar para a API (evitar enviar valores como "0")
                                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                                  const invalidIds = ids.filter(id => typeof id !== 'string' || !uuidRegex.test(id));
                                  if (invalidIds.length > 0) {
                                    console.warn('[lines] attempting bulk-validate with invalid ids, aborting:', invalidIds);
                                    toast({ title: 'Erro', description: `IDs inválidos selecionados: ${invalidIds.join(', ')}`, variant: 'destructive' });
                                    return;
                                  }
                                try {
                                  console.debug('[lines] bulk-validate payload:', { ids, validationStatus: status, note });
                                  setIsBulkLoading(true);
                                  const res = await api.bulkValidateLines(ids, { validationStatus: status, note });
                                  toast({ title: 'Sucesso', description: `${res.updated} linhas validadas.` });
                                  await loadLines();
                                  setSelectedIds({});
                                  setSelectAll(false);
                                  setShowBulkValidateDialog(false);
                                  setBulkValidationStatus('');
                                  const noteArea = document.getElementById('bulk-validate-note') as HTMLTextAreaElement | null;
                                  if (noteArea) noteArea.value = '';
                                } catch (error) {
                                  console.error('Erro no bulk validate:', error);
                                  toast({ title: 'Erro', description: (error as any)?.message || 'Falha ao validar linhas', variant: 'destructive' });
                                } finally {
                                  setIsBulkLoading(false);
                                }
                              }}>
                                {isBulkLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Validando...</> : 'Validar'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        {lines.length}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Total de linhas
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {lines.filter(l => normalizeStatus(l.status) === 'ativa').length}
                        </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Linhas ativas
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                          {lines.filter(l => normalizeStatus(l.status) === 'inativa').length}
                        </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Linhas inativas
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-500">
                        {lines.filter(l => l.hasWhatsapp).length}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Com WhatsApp
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Lista de linhas */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Linhas ({filteredLines.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-20 bg-neutral-200 rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : filteredLines.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {filteredLines.map((line) => (
                          <div key={line.id} className="w-full bg-card border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {isAdmin && (
                                    <input type="checkbox" checked={!!selectedIds[line.id]} onChange={(e) => {
                      setSelectedIds(prev => ({ ...prev, [line.id]: e.target.checked }));
                                    }} />
                                  )}
                                  <Badge variant="outline" className="font-mono">{line.item || '-'}</Badge>
                                  <Badge variant="outline" className="font-mono">{line.ddd || '-'}</Badge>
                                  <Badge variant="outline" className="font-mono">{line.numero}</Badge>
                    <Badge variant={normalizeStatus(line.status) === 'ativa' ? 'default' : 'secondary'}>{displayStatus(line.status)}</Badge>
                    {renderValidationBadge(line.validationStatus)}
                                  {line.hasWhatsapp && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      WhatsApp
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1 text-lg">
                                  {line.nome}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                  <div>Conta: <span className="font-medium text-neutral-800 dark:text-neutral-200">{line.conta || '-'}</span></div>
                                  <div>Tipo: <span className="font-medium text-neutral-800 dark:text-neutral-200">{line.tipo || '-'}</span></div>
                                  <div>Custo Flutuante: <span className="font-medium text-neutral-800 dark:text-neutral-200">{line.custoFlutuante || '-'}</span></div>
                                  <div>Custo Real: <span className="font-medium text-neutral-800 dark:text-neutral-200">{line.custoReal || '-'}</span></div>
                                </div>
                                {line.description && (
                                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                                    {line.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-center gap-2 ml-4">
                                {line.hasWhatsapp && line.whatsappNumber && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleWhatsAppClick(line.whatsappNumber!, line.nome || '')}
                                    className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                    disabled={isBulkLoading || !!itemLoading[line.id]}
                                  >
                                    {itemLoading[line.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                                    <span className="hidden sm:inline">{itemLoading[line.id] ? 'Processando' : 'WhatsApp'}</span>
                                  </Button>
                                )}

                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => startEdit(line)}
                                    disabled={isBulkLoading || !!itemLoading[line.id]}
                                  >
                                    {itemLoading[line.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" disabled={isBulkLoading || !!itemLoading[line.id]}>
                                        {itemLoading[line.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir a linha "{line.nome}"? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={async () => {
                                          try {
                                            setItemLoadingFor(line.id, true);
                                            await handleDeleteLine(line.id);
                                          } finally {
                                            setItemLoadingFor(line.id, false);
                                          }
                                        }}>
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Nenhuma linha encontrada com os filtros aplicados.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Modal de Edição */}
              <Dialog open={!!editingLine} onOpenChange={(open) => !open && setEditingLine(null)}>
                  <DialogContent className="max-w-7xl w-full h-[60vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Linha Telefonica</DialogTitle>
                  </DialogHeader>
                  {editingLine && (
                    <LineForm
                      line={editingLine}
                      isReadOnly={false}
                      onCancel={() => setEditingLine(null)}
                      onSubmit={handleEditLineFromForm}
                      custoOptions={custoOptions}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
