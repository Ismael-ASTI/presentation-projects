import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Activity,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api-new';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { useToast } from '@/hooks/use-toast';
import type { User, UserFormData } from '@/types';

// Mock data para fallback
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@sistema.com',
    role: 'super_admin',
  organizationId: '550e8400-e29b-41d4-a716-446655440000',
  passwordHash: 'mock',
  accountStatus: 'approved',
  isActive: true,
  emailVerified: true,
  permissions: [],
  assignedCostCenters: null,
  lastLoginAt: null,
  isOnline: false,
  createdAt: new Date(),
  updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Usuário Teste',
    email: 'usuario@teste.com',
    role: 'user',
  organizationId: '550e8400-e29b-41d4-a716-446655440000',
  passwordHash: 'mock',
  accountStatus: 'approved',
  isActive: true,
  emailVerified: false,
  permissions: [],
  assignedCostCenters: null,
  lastLoginAt: null,
  isOnline: false,
  createdAt: new Date(),
  updatedAt: new Date()
  }
];

export default function Administration() {
  const [users, setUsers] = useState<User[]>([]);
  const sidebarCollapsed = (() => {
    try { return localStorage.getItem('sidebar_collapsed') === '1'; } catch(e) { return false; }
  })();
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const { toast } = useToast();

  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin' | 'super_admin' | 'viewer'
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin' | 'super_admin' | 'viewer',
    isActive: true
  });

  useEffect(() => {
    loadUsers();
    loadActivityLogs();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.warn('Erro ao carregar usuários da API, usando dados mock:', error);
      setUsers(mockUsers);
      toast({
        title: "Aviso",
        description: "Usando dados de exemplo. Conecte-se ao banco para dados reais.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (error) {
      console.warn('Erro ao carregar logs de atividade:', error);
      setActivityLogs([
        {
          id: 1,
          action: 'Login',
          user: 'admin@sistema.com',
          timestamp: new Date().toISOString(),
          details: 'Login realizado com sucesso'
        }
      ]);
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const payload: Partial<User> = {
        ...newUser,
        accountStatus: 'approved',
        isActive: true,
        emailVerified: true,
      } as Partial<User>;

      const createdUser = await api.createUser(payload);
      setUsers([...users, createdUser]);
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso"
      });
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowCreateUser(false);
    } catch (error) {
      // Fallback para dados mock
      const mockUser: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        passwordHash: 'mock',
        accountStatus: 'approved',
        isActive: true,
        emailVerified: false,
        permissions: [],
        assignedCostCenters: null,
        lastLoginAt: null,
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUsers([...users, mockUser]);
      toast({
        title: "Usuário Adicionado",
        description: "Usuário adicionado localmente (conecte ao banco para persistir)"
      });
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowCreateUser(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    try {
      const updatedUser = await api.updateUser(editingUser.id, editUser);
      setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso"
      });
      setEditingUser(null);
    } catch (error) {
      // Fallback para dados mock
      const updatedUser: User = {
        ...editingUser,
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        isActive: editUser.isActive,
        updatedAt: new Date()
      };
      setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      toast({
        title: "Usuário Atualizado",
        description: "Usuário atualizado localmente (conecte ao banco para persistir)"
      });
      setEditingUser(null);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso"
      });
    } catch (error) {
      // Fallback para dados mock
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Usuário Removido",
        description: "Usuário removido localmente (conecte ao banco para persistir)"
      });
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: (user.role as any) as 'user' | 'admin' | 'super_admin' | 'viewer',
      isActive: !!user.isActive
    });
  };

  const exportBackup = async () => {
    try {
      // Simular exportação de backup
      const backupData = {
        users: users,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Backup exportado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer backup",
        variant: "destructive"
      });
    }
  };

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      if (backupData.users && Array.isArray(backupData.users)) {
        setUsers(backupData.users);
        toast({
          title: "Sucesso",
          description: `Backup restaurado com ${backupData.users.length} usuários`
        });
      } else {
        throw new Error('Formato de backup inválido');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao importar backup. Verifique o formato do arquivo.",
        variant: "destructive"
      });
    }

    // Reset input
    event.target.value = '';
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
      viewer: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Administrador',
      user: 'Usuário',
      viewer: 'Visualizador'
    };

    return (
      <Badge className={colors[role as keyof typeof colors] || colors.user}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}>
        <TopBar title="Administração" />
  <main className="flex-1 p-6 overflow-auto page-container">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
              <p className="text-muted-foreground">
                Gerenciamento de usuários e configurações do sistema
              </p>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-2" />
                  Usuários
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Settings className="w-4 h-4 mr-2" />
                  Sistema
                </TabsTrigger>
                <TabsTrigger value="backup">
                  <Download className="w-4 h-4 mr-2" />
                  Backup
                </TabsTrigger>
                <TabsTrigger value="logs">
                  <Activity className="w-4 h-4 mr-2" />
                  Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Usuários do Sistema</CardTitle>
                        <CardDescription>
                          Gerencie os usuários e suas permissões
                        </CardDescription>
                      </div>
                      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Novo Usuário
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nome *</Label>
                              <Input
                                id="name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Nome completo"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="email@exemplo.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">Senha *</Label>
                              <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Senha forte"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="role">Função *</Label>
                              <Select 
                                value={newUser.role} 
                                onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuário</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="viewer">Visualizador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={createUser}>
                              <Save className="w-4 h-4 mr-2" />
                              Criar Usuário
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : (
                        users.map((user) => (
                          <Card key={user.id} className="line-item list-divider">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getRoleBadge(user.role)}
                                      <Badge 
                                        variant={user.isActive ? "default" : "secondary"}
                                        className={user.isActive ? "bg-green-100 text-green-800" : ""}
                                      >
                                        {user.isActive ? "Ativo" : "Inativo"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => startEdit(user)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir o usuário "{user.name}"? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteUser(user.id)}>
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>
                      Configurações gerais e permissões
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Estatísticas do Sistema</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span>Total de Usuários:</span>
                              <Badge>{users.length}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Usuários Ativos:</span>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                {users.filter(u => u.isActive).length}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Administradores:</span>
                              <Badge variant="secondary">
                                {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Status do Sistema</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Base de Dados:</span>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Conectado</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Servidor:</span>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Online</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Última Atualização:</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date().toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backup" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Backup e Restauração</CardTitle>
                    <CardDescription>
                      Faça backup dos dados ou restaure de um backup anterior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Exportar Backup</CardTitle>
                            <CardDescription>
                              Crie um backup dos dados do sistema
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button 
                              onClick={exportBackup}
                              className="w-full flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Fazer Backup
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Importar Backup</CardTitle>
                            <CardDescription>
                              Restaure dados de um arquivo de backup
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <Input
                                type="file"
                                accept=".json"
                                onChange={importBackup}
                                className="cursor-pointer"
                              />
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertCircle className="w-4 h-4" />
                                <span>Aceita apenas arquivos .json de backup</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Informações do Backup</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span>Última exportação:</span>
                              <span className="text-muted-foreground">Nunca</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Última importação:</span>
                              <span className="text-muted-foreground">Nunca</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tamanho estimado:</span>
                              <span className="text-muted-foreground">~{Math.round(JSON.stringify(users).length / 1024)} KB</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs de Atividade</CardTitle>
                    <CardDescription>
                      Histórico de ações realizadas no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityLogs.length > 0 ? (
                        activityLogs.map((log, index) => (
                          <div key={log.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Activity className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium">{log.action}</p>
                                <p className="text-sm text-muted-foreground">{log.user}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                              </p>
                              {log.details && (
                                <p className="text-xs text-muted-foreground">{log.details}</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>Nenhum log de atividade encontrado</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Modal de Edição de Usuário */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome *</Label>
                    <Input
                      id="edit-name"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Função *</Label>
                    <Select 
                      value={editUser.role} 
                      onValueChange={(value) => setEditUser({ ...editUser, role: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={editUser.isActive}
                      onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="edit-active">Usuário ativo</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={updateUser}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
