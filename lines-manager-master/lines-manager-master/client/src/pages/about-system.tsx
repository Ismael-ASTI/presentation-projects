import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Route,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  ArrowLeft,
  Users,
  CheckCircle2,
  Layers3,
  Sparkles,
  Workflow,
  Building2,
  BadgeCheck,
} from 'lucide-react';

export default function AboutSystemPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
      <div className="pointer-events-none absolute -top-28 -left-24 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/login')}
            className="border-slate-600 bg-slate-900/60 text-slate-100 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para login
          </Button>
          <p className="text-[11px] tracking-wide text-slate-300/65 animate-[pulse_5s_ease-in-out_infinite]">
            Desenvolvido por <span className="font-medium text-slate-200/75">itscomports.com.br</span>
          </p>
        </div>

        <div className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <div className="mb-6 flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-lg ring-4 ring-sky-400/10 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <Route className="h-8 w-8 text-white" />
                    <span className="absolute -bottom-2 -right-3 rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white/95">
                      LM
                    </span>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Lines Manager</h1>
                  <p className="text-slate-300">Plataforma para controle estratégico de linhas corporativas</p>
                </div>
              </div>

              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Gestão moderna e segura
                </div>
                <h2 className="text-2xl font-semibold leading-tight text-white md:text-4xl">
                  Controle, acompanhe e valide linhas telefônicas da empresa com uma base centralizada e auditável.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  O Lines Manager foi desenhado para empresas que precisam organizar linhas corporativas, acompanhar custos, manter o cadastro atualizado e operar com clareza entre times internos, gestão e consultoria. A proposta é transformar uma base dispersa em uma operação controlada, visível e confiável.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Visão rápida</div>
                <div className="mt-2 text-3xl font-bold text-white">Dashboard</div>
                <p className="mt-2 text-sm text-slate-300">Indicadores, status das linhas e visão consolidada da operação.</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Atualização controlada</div>
                <div className="mt-2 text-3xl font-bold text-white">Template</div>
                <p className="mt-2 text-sm text-slate-300">Importação padronizada para manter consistência e governança.</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Segurança</div>
                <div className="mt-2 text-3xl font-bold text-white">Perfis</div>
                <p className="mt-2 text-sm text-slate-300">Controle por perfil com rastreabilidade das alterações realizadas.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Módulo</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white"><BarChart3 className="h-4 w-4 text-sky-400" /> Dashboard</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Módulo</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white"><Layers3 className="h-4 w-4 text-sky-400" /> Gestão de linhas</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Módulo</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white"><FileSpreadsheet className="h-4 w-4 text-sky-400" /> Template Excel</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Módulo</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white"><ShieldCheck className="h-4 w-4 text-sky-400" /> Controle de acesso</div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="border-slate-700 bg-slate-900/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                  <BarChart3 className="h-5 w-5 text-sky-400" />
                  Dashboard analítico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Visualize status das linhas, distribuição da base e informações que ajudam a gestão a decidir com rapidez.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                  <FileSpreadsheet className="h-5 w-5 text-sky-400" />
                  Atualização por planilha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Trabalhe com template padronizado para cadastro em lote, reduzindo erro manual e acelerando atualização da base.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                  <ShieldCheck className="h-5 w-5 text-sky-400" />
                  Governança e segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Perfis de acesso, validação das alterações e rastreabilidade para gestão segura dos dados críticos da empresa.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                <Building2 className="h-5 w-5 text-sky-400" />
                Para quem o sistema foi pensado
              </h2>
              <div className="space-y-3 text-sm text-slate-300">
                <p><strong className="text-white">Operação:</strong> consulta, atualização e organização diária das linhas.</p>
                <p><strong className="text-white">Gestão:</strong> visão consolidada para tomar decisão com base em dados reais.</p>
                <p><strong className="text-white">Consultoria:</strong> análise da base, validação e organização estratégica.</p>
                <p><strong className="text-white">Administração:</strong> controle de permissões e processos mais críticos.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                <Workflow className="h-5 w-5 text-sky-400" />
                Como o fluxo funciona na prática
              </h2>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-sky-300">1. Entrada</div>
                  <p className="mt-2 text-sm text-slate-300">Cadastre manualmente ou use o template de planilha para alimentar a base.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-sky-300">2. Validação</div>
                  <p className="mt-2 text-sm text-slate-300">Revise status, custos e informações operacionais para consolidar a base.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-sky-300">3. Gestão</div>
                  <p className="mt-2 text-sm text-slate-300">Acompanhe os indicadores no dashboard e mantenha histórico confiável da operação.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-sky-400" />
              O que você consegue fazer no sistema
            </h2>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-start gap-2 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                Cadastrar, editar e validar linhas telefônicas por operação e contexto de uso.
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                Monitorar custos flutuantes e custos reais para gestão mais precisa de contratos.
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                Importar dados com governança e controle de permissões por perfil.
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                Trabalhar com uma base única e atualizada para operação, gestão e consultoria.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="font-semibold text-emerald-100">Resultado esperado com o Lines Manager</h3>
                <p className="mt-1 text-sm text-emerald-50/85">
                  Menos desorganização, mais rastreabilidade, atualização mais rápida da base e uma visão clara das linhas corporativas para tomada de decisão.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-300">Pronto para acessar? Entre com seu perfil e continue a gestão.</p>
            <Button onClick={() => setLocation('/login')} className="bg-sky-600 hover:bg-sky-500 text-white">
              Ir para o login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}