import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { Line, InsertLine } from '@/types';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Schema de validação atualizado
const lineFormSchema = z.object({
  organizationId: z.string().default('550e8400-e29b-41d4-a716-446655440000'),
  item: z.string().optional(),
  ddd: z.string().min(2, 'DDD deve ter pelo menos 2 dígitos').max(3, 'DDD deve ter no máximo 3 dígitos'),
  numero: z.string().min(8, 'Número deve ter pelo menos 8 dígitos'),
  nome: z.string().min(2, 'Nome é obrigatório'),
  custoFlutuante: z.string().optional(),
  custoReal: z.string().optional(),
  conta: z.string().optional(),
  tipo: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.string().default('Ativa'),
  origin: z.string().optional(),
  destination: z.string().optional(),
  route: z.string().optional(),
  validationStatus: z.string().default('Pendente'),
  hasWhatsapp: z.boolean().default(true),
  whatsappNumber: z.string().optional(),
});

type LineFormData = z.infer<typeof lineFormSchema>;

interface LineFormProps {
  line?: Line;
  onSubmit: (data: LineFormData) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
  // when true, the Item field becomes readonly when editing an existing line
  disableItemOnEdit?: boolean;
  custoOptions?: string[];
}

export function LineForm({ line, onSubmit, onCancel, isReadOnly = false, disableItemOnEdit = true, custoOptions = [] }: LineFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LineFormData>({
    resolver: zodResolver(lineFormSchema),
    defaultValues: {
      organizationId: line?.organizationId || '550e8400-e29b-41d4-a716-446655440000',
      item: line?.item || '',
      ddd: line?.ddd || '',
      numero: line?.numero || '',
      nome: line?.nome || '',
      custoFlutuante: line?.custoFlutuante || '',
      custoReal: line?.custoReal || '',
      conta: line?.conta || '',
      tipo: line?.tipo || '',
      code: line?.code || '',
      name: line?.name || '',
      description: line?.description || '',
      status: line?.status || 'Ativa',
      origin: line?.origin || '',
      destination: line?.destination || '',
      route: line?.route || '',
      validationStatus: line?.validationStatus || 'Pendente',
      hasWhatsapp: line?.hasWhatsapp ?? true,
      whatsappNumber: line?.whatsappNumber || '',
    },
  });

  const watchedDdd = form.watch('ddd');
  const watchedNumero = form.watch('numero');
  const watchedNome = form.watch('nome');
  const watchedHasWhatsapp = form.watch('hasWhatsapp');

  const handleSubmit = async (data: LineFormData) => {
    if (isReadOnly) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: line ? 'Linha atualizada' : 'Linha criada',
        description: `Linha ${data.nome} foi ${line ? 'atualizada' : 'criada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: `Erro ao ${line ? 'atualizar' : 'criar'} linha.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-full mx-auto px-4">
      <CardHeader>
        <CardTitle>
          {isReadOnly ? 'Visualizar Linha' : line ? 'Editar Linha' : 'Nova Linha'}
        </CardTitle>
      </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div>
                    <Label>Item</Label>
                    <Input
                      {...form.register('item')}
                      placeholder="Ex.: 1 (item da planilha da operadora)"
                      disabled={disableItemOnEdit && !!line}
                      className={disableItemOnEdit && !!line ? 'opacity-70' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Identificador interno da linha no seu controle.</p>
                  </div>

                  <div>
                    <Label>DDD</Label>
                    <Input {...form.register('ddd')} placeholder="Ex.: 62" />
                    <p className="text-xs text-muted-foreground mt-1">Código de área do telefone.</p>
                  </div>

                  <div>
                    <Label>Numero</Label>
                    <Input {...form.register('numero')} placeholder="Ex.: 996447703" />
                    <p className="text-xs text-muted-foreground mt-1">Número principal da linha (sem DDD).</p>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Nome</Label>
                    <Input {...form.register('nome')} placeholder="Nome do colaborador, equipe ou referência" />
                    <p className="text-xs text-muted-foreground mt-1">Quem usa ou representa esta linha.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <Label>Conta</Label>
                    <Input {...form.register('conta')} placeholder="Ex.: 335640117" />
                    <p className="text-xs text-muted-foreground mt-1">Conta/contrato da operadora.</p>
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Input {...form.register('tipo')} placeholder="Ex.: VIVO, CLARO, TIM" />
                    <p className="text-xs text-muted-foreground mt-1">Categoria ou operadora da linha.</p>
                  </div>
                  <div>
                    <Label>Whatsapp</Label>
                    <div className="flex gap-2 items-center">
                      <Input {...form.register('whatsappNumber')} placeholder="Ex.: 5562996447703" />
                      {/* Preview WhatsApp ao lado do input (substitui checkbox hasWhatsapp) */}
                      {watchedDdd && watchedNumero && watchedNome && (
                        <WhatsAppButton
                          ddd={watchedDdd}
                          numero={watchedNumero}
                          nome={watchedNome}
                          hasWhatsapp={watchedHasWhatsapp}
                          whatsappNumber={form.watch('whatsappNumber')}
                          className="text-xs"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Número do WhatsApp com código do país (55).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label>Custo Flutuante</Label>
                    {custoOptions && custoOptions.length > 0 ? (
                      <Select
                        value={form.getValues('custoFlutuante')}
                        onValueChange={(v) => form.setValue('custoFlutuante', v)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Projeto/centro de custo variavel" />
                        </SelectTrigger>
                        <SelectContent>
                          {custoOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input {...form.register('custoFlutuante')} placeholder="Ex.: TROCA DE POSTES - CPFL RS" />
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Projeto/custo variavel vinculado a linha.</p>
                  </div>
                  <div>
                    <Label>Custo Real</Label>
                    <Input {...form.register('custoReal')} placeholder="Ex.: TROCA DE POSTES - CPFL RS" />
                    <p className="text-xs text-muted-foreground mt-1">Custo final/real consolidado da linha.</p>
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea {...form.register('description')} placeholder="Observacoes operacionais da linha" />
                  <p className="text-xs text-muted-foreground mt-1">Detalhes importantes para consulta futura.</p>
                </div>

            {/* WhatsApp Configuration */}
            <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-medium text-green-800">Configuração WhatsApp</h3>
              <div className="flex items-center gap-3">
                <Controller
                  control={form.control}
                  name="hasWhatsapp"
                  render={({ field }) => (
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                  )}
                />
                <div>
                  <div className="text-sm font-medium">Este número tem WhatsApp ativo</div>
                </div>
              </div>

              {watchedHasWhatsapp && (
                <div>
                  <Label>Número WhatsApp (opcional)</Label>
                  <Input {...form.register('whatsappNumber')} disabled={isReadOnly} placeholder="Ex.: 5562996447703" />
                  <p className="text-sm text-gray-600">Deixe vazio para usar o número da linha ({watchedDdd} {watchedNumero})</p>
                </div>
              )}
            </div>

            {/* Status e Validação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>Status</Label>
                <Select
                  value={form.getValues('status')}
                  onValueChange={(v) => form.setValue('status', v)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
                    <SelectItem value="Suspensa">Suspensa</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Situação atual da linha no sistema.</p>
              </div>

              <div>
                <Label>Status de Validação</Label>
                <Select
                  value={form.getValues('validationStatus')}
                  onValueChange={(v) => form.setValue('validationStatus', v)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status de validação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Validada">Validada</SelectItem>
                    <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Controle de conferência do cadastro.</p>
              </div>
            </div>

            {/* Botões de Ação */}
              {!isReadOnly && (
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : line ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
