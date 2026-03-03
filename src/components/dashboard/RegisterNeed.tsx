"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, TrendingUp, ShieldCheck, Zap, BarChart3, MapPin, Calendar, Thermometer, DollarSign, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { NeedFormDialog } from "./NeedFormDialog"
import { MatchedSpaces } from "./MatchedSpaces"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

// Interface completa com todos os dados que vêm do Resource
interface StorageNeed {
  id: number | string;
  title: string;
  quantity: number;
  product_type: string;
  status: string;
  // Novos campos adicionados no Resource
  temp_min: number;
  temp_max: number;
  start_date: string;
  end_date: string;
  target_city: string;
  target_state: string;
  proposed_price?: number;
  unit: string;
}

const RegisterNeedComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [needs, setNeeds] = useState<StorageNeed[]>([]) 
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const loadNeeds = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get("/storage-requests")
      const data = response.data.data || response.data || []
      setNeeds(data)
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar demandas.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (user) loadNeeds()
  }, [user, loadNeeds])

  const handleSuccess = () => {
    setDialogOpen(false)
    loadNeeds()
    toast({
      title: "Demanda cadastrada!",
      description: "Estamos buscando parceiros compatíveis para sua carga.",
    })
  }

  // Helper para formatar moeda
  const formatCurrency = (value?: number) => {
    if (!value) return "Sob consulta";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Helper para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "--/--";
    return format(parseISO(dateString), "dd/MM/yy");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10 px-4">
      {/* Header */}
      <div className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Demandas de Carga</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Gerencie suas <span className="text-indigo-600">Necessidades</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Cadastre o que você precisa armazenar e nossa IA encontrará as câmaras frias ideais.
        </p>
      </div>

      {/* Botão de Nova Demanda */}
      <Card
        className="relative border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden bg-white shadow-xl shadow-indigo-100/50"
        onClick={() => setDialogOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="relative w-20 h-20 rounded-3xl bg-indigo-600 group-hover:bg-indigo-700 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-xl shadow-indigo-200">
            <Plus className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Solicitar Novo Armazenamento</h3>
          <p className="text-slate-500 max-w-md">
            Informe o tipo de produto, temperatura e quantidade para receber orçamentos instantâneos.
          </p>
        </CardContent>
      </Card>

      {/* Lista de Demandas */}
      <div className="space-y-12">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-[40px]" />
        ) : needs.length > 0 && (
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black uppercase text-slate-400 tracking-widest">Suas Solicitações Ativas</h2>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            
            {needs.map((need) => (
              <div key={need.id} className="space-y-0 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:border-indigo-200">
                
                {/* CABEÇALHO DO CARD (Resumo Visual) */}
                <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-emerald-500 font-black uppercase text-[10px] tracking-widest border-0 text-white hover:bg-emerald-600">
                          {need.status || 'Ativa'}
                        </Badge>
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                           <Package className="h-3 w-3" /> {need.product_type}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">
                        #{need.title}
                      </h2>
                    </div>
                    
                    {/* Preço Alvo em Destaque */}
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orçamento Alvo</span>
                        <span className="text-xl font-black text-slate-700">{formatCurrency(need.proposed_price)}</span>
                    </div>
                  </div>

                  {/* GRID DE ATRIBUTOS (Detalhes Completos) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Box className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Volume</p>
                            <p className="text-sm font-bold text-slate-700">{need.quantity} <span className="text-xs lowercase text-slate-400">{need.unit}</span></p>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                            <Thermometer className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Temp.</p>
                            <p className="text-sm font-bold text-slate-700">{need.temp_min}° a {need.temp_max}°C</p>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Destino</p>
                            <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]" title={`${need.target_city} - ${need.target_state}`}>
                                {need.target_city} - {need.target_state}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Período</p>
                            <p className="text-xs font-bold text-slate-700">
                                {formatDate(need.start_date)} até {formatDate(need.end_date)}
                            </p>
                        </div>
                    </div>
                  </div>
                </div>

                {/* ÁREA DE MATCHES (Resultado da Busca) */}
                <div className="p-8 bg-white">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Oportunidades Encontradas pela IA
                        </h3>
                    </div>
                    <MatchedSpaces needId={need.id} needTitle={need.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <BenefitCard icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />} title="Verificação" desc="Todos os espaços em nossa rede passam por auditoria técnica rigorosa." />
        <BenefitCard icon={<Zap className="w-5 h-5 text-amber-600" />} title="Match Instantâneo" desc="Nossa IA cruza dados de temperatura e logística em tempo real." />
        <BenefitCard icon={<BarChart3 className="w-5 h-5 text-emerald-600" />} title="Economia" desc="Reduza custos logísticos aproveitando espaços ociosos de parceiros." />
      </div>

      <NeedFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={handleSuccess} />
    </div>
  )
}

export const RegisterNeed = memo(RegisterNeedComponent)

// Icone Box auxiliar
const Box = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
)

const BenefitCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3 transition-all hover:shadow-md">
    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <h4 className="font-bold text-slate-800">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
)