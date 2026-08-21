import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Route, Activity, TrendingUp, TrendingDown, Phone, MessageCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '@/lib/api-new';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';

interface DashboardStats {
  totalLines: number;
  activeLines: number;
  inactiveLines: number;
  withWhatsapp: number;
  totalUsers: number;
  activeUsers: number;
  recentActivity?: any[];
  countsByCusto?: Record<string, number>;
}

interface RecentActivity {
  id: string;
  type: 'line_created' | 'line_updated' | 'user_login' | 'backup_created';
  description: string;
  timestamp: string;
  user?: string;
}

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'line_created',
    description: 'Nova linha criada: Centro-Zona Norte',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: 'admin@sistema.com'
  },
  {
    id: '2',
    type: 'user_login',
    description: 'Login realizado no sistema',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    user: 'usuario@teste.com'
  },
  {
    id: '3',
    type: 'line_updated',
    description: 'Linha atualizada: Shopping-Universidade',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: 'admin@sistema.com'
  }
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockActivities);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.warn('Erro ao carregar estatísticas da API, usando dados mock:', err);
      // Dados mock para desenvolvimento
      setStats({
        totalLines: 15,
        activeLines: 12,
        inactiveLines: 3,
        withWhatsapp: 9,
        totalUsers: 5,
        activeUsers: 4
      });
      setError('Usando dados de exemplo. Conecte-se ao banco para dados reais.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const logs = await api.getActivityLogs();
      const mapped: RecentActivity[] = (logs || []).slice(0, 5).map((l: any) => ({
        id: l.id,
        type: (l.action === 'IMPORT_EXCEL' ? 'line_created' : 'user_login') as any,
        description: l.details?.message || l.action,
        timestamp: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        user: l.userId || 'sistema'
      }));
      setRecentActivity(mapped);
    } catch (error) {
      // Usar dados mock se API falhar
      setRecentActivity(mockActivities);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'line_created':
      case 'line_updated':
        return <Route className="w-4 h-4 text-blue-600" />;
      case 'user_login':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'backup_created':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  // Paleta de cores da UI (core brand-like)
  const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#64748B'];

  // Preparar dados ordenados por contagem desc para os gráficos
  const countsArray = stats && stats.countsByCusto ? Object.entries(stats.countsByCusto).map(([k, v]) => ({ name: k, value: Number(v) })) : [];
  countsArray.sort((a, b) => b.value - a.value);

  // Usar toda a lista para o gráfico de barras (com rolagem se necessária)
  const barData = countsArray;

  // Para o pie: mostrar top N e agregar o resto em 'Outros' para manter legibilidade
  const PIE_TOP = 8;
  const pieTop = countsArray.slice(0, PIE_TOP);
  const others = countsArray.slice(PIE_TOP);
  const othersSum = others.reduce((s, it) => s + (it.value || 0), 0);
  const pieData = othersSum > 0 ? [...pieTop, { name: 'Outros', value: othersSum }] : pieTop;

  const totalValue = countsArray.reduce((s, it) => s + (it.value || 0), 0);

  // Tooltip customizado para os charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0].payload ?? payload[0];
    const name = p.name || p.payload?.name || '';
    const value = p.value ?? p.payload?.value ?? 0;
    const percent = totalValue > 0 ? ((Number(value) / totalValue) * 100).toFixed(1) : '0.0';
    return (
      <div className="bg-white border rounded p-2 shadow text-sm">
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground">{value} linhas • {percent}%</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar title="Dashboard" />
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Dashboard" showSearch={false} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral rápida</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Atualizado em {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>

            {error && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Activity className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Total de Linhas */}
                  <Card className="col-span-1 lg:col-span-1 min-h-[220px]">
                    <CardHeader>
                      <CardTitle className="text-lg">Total de Linhas</CardTitle>
                      <CardDescription>Quantidade total de linhas cadastradas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-extrabold">{stats.totalLines}</div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        Linhas ativas: <span className="font-medium">{stats.activeLines}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Atividade Recente */}
                  <Card className="col-span-1 lg:col-span-1 min-h-[220px]">
                    <CardHeader>
                      <CardTitle className="text-lg">Atividade Recente</CardTitle>
                      <CardDescription>Últimas ações no sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                          recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                              {getActivityIcon(activity.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{activity.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{formatTimeAgo(activity.timestamp)}</span>
                                  {activity.user && (
                                    <>
                                      <span>•</span>
                                      <span>{activity.user}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma atividade recente</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status do Sistema (sem gráficos) */}
                  <Card className="col-span-1 lg:col-span-1 min-h-[220px]">
                    <CardHeader>
                      <CardTitle className="text-lg">Status do Sistema</CardTitle>
                      <CardDescription>Visão rápida dos serviços</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Base de Dados</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">API</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Funcionando</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Backup</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-yellow-600">Pendente</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Card full-width para Gráficos */}
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Linhas por Centro de Custo</CardTitle>
                      <CardDescription>Distribuição completa das linhas por centro de custo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {barData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                          {/* Left: Bar chart with all custos (scrollable) */}
                          <div className="h-[420px] overflow-auto">
                            <div className="h-[420px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                  <YAxis allowDecimals={false} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="value" fill={CHART_COLORS[0]}>
                                    {barData.map((entry, index) => (
                                      <Cell key={`cell-bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Right: Pie (top) + full legend list */}
                          <div className="space-y-4">
                            <div className="w-full h-56 flex items-center justify-center">
                              <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={40}
                                    label={false}
                                    labelLine={false}
                                  >
                                  {pieData.map((entry, index) => {
                                    // garantir cor consistente; 'Outros' fica com cinza escuro por padrão
                                    const isOthers = entry.name === 'Outros';
                                    const color = isOthers ? '#6B7280' : CHART_COLORS[index % CHART_COLORS.length];
                                    return <Cell key={`cell-p-${index}`} fill={color} />
                                  })}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="border rounded p-3 max-h-[300px] overflow-auto">
                              <div className="flex flex-col space-y-2">
                                {barData.map((entry, index) => (
                                  <div key={`legend-full-${index}`} className="flex items-center justify-between gap-2 text-sm">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="w-3 h-3 rounded" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                                      <span className="truncate" title={entry.name}>{entry.name}</span>
                                    </div>
                                    <div className="text-muted-foreground ml-3">{entry.value}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Nenhuma informação de custo disponível</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
