"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // Importei Button
import { Skeleton } from "@/components/ui/skeleton"
import { 
  TrendingUp, MapPin, Users, Activity, BarChart3, 
  ArrowUpRight, Snowflake, AlertCircle, CheckCircle2, 
  RefreshCcw, AlertTriangle, Package
} from "lucide-react"
import api from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils" // Utilitário padrão do shadcn

interface DashboardStats {
  kpis: {
    total_spaces: number;
    active_spaces: number;
    pending_spaces: number;
    pending_quotes?: number;
    new_partners: number;
    occupancy_rate: number;
  };
  top_cities: Array<{ name: string; count: number; trend: string }>;
  recent_activity: Array<{ id: number; text: string; subtext: string; time: string; status: string }>;
}

export const AdminIntermediationPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Estado de erro
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // Animação do botão refresh

  const loadStats = useCallback(async (showLoadingSkeleton = true) => {
    if (showLoadingSkeleton) setLoading(true);
    setError(false);
    
    try {
      // Pequeno delay artificial para o usuário PERCEBER que atualizou (UX Trick)
      if (!showLoadingSkeleton) setIsRefreshing(true);
      
      const [res] = await Promise.all([
        api.get('/admin/stats'),
        !showLoadingSkeleton ? new Promise(r => setTimeout(r, 800)) : null
      ]);

      setData(res.data);
    } catch (error) {
      console.error("Erro ao carregar stats:", error);
      setError(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // TELA DE ERRO (Caso a API falhe)
  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4 text-center animate-in fade-in">
            <div className="p-4 bg-red-50 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Falha ao carregar dados</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">Não foi possível conectar ao servidor de estatísticas. Verifique sua conexão.</p>
            </div>
            <Button onClick={() => loadStats(true)} variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" /> Tentar Novamente
            </Button>
        </div>
    )
  }

  // LOADING STATE
  if (loading || !data) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-7">
            <Skeleton className="col-span-4 h-80 rounded-xl" />
            <Skeleton className="col-span-3 h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* CABEÇALHO COM REFRESH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Visão da Plataforma</h2>
          <p className="text-slate-500">Métricas globais e saúde do marketplace.</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium px-3 py-1.5 hidden sm:flex">
                Tempo Real
            </Badge>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadStats(false)}
                disabled={isRefreshing}
                className="gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
            >
                <RefreshCcw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Espaços Ativos */}
        <Card 
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group border-slate-200"
            onClick={() => navigate('/dashboard?section=admin-spaces')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Espaços Ativos</CardTitle>
            <Snowflake className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.kpis.active_spaces}</div>
            <p className="text-xs text-slate-500 mt-1">De {data.kpis.total_spaces} cadastrados</p>
          </CardContent>
        </Card>

        {/* Card 2: Pendentes */}
        <Card 
            className={cn(
                "shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4",
                data.kpis.pending_spaces > 0 ? "border-l-amber-500 bg-amber-50/10" : "border-l-transparent"
            )}
            onClick={() => navigate('/dashboard?section=admin-spaces')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Pendentes</CardTitle>
            <Activity className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.kpis.pending_spaces}</div>
            <p className="text-xs text-amber-600 font-medium mt-1 group-hover:underline">
              {data.kpis.pending_spaces > 0 ? "Requer aprovação →" : "Fila zerada"}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Cotações Pendentes */}
        <Card
            className={cn(
                "shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4",
                (data.kpis.pending_quotes ?? 0) > 0 ? "border-l-sky-500 bg-sky-50/10" : "border-l-transparent"
            )}
            onClick={() => navigate('/dashboard?section=admin-quotes')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-sky-600 transition-colors">Cotações Pendentes</CardTitle>
            <Package className="h-4 w-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.kpis.pending_quotes ?? 0}</div>
            <p className="text-xs text-sky-600 font-medium mt-1 group-hover:underline">
              {(data.kpis.pending_quotes ?? 0) > 0 ? "Requer aprovação →" : "Fila zerada"}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Novos Parceiros */}
        <Card className="shadow-sm hover:shadow-md transition-all border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Novos Parceiros (30d)</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">+{data.kpis.new_partners}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Crescimento
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Taxa de Ocupação */}
        <Card className="shadow-sm hover:shadow-md transition-all border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxa de Ativação</CardTitle>
            <BarChart3 className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.kpis.occupancy_rate}%</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div 
                    className="h-full bg-sky-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${data.kpis.occupancy_rate}%` }}
                ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO INFERIOR */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* GRÁFICO DE BARRAS (Top Cidades) */}
        <Card className="col-span-4 shadow-sm border-slate-200 h-full">
          <CardHeader>
            <CardTitle>Oferta por Região</CardTitle>
            <CardDescription>Cidades com maior volume de espaços.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.top_cities.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm italic">
                    Ainda não há dados suficientes para gerar o gráfico.
                </div>
            ) : (
                <div className="space-y-5 mt-2">
                    {data.top_cities.map((city, i) => {
                        // Calcula porcentagem relativa ao maior valor para a barra ficar proporcional
                        const maxVal = Math.max(...data.top_cities.map(c => c.count));
                        const percentage = (city.count / maxVal) * 100;
                        
                        return (
                            <div key={i} className="space-y-1.5 group">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium text-slate-700">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" /> 
                                        {city.name}
                                    </div>
                                    <span className="text-slate-900 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                                        {city.count}
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-slate-800 rounded-full transition-all duration-1000 ease-out group-hover:bg-sky-600 relative" 
                                        style={{ width: `${percentage}%` }}
                                        title={`${city.count} espaços`}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
          </CardContent>
        </Card>

        {/* FEED DE ATIVIDADE RECENTE */}
        <Card className="col-span-3 shadow-sm border-slate-200 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Últimos Cadastros</CardTitle>
            <CardDescription>Atividade em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[400px] pr-2">
            <div className="space-y-1">
                {data.recent_activity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <Activity className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma atividade recente.</p>
                    </div>
                ) : (
                    data.recent_activity.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate(`/espaco/${item.id}`)}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                        >
                            <div className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                                item.status === 'aprovado' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-100' : 
                                item.status === 'rejeitado' ? 'bg-red-50 border-red-100 text-red-600 group-hover:bg-red-100' :
                                'bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-amber-100'
                            )}>
                                {item.status === 'aprovado' ? <CheckCircle2 className="h-4 w-4" /> : 
                                 item.status === 'rejeitado' ? <AlertCircle className="h-4 w-4" /> :
                                 <TrendingUp className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate group-hover:text-sky-700 transition-colors">
                                    {item.text}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{item.subtext}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap bg-white px-1.5 py-0.5 rounded-md border border-slate-100 group-hover:border-slate-200">
                                {item.time}
                            </span>
                        </div>
                    ))
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}