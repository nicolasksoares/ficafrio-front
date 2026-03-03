"use client"

import { useState, useCallback, memo } from "react"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { 
  Snowflake, 
  Package, 
  TrendingUp, 
  MapPin, 
  Users, 
  ShieldCheck, 
  FileDown,
  Loader2,
  Mail,
  Calendar,
  Building,
  Plus, 
  ArrowRight, 
  LayoutDashboard,
  Wallet,
  type LucideIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { DashboardStats } from "@/hooks/useDashboardStats"

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'amber' | 'green' | 'purple' | 'sky' | 'indigo' | 'gray';
  onClick?: () => void;
}

const DashboardHomeComponent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const { stats, loading, refetch } = useDashboardStats()

  // Função auxiliar para navegar entre abas do Dashboard
  const navigateToTab = (tab: string) => {
    // Navega para o dashboard com a seção na URL
    navigate(`/dashboard?section=${tab}`, { replace: true });
  }

  const handleExportUsers = async () => {
    try {
      setExporting(true)
      const response = await api.get("/admin/export-users", {
        responseType: "blob", 
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `usuarios_ficafrio_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Excel gerado com sucesso!")
    } catch (error) {
      console.error("Erro na exportação:", error)
      toast.error("Erro ao exportar usuários.")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        <p className="text-sm text-slate-500 font-medium">Carregando indicadores...</p>
      </div>
    )
  }

  // --- VISÃO DO ADMIN ---
  if (stats?.mode === 'admin') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Área Administrativa</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Parceiros</h1>
            <p className="text-slate-500">Controle de novos cadastros e base de usuários.</p>
          </div>
          
          <Button 
            onClick={handleExportUsers} 
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm transition-all"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {exporting ? "Gerando..." : "Exportar Usuários (Excel)"}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-none shadow-md h-full flex flex-col justify-between bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total de Empresas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-5xl font-black text-slate-900 block mb-1">
                                {stats?.totalCompanies || 0}
                            </span>
                            <span className="text-sm font-medium text-slate-400">Cadastros ativos</span>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="h-7 w-7" />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium">Ambiente Seguro</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2 border-none shadow-md bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-bold text-slate-800">Últimos Cadastros</CardTitle>
                            <CardDescription>Novas empresas que entraram na plataforma.</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-white">Recentes</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {stats.recentUsers && stats.recentUsers.length > 0 ? (
                            stats.recentUsers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            <Building className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{u.trade_name || "Sem nome"}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Mail className="h-3 w-3" /> {u.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                        <Calendar className="h-3 w-3" />
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm">Nenhum cadastro recente.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    )
  }

  // --- VISÃO DO USER (CLIENTE) ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header com Ações Rápidas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 border border-sky-200 rounded-full">
              <LayoutDashboard className="h-3.5 w-3.5 text-sky-700" />
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">Painel do Parceiro</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Olá, {user?.trade_name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-slate-500">Gerencie sua operação logística em um só lugar.</p>
        </div>
        
        <div className="flex gap-3">
             <Button onClick={() => navigateToTab('register-space')} className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> Novo Espaço
             </Button>
             <Button onClick={() => navigateToTab('register-need')} variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50">
                Nova Demanda
             </Button>
        </div>
      </div>

      {/* 2. Grid de KPIs Clicáveis */}
      <div className="grid md:grid-cols-4 gap-6">
        <UserStatCard 
          title="Meus Espaços" 
          value={stats?.totalSpaces || 0} 
          subtitle={stats?.totalSpaces === 0 ? "Comece agora" : `${stats?.activeSpaces || 0} ativos`}
          icon={Snowflake}
          color="sky"
          // Redireciona para MyOperations.tsx (id='operations' no Dashboard.tsx)
          onClick={() => navigateToTab('operations')} 
        />
        <UserStatCard 
          title="Minhas Demandas" 
          value={stats?.totalRequests || 0} 
          subtitle={stats?.totalRequests === 0 ? "Solicite cotação" : `${stats?.activeRequests || 0} ativas`}
          icon={Package}
          color="blue"
          // Redireciona para RegisterNeed.tsx (id='register-need' no Dashboard.tsx)
          onClick={() => navigateToTab('register-need')} 
        />
        <UserStatCard 
          title="Locais de Atuação" 
          value={stats?.totalCities || 0} 
          icon={MapPin}
          color="indigo"
          subtitle="Cidades"
          // Opcional: pode levar para busca ou operações
          onClick={() => navigateToTab('operations')}
        />
        <UserStatCard 
          title="Carteira" 
          value="R$ 0,00" 
          subtitle="Em breve"
          icon={Wallet}
          color="gray"
        />
      </div>

      {/* 3. Seção de Incentivo (Se não tiver dados) */}
      {stats?.totalSpaces === 0 && stats?.totalRequests === 0 && (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
             <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                 <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <TrendingUp className="h-8 w-8 text-sky-500" />
                 </div>
                 <div className="max-w-md space-y-2">
                     <h3 className="text-lg font-bold text-slate-900">Impulsione seu negócio hoje</h3>
                     <p className="text-slate-500 text-sm">Você ainda não tem operações ativas. Cadastre seu galpão para receber ofertas ou publique uma demanda de armazenagem.</p>
                 </div>
                 <Button onClick={() => navigateToTab('register-space')} variant="link" className="text-sky-600 gap-2">
                    Cadastrar meu primeiro espaço <ArrowRight className="h-4 w-4" />
                 </Button>
             </CardContent>
          </Card>
      )}
    </div>
  )
}

// --- COMPONENTES AUXILIARES ---

const UserStatCard = ({ title, value, subtitle, icon: Icon, color, onClick }: StatCardProps) => {
  const colors: Record<string, { bg: string, text: string, border: string }> = {
    sky: { bg: "bg-sky-50", text: "text-sky-600", border: "group-hover:border-sky-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "group-hover:border-blue-200" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "group-hover:border-indigo-200" },
    gray: { bg: "bg-gray-50", text: "text-gray-600", border: "group-hover:border-gray-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "group-hover:border-amber-200" },
    green: { bg: "bg-green-50", text: "text-green-600", border: "group-hover:border-green-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "group-hover:border-purple-200" },
  }

  const theme = colors[color] || colors.sky

  return (
    <Card 
        onClick={onClick}
        className={`border-none shadow-sm transition-all duration-300 group bg-white ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
             <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${theme.bg} ${theme.text}`}>
                <Icon className="h-6 w-6" />
             </div>
             {onClick && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
                </div>
             )}
        </div>
        
        <div>
           <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1 mb-1">{title}</p>
           {subtitle && <p className={`text-xs font-semibold ${color === 'gray' ? 'text-slate-400' : 'text-sky-600'}`}>{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export const DashboardHome = memo(DashboardHomeComponent)