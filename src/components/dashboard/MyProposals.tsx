"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input" 
import { useToast } from "@/hooks/use-toast"
import { 
  Check, X, MapPin, Search, FileText,
  ArrowRight, User, Building2, Clock, 
  DollarSign, Snowflake, ArrowUpRight, ArrowDownLeft,
  CircleDot, ChevronDown, ChevronUp, Loader2
} from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ResponseDialog } from "@/components/dashboard/ResponseDialog"
import { PaymentDialog } from "@/components/payment/PaymentDialog"
import { PaymentStatus as PaymentStatusComponent } from "@/components/payment/PaymentStatus"
import { PaymentStatus as PaymentStatusEnum } from "@/types/payment"
import { usePayment } from "@/hooks/usePayment"
import { useNavigate } from "react-router-dom"

// --- TYPES ---
interface QuoteHistory {
  id: number
  action: string
  description: string
  company_name: string
  created_at: string
}

interface Proposal {
  id: number
  status: 'solicitado' | 'em_analise_admin' | 'respondido' | 'aceito' | 'rejeitado'
  price: number | null
  valid_until: string | null
  is_expired: boolean 
  created_at: string
  rejection_reason?: string
  payment_id?: number | null
  payment?: {
    id: number
    status: string
    payment_method: string | null
    formatted_amount: string
  } | null
  histories: QuoteHistory[]
  space: { 
    id: number
    company_id: number
    name: string
    city: string
    state: string
    company: { trade_name: string }
  }
  storage_request: { 
    id: number
    company_id: number
    product_type: string
    description: string
    quantity: number
    company: { trade_name: string }
  }
}

interface ApiError {
  response?: { data?: { message?: string } }
}

