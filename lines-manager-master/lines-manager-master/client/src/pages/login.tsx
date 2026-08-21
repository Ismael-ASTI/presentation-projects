import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Route, Eye, EyeOff, FileSpreadsheet, ShieldCheck, Users, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation('/lines');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const normalizedUsername = username.trim().toLowerCase();
      const result = await login(normalizedUsername, password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Gerenciador de Linhas!",
        });
        setLocation('/lines');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro interno do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f1f5f9_100%)] dark:bg-neutral-900 px-4 py-8">
      <Card className="w-full max-w-4xl border-neutral-200/70 dark:border-neutral-700/70 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-blue-100/70">
            <div className="relative flex items-center justify-center">
              <Route className="text-white w-8 h-8" />
              <span className="absolute -bottom-2 -right-3 text-[10px] leading-none font-bold text-white/95 bg-black/20 px-1.5 py-0.5 rounded">LM</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Lines Manager</CardTitle>
          <CardDescription className="text-base">
            Gestão inteligente de linhas, custos e validações em um só lugar.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="acesso" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="acesso">Acesso ao Sistema</TabsTrigger>
              <TabsTrigger value="sobre">Sobre o Lines Manager</TabsTrigger>
            </TabsList>

            <TabsContent value="acesso" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Email</Label>
                    <Input
                      id="username"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="exemplo@linemanager.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary-500 hover:bg-primary-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>

                <div className="rounded-xl border border-blue-100 dark:border-neutral-700 bg-blue-50/60 dark:bg-neutral-800/60 p-5 space-y-3">
                  <h3 className="font-semibold text-blue-900 dark:text-neutral-100">Acesso guiado</h3>
                  <p className="text-sm text-blue-800 dark:text-neutral-300">
                    Use seu email corporativo e senha cadastrada pelo administrador do sistema.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-neutral-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Login seguro com sessão autenticada.
                    </div>
                    <div className="flex items-center gap-2 text-blue-900 dark:text-neutral-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Perfil com permissões por função.
                    </div>
                    <div className="flex items-center gap-2 text-blue-900 dark:text-neutral-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Controle de atividades e auditoria.
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sobre" className="mt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border p-4 bg-white/70 dark:bg-neutral-800/60">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                    <Route className="w-5 h-5 text-blue-700 dark:text-neutral-200" />
                  </div>
                  <h3 className="font-semibold mb-1">Dashboard com visão operacional</h3>
                  <p className="text-sm text-muted-foreground">Acompanhe indicadores, volume de linhas, status e visão geral da operação em tempo real.</p>
                </div>

                <div className="rounded-xl border p-4 bg-white/70 dark:bg-neutral-800/60">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-700 dark:text-neutral-200" />
                  </div>
                  <h3 className="font-semibold mb-1">Gestão de linhas por template</h3>
                  <p className="text-sm text-muted-foreground">Importe e atualize linhas via planilha padronizada, mantendo governança e consistência de dados.</p>
                </div>

                <div className="rounded-xl border p-4 bg-white/70 dark:bg-neutral-800/60">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-neutral-200" />
                  </div>
                  <h3 className="font-semibold mb-1">Perfis e segurança</h3>
                  <p className="text-sm text-muted-foreground">Controle por perfil (super admin, admin, usuário e visualizador), com rastreabilidade de ações.</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border p-4 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-0.5 text-primary-600" />
                  <p className="text-sm text-muted-foreground">
                    O <strong>Lines Manager</strong> foi criado para dar visibilidade e controle sobre linhas telefônicas da empresa, permitindo acompanhar, validar, organizar custos e manter a base sempre atualizada para gestão e consultoria.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => setLocation('/sobre-sistema')}>
                  Ver apresentação completa do sistema
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-[11px] text-muted-foreground/70 tracking-wide animate-[pulse_5s_ease-in-out_infinite]">
              Desenvolvido por <span className="font-medium text-foreground/70">itscomports.com.br</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
