import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api-new';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '@/components/common/confirmation-modal';

export function BackupRestore() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [fileToRestore, setFileToRestore] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      // Simular export backup - pode ser implementado depois
      const response = await fetch('/api/backup', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao exportar backup');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Backup exportado',
        description: 'O arquivo de backup foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao exportar backup',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToRestore(file);
      setShowRestoreConfirm(true);
    }
  };

  const handleRestoreBackup = async () => {
    if (!fileToRestore) return;

    setIsImporting(true);
    try {
      const text = await fileToRestore.text();
      const data = JSON.parse(text);
      
      // Simular import backup - pode ser implementado depois
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao restaurar backup');
      }
      
      toast({
        title: 'Backup restaurado',
        description: 'Os dados foram restaurados com sucesso. A página será recarregada.',
      });
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      toast({
        title: 'Erro ao restaurar backup',
        description: error instanceof Error ? error.message : 'Arquivo inválido ou corrompido',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setShowRestoreConfirm(false);
      setFileToRestore(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Backup
          </CardTitle>
          <CardDescription>
            Faça o download de todos os dados do sistema (usuários, linhas e logs)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? 'Exportando...' : 'Baixar Backup'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Restaurar Backup
          </CardTitle>
          <CardDescription className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Atenção:</strong> Esta operação substituirá todos os dados existentes.
              Certifique-se de fazer um backup antes de prosseguir.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
              disabled={isImporting}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecione um arquivo JSON de backup para restaurar os dados.
            </p>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={showRestoreConfirm}
        onClose={() => {
          setShowRestoreConfirm(false);
          setFileToRestore(null);
        }}
        onConfirm={handleRestoreBackup}
        title="Confirmar Restauração"
        message={`Tem certeza que deseja restaurar o backup do arquivo "${fileToRestore?.name}"? Esta ação substituirá todos os dados existentes e não pode ser desfeita.`}
        confirmText="Restaurar"
        variant="destructive"
      />
    </div>
  );
}