export const MyProposals = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("") 
  
  const [responseModalOpen, setResponseModalOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const { createPayment, getPayment } = usePayment()

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get("/quotes")
      const data = response.data.data || response.data || []
      setProposals(data)
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar propostas.", variant: "destructive" })
    } finally {
      setTimeout(() => setLoading(false), 300)
    }
  }, [toast])

  useEffect(() => {
    if (user) fetchProposals()
  }, [user, fetchProposals])

  const handleDownloadPDF = async (id: number) => {
    try {
      const response = await api.get(`/quotes/${id}/contract`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-ficafrio-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    }
  }

  const handleDecision = async (id: number, decision: 'Aceito' | 'Rejeitado') => {
    try {
      setProcessingId(id)
      const statusToSend = decision.toLowerCase() as Proposal['status']
      await api.put(`/quotes/${id}`, { status: statusToSend })
      fetchProposals()
      const isSuccess = decision === 'Aceito'
      toast({ 
        title: isSuccess ? "Alocação Confirmada! ❄️" : "Proposta Recusada",
        description: isSuccess ? "O dono da câmara foi notificado." : "Processo encerrado.",
        className: isSuccess ? "bg-emerald-50 text-emerald-900 border-emerald-200" : ""
      })
    } catch (err: unknown) {
      const error = err as ApiError;
      toast({ title: "Erro", description: error.response?.data?.message || "Erro ao atualizar.", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handlePartnerReject = async (id: number) => {
    if (!confirm("Deseja realmente recusar esta solicitação?")) return;
    try {
      setProcessingId(id);
      await api.put(`/quotes/${id}`, { status: 'rejeitado', rejection_reason: 'Recusado pelo parceiro.' });
      fetchProposals();
      toast({ title: "Sucesso", description: "Solicitação recusada." });
    } catch {
      toast({ title: "Erro", description: "Falha ao recusar.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handlePartnerWithdraw = async (id: number) => {
    if (!confirm("Deseja retirar esta proposta? Ela ainda está em análise pela plataforma.")) return;
    try {
      setProcessingId(id);
      await api.delete(`/quotes/${id}`);
      fetchProposals();
      toast({ title: "Proposta retirada", description: "Você poderá enviar nova proposta para esta demanda." });
    } catch (err: unknown) {
      const error = err as ApiError;
      toast({ title: "Erro", description: error.response?.data?.message || "Falha ao retirar.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const term = searchTerm.toLowerCase();
      return (
        p.space.name.toLowerCase().includes(term) || 
        p.storage_request.company.trade_name.toLowerCase().includes(term) ||
        p.storage_request.product_type.toLowerCase().includes(term)
      );
    });
  }, [proposals, searchTerm])

  const sentProposals = filteredProposals.filter(p => p.storage_request?.company_id === user?.id)
  const receivedProposals = filteredProposals.filter(p => p.space?.company_id === user?.id)

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Snowflake className="h-8 w-8 text-sky-600" /> 
            Gestão de Alocações
          </h1>
          <p className="text-slate-500 mt-1 ml-11">Acompanhe suas negociações de armazenagem.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Buscar por empresa ou espaço..." 
            className="pl-10 bg-white border-slate-200 focus-visible:ring-sky-500" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full sm:w-[500px] grid-cols-2 bg-slate-100 p-1 mb-8 rounded-xl">
          <TabsTrigger value="sent" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-700 py-2.5 transition-all">
            <ArrowUpRight className="h-4 w-4" /> Minhas Solicitações
          </TabsTrigger>
          <TabsTrigger value="received" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 py-2.5 transition-all">
            <ArrowDownLeft className="h-4 w-4" /> Propostas Recebidas
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <ProposalSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <TabsContent value="sent" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {sentProposals.length === 0 ? (
                <EmptyState title="Nenhuma solicitação" message="Você ainda não solicitou espaço." actionLabel="Buscar Espaços" onAction={() => navigate('/buscar')} />
              ) : (
                sentProposals.map(proposal => (
                  <ProposalCard 
                    key={proposal.id} 
                    proposal={proposal} 
                    viewType="client" 
                    onClientDecision={handleDecision} 
                    onDownload={handleDownloadPDF}
                    loadingId={processingId} 
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="received" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {receivedProposals.length === 0 ? (
                <EmptyState title="Caixa vazia" message="Ninguém solicitou seu espaço ainda." actionLabel="Dashboard" onAction={() => navigate('/dashboard?section=home')} />
              ) : (
                receivedProposals.map(proposal => (
                  <ProposalCard 
                    key={proposal.id} 
                    proposal={proposal} 
                    viewType="partner" 
                    onRespond={() => {setSelectedProposal(proposal); setResponseModalOpen(true)}} 
                    onPartnerReject={handlePartnerReject}
                    onPartnerWithdraw={handlePartnerWithdraw}
                    loadingId={processingId} 
                  />
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {selectedProposal && (
        <ResponseDialog 
          open={responseModalOpen} onOpenChange={setResponseModalOpen}
          quoteId={selectedProposal.id} clientName={selectedProposal.storage_request?.company?.trade_name || 'Solicitante'}
          onSuccess={fetchProposals}
        />
      )}

      {selectedPayment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          payment={selectedPayment}
          onSuccess={() => {
            fetchProposals()
            setSelectedPayment(null)
          }}
        />
      )}
    </div>
  )
}

// --- COMPONENTES INTERNOS ---

const ProposalTimeline = ({ histories }: { histories: QuoteHistory[] }) => {
  if (!histories || histories.length === 0) return null;
  return (
    <div className="mt-6 border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-top-2">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Clock className="w-3 h-3" /> Histórico da Negociação
      </h4>
      <div className="space-y-6 ml-2">
        {histories.map((event, idx) => (
          <div key={event.id} className="relative flex gap-4">
            {idx !== histories.length - 1 && <span className="absolute left-[7px] top-4 w-px h-[calc(100%+1.5rem)] bg-slate-200" />}
            <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
              <CircleDot className={cn("h-3.5 w-3.5", idx === 0 ? "text-sky-500 fill-sky-50" : "text-slate-300 fill-white")} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">{event.company_name}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {format(new Date(event.created_at), "HH:mm 'em' dd/MM", { locale: ptBR })}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const EmptyState = ({ title, message, actionLabel, onAction }: { title: string, message: string, actionLabel: string, onAction: () => void }) => (
  <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-16 flex flex-col items-center text-center shadow-none">
    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
      <Snowflake className="h-8 w-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">{message}</p>
    <Button onClick={onAction} variant="outline" className="bg-white">{actionLabel}</Button>
  </Card>
)

interface ProposalCardProps {
  proposal: Proposal
  viewType: 'client' | 'partner'
  onRespond?: () => void
  onPartnerReject?: (id: number) => void
  onPartnerWithdraw?: (id: number) => void
  onClientDecision?: (id: number, decision: 'Aceito' | 'Rejeitado') => void
  onDownload?: (id: number) => void
  loadingId: number | null
}

const ProposalCard = ({ proposal, viewType, onRespond, onPartnerReject, onPartnerWithdraw, onClientDecision, onDownload, loadingId }: ProposalCardProps) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const isClosed = proposal.status === 'aceito';
  const isPendingAdmin = proposal.status === 'em_analise_admin';

  const statusConfig = {
    solicitado: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Aguardando Resposta", icon: Clock },
    em_analise_admin: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Em análise pela plataforma", icon: Clock },
    respondido: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Preço Definido", icon: DollarSign },
    aceito: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Alocado", icon: Check },
    rejeitado: { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", label: "Cancelado", icon: X },
  }[proposal.status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: proposal.status, icon: FileText };

  const StatusIcon = statusConfig.icon

  return (
    <Card className={cn("group relative overflow-hidden transition-all duration-300 hover:shadow-md border-slate-200", 
      proposal.status === 'solicitado' && viewType === 'partner' && "border-l-4 border-l-indigo-500",
      isClosed && "border-l-4 border-l-emerald-500"
    )}>
      <CardHeader className="pb-3 pt-5 border-b border-slate-50 bg-slate-50/30">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", viewType === 'partner' ? "bg-indigo-100 text-indigo-700" : "bg-sky-100 text-sky-700")}>
              {viewType === 'partner' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{viewType === 'partner' ? 'Solicitado por' : 'Câmara Fria'}</div>
              <h3 className="font-bold text-slate-800 text-lg">
                {viewType === 'partner' ? proposal.storage_request?.company?.trade_name : proposal.space?.name}
              </h3>
            </div>
          </div>
          <Badge variant="outline" className={cn("px-3 py-1 font-semibold border", statusConfig.bg, statusConfig.text, statusConfig.border)}>
            <StatusIcon className="w-3 h-3 mr-1.5" /> {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Volume & Carga</span>
              <p className="font-semibold text-slate-700 text-lg mt-1">
                {proposal.storage_request?.quantity || 0} Paletes | <span className="text-base text-slate-600 uppercase">{proposal.storage_request?.product_type?.replace('_', ' ')}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-md w-fit">
              <MapPin className="h-4 w-4 text-rose-500" /> {proposal.space?.city} - {proposal.space?.state}
            </div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Valor Alocação</span>
              {proposal.price ? (
                <div className="mt-1">
                  <div className={cn("text-2xl font-bold", proposal.is_expired ? "text-slate-400 line-through" : "text-slate-800")}>
                    R$ {proposal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  {proposal.valid_until && (
                    <Badge variant="outline" className={cn("mt-1", proposal.is_expired ? "border-red-200 text-red-600 bg-red-50" : "border-emerald-100 text-emerald-600")}>
                       {proposal.is_expired ? "Orçamento Expirado" : `Válido até ${format(new Date(proposal.valid_until), "dd/MM")}`}
                    </Badge>
                  )}
                </div>
              ) : <div className="mt-2 text-sm text-slate-400 italic">Aguardando preço...</div>}
            </div>
            <div className="flex gap-3 mt-6">
              {viewType === 'partner' && proposal.status === 'solicitado' && (
                <>
                  <Button variant="outline" onClick={() => onPartnerReject?.(proposal.id)} disabled={loadingId === proposal.id}>
                    {loadingId === proposal.id ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
                    Recusar
                  </Button>
                  <Button onClick={onRespond} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    Enviar Preço <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
              {viewType === 'partner' && proposal.status === 'em_analise_admin' && (
                <Button
                  variant="outline"
                  className="text-amber-700 border-amber-200 hover:bg-amber-50"
                  onClick={() => onPartnerWithdraw?.(proposal.id)}
                  disabled={loadingId === proposal.id}
                >
                  {loadingId === proposal.id ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
                  Retirar proposta
                </Button>
              )}
              {viewType === 'client' && proposal.status === 'em_analise_admin' && (
                <Button variant="secondary" disabled className="bg-sky-50 text-sky-600 cursor-not-allowed">
                  Aguardando aprovação da plataforma
                </Button>
              )}
              {viewType === 'client' && proposal.status === 'respondido' && (
                <>
                  <Button variant="outline" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => onClientDecision?.(proposal.id, 'Rejeitado')} disabled={loadingId === proposal.id}>Recusar</Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" 
                    onClick={() => onClientDecision?.(proposal.id, 'Aceito')} 
                    disabled={loadingId === proposal.id || proposal.is_expired}
                  >
                    {loadingId === proposal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    {proposal.is_expired ? "Indisponível" : "Fechar Negócio"}
                  </Button>
                </>
              )}
              {isClosed && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onDownload?.(proposal.id)} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <FileText className="w-4 h-4 mr-2" /> Contrato PDF
                  </Button>
                  <Button variant="secondary" className="bg-emerald-50 text-emerald-700 cursor-default border border-emerald-100">Alocação Confirmada</Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center border-t border-slate-50 pt-4">
          <button onClick={() => setShowTimeline(!showTimeline)} className="text-[11px] font-bold text-slate-400 hover:text-sky-600 flex items-center gap-1.5 transition-all">
            {showTimeline ? <><ChevronUp className="w-3 h-3" /> Ocultar histórico</> : <><ChevronDown className="w-3 h-3" /> Ver histórico da negociação</>}
          </button>
        </div>
        {showTimeline && <ProposalTimeline histories={proposal.histories} />}
      </CardContent>
    </Card>
  )
}

const ProposalSkeleton = () => (
  <div className="border border-slate-100 rounded-xl p-6 bg-white space-y-4 shadow-sm mb-4">
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-lg bg-slate-100" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-slate-200" />
          <Skeleton className="h-3 w-24 bg-slate-100" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-full bg-slate-100" />
    </div>
    <Skeleton className="h-20 w-full rounded-lg bg-slate-50" />
  </div>
)