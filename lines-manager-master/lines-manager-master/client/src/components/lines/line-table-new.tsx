import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { usePermissions } from '@/hooks/use-permissions';
import { Line } from '@/types';
import { 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';

interface LineTableProps {
  lines: Line[];
  onEdit: (line: Line) => void;
  onView: (line: Line) => void;
  onDelete: (line: Line) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function LineTable({ 
  lines, 
  onEdit, 
  onView, 
  onDelete, 
  onRefresh,
  isLoading = false 
}: LineTableProps) {
  const { canEdit, canDelete, canView } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // Filter lines based on search and status
  const filteredLines = lines.filter(line => {
    const matchesSearch = searchTerm === '' || 
      (line.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (line.nome || line.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (line.numero || '').includes(searchTerm) ||
      (line.ddd || '').includes(searchTerm) ||
      (line.tipo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (line.conta || '').includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || line.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLines = filteredLines.slice(startIndex, startIndex + itemsPerPage);

  // Status badge variant
  const getStatusBadgeVariant = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'ativa':
        return 'default';
      case 'inativa':
        return 'secondary';
      case 'suspensa':
        return 'destructive';
      case 'cancelada':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Format phone number for display
  const formatPhone = (ddd: string | null, numero: string | null) => {
    if (!ddd || !numero) return '-';
    const cleanNumber = numero.replace(/\D/g, '');
    if (cleanNumber.length === 9) {
      return `(${ddd}) ${cleanNumber.slice(0, 5)}-${cleanNumber.slice(5)}`;
    }
    return `(${ddd}) ${cleanNumber}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Gerenciador de Linhas ({filteredLines.length})
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, número, tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Inativa">Inativa</SelectItem>
                <SelectItem value="Suspensa">Suspensa</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Custo Real</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {isLoading ? 'Carregando...' : 'Nenhuma linha encontrada'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{line.nome || line.name || '-'}</div>
                        {line.code && (
                          <div className="text-xs text-gray-500">#{line.code}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {formatPhone(line.ddd, line.numero)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{line.tipo || '-'}</span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm font-mono">{line.conta || '-'}</span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(line.status)}>
                        {line.status || 'Indefinido'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <WhatsAppButton
                        ddd={line.ddd}
                        numero={line.numero}
                        nome={line.nome}
                        hasWhatsapp={line.hasWhatsapp}
                        whatsappNumber={line.whatsappNumber}
                        className="text-xs"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm font-mono text-green-600">
                        {line.custoReal || '-'}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(line)}
                            title="Visualizar linha"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(line)}
                            title="Editar linha"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(line)}
                            title="Excluir linha"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredLines.length)} de {filteredLines.length} linhas
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
