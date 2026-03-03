"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  History,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { format, parseISO, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Demandante {
  trade_name: string
  city?: string | null
  state?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  contact_name?: string | null
  active?: boolean
}

interface Ofertante {
  trade_name: string
  city?: string | null
  state?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  contact_name?: string | null
  active?: boolean
}

interface AdminQuote {
  id: number
  status: string
  price: number | null
  valid_until: string | null
  is_expired: boolean
  created_at: string
  pending_since?: string
  admin_approved_at?: string | null
  rejection_reason?: string | null
  deleted_at?: string | null
  storage_request: {
    id: number
    quantity: number
    demandante: Demandante
    company?: { trade_name: string }
  }
  space: {
    id: number
    name: string
    city: string
    state: string
    ofertante: Ofertante
    company?: { trade_name: string }
  }
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

const clearModalState = (
  setSelectedQuote: (v: AdminQuote | null) => void,
  setApprovedPrice: (v: string) => void,
  setRejectReason: (v: string) => void
) => {
  setSelectedQuote(null)
  setApprovedPrice("")
  setRejectReason("")
}

type QuoteTab = "pendentes" | "aprovadas" | "rejeitadas"

export const AdminQuotesPanel = () => {
  const [activeTab, setActiveTab] = useState<QuoteTab>("pendentes")
  const [quotes, setQuotes] = useState<AdminQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null)
  const [approvedPrice, setApprovedPrice] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null)

  const getStatusParam = useCallback((tab: QuoteTab) => {
    if (tab === "pendentes") return "em_analise_admin"
    if (tab === "aprovadas") return "respondido,aceito"
    return "rejeitado"
  }, [])

  const loadQuotes = useCallback(
    async (page = 1, tab: QuoteTab = activeTab) => {
      try {
        setLoading(true)
        const response = await api.get("/admin/quotes", {
          params: { status: getStatusParam(tab), page },
        })
        const data = response.data.data || response.data || []
        setQuotes(Array.isArray(data) ? data : [])
        setPagination({
          current_page: response.data.current_page ?? page,
          last_page: response.data.last_page ?? 1,
          per_page: response.data.per_page ?? 15,
          total: response.data.total ?? 0,
          from: response.data.from ?? null,
          to: response.data.to ?? null,
        })
      } catch (error) {
        console.error("Erro ao carregar cotações:", error)
        toast.error("Não foi possível carregar as cotações.")
      } finally {
        setLoading(false)
      }
    },
    [getStatusParam, activeTab]
  )

  useEffect(() => {
    setCurrentPage(1)
    setExpandedQuoteId(null)
  }, [activeTab])

  useEffect(() => {
    loadQuotes(currentPage, activeTab)
  }, [loadQuotes, currentPage, activeTab])

  const openApproveDialog = (quote: AdminQuote) => {
    setSelectedQuote(quote)
    setApprovedPrice(quote.price ? String(quote.price) : "")
    setApproveDialogOpen(true)
  }

  const openRejectDialog = (quote: AdminQuote) => {
    setSelectedQuote(quote)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const handleApproveDialogChange = (open: boolean) => {
    setApproveDialogOpen(open)
    if (!open) clearModalState(setSelectedQuote, setApprovedPrice, setRejectReason)
  }

  const handleRejectDialogChange = (open: boolean) => {
    setRejectDialogOpen(open)
    if (!open) clearModalState(setSelectedQuote, setApprovedPrice, setRejectReason)
  }

  const handleApprove = async () => {
    if (!selectedQuote) return
    const price = parseFloat(approvedPrice)
    if (isNaN(price) || price <= 0) {
      toast.error("Informe um valor válido.")
      return
    }
    try {
      setProcessingId(selectedQuote.id)
      await api.post(`/admin/quotes/${selectedQuote.id}/approve`, {
        approved_price: price,
      })
      toast.success("Proposta aprovada com sucesso.")
      handleApproveDialogChange(false)
      loadQuotes(currentPage)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message || "Erro ao aprovar.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedQuote) return
    try {
      setProcessingId(selectedQuote.id)
      await api.post(`/admin/quotes/${selectedQuote.id}/reject`, {
        reason: rejectReason || undefined,
      })
      toast.success("Proposta rejeitada.")
      handleRejectDialogChange(false)
      loadQuotes(currentPage)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message || "Erro ao rejeitar.")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading && quotes.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const totalPendentes = pagination?.total ?? quotes.length
  const isHistoryTab = activeTab === "aprovadas" || activeTab === "rejeitadas"

  const renderQuoteCard = (quote: AdminQuote, showActions: boolean) => {
    const demandante = quote.storage_request.demandante
    const ofertante = quote.space.ofertante
    const demandanteName = demandante?.trade_name ?? quote.storage_request.company?.trade_name ?? "Cliente"
    const ofertanteName = ofertante?.trade_name ?? quote.space.company?.trade_name ?? "Parceiro"
    const expired =
      quote.is_expired || (quote.valid_until && isPast(parseISO(quote.valid_until)))
    const demandanteInactive = (demandante as Demandante | undefined)?.active === false
    const ofertanteInactive = (ofertante as Ofertante | undefined)?.active === false
    const isExpanded = expandedQuoteId === quote.id

    return (
      <Card
        key={quote.id}
        className={`border-slate-200 transition-shadow hover:shadow-md ${
          expired && showActions ? "border-l-4 border-l-amber-500 bg-amber-50/30" : ""
        } ${demandanteInactive || ofertanteInactive ? "border-r-4 border-r-rose-200" : ""} ${
          activeTab === "aprovadas" ? "border-l-4 border-l-emerald-500" : ""
        } ${activeTab === "rejeitadas" ? "border-l-4 border-l-rose-500" : ""}`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">
                    <Building2 className="inline h-4 w-4 mr-1 text-slate-400" />
                    {quote.space.name}
                  </span>
                  {activeTab === "aprovadas" && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Aprovada
                    </Badge>
                  )}
                  {activeTab === "rejeitadas" && (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejeitada
                    </Badge>
                  )}
                  {expired && showActions && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Expirada
                    </Badge>
                  )}
                  {(demandanteInactive || ofertanteInactive) && (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                      Empresa inativa
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400 font-medium">Demandante: </span>
                    <span className="text-slate-700">{demandanteName}</span>
                    {demandante?.city && (
                      <span className="text-slate-500 ml-1">
                        · {demandante.city}/{demandante.state}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Ofertante: </span>
                    <span className="text-slate-700">{ofertanteName}</span>
                    {ofertante?.city && (
                      <span className="text-slate-500 ml-1">
                        · {ofertante.city}/{ofertante.state}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>{quote.storage_request.quantity} paletes</span>
                  <span>
                    Valor:{" "}
                    <span className="font-semibold text-slate-900">
                      {quote.price
                        ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(quote.price)
                        : "—"}
                    </span>
                  </span>
                  {quote.valid_until && (
                    <span>
                      Válido até{" "}
                      {format(parseISO(quote.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  )}
                  {showActions && quote.pending_since && (
                    <span className="text-slate-500 italic">Aguardando {quote.pending_since}</span>
                  )}
                  {isHistoryTab && quote.admin_approved_at && (
                    <span className="text-emerald-600">
                      Aprovada em {format(parseISO(quote.admin_approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
              {showActions ? (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => openRejectDialog(quote)}
                    disabled={!!processingId}
                  >
                    {processingId === quote.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    Rejeitar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => openApproveDialog(quote)}
                    disabled={expired || !!processingId}
                    title={expired ? "Proposta expirada" : ""}
                  >
                    {processingId === quote.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    )}
                    Aprovar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                  className="shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  {isExpanded ? "Recolher" : "Ver detalhes"}
                </Button>
              )}
            </div>
            {isHistoryTab && isExpanded && (
              <div className="border-t border-slate-100 pt-4 space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demandante?.contact_email && (
                    <a
                      href={`mailto:${demandante.contact_email}`}
                      className="flex items-center gap-1 text-sky-600 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      Demandante: {demandante.contact_email}
                    </a>
                  )}
                  {demandante?.contact_phone && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Phone className="h-4 w-4" />
                      {demandante.contact_phone}
                    </span>
                  )}
                  {ofertante?.contact_email && (
                    <a
                      href={`mailto:${ofertante.contact_email}`}
                      className="flex items-center gap-1 text-sky-600 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      Ofertante: {ofertante.contact_email}
                    </a>
                  )}
                  {ofertante?.contact_phone && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Phone className="h-4 w-4" />
                      {ofertante.contact_phone}
                    </span>
                  )}
                </div>
                {quote.admin_approved_at && (
                  <p className="text-slate-600">
                    <strong>Aprovada em:</strong>{" "}
                    {format(parseISO(quote.admin_approved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
                {quote.rejection_reason && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <p className="font-medium text-rose-800">Motivo da rejeição</p>
                    <p className="text-rose-700 mt-1">{quote.rejection_reason}</p>
                  </div>
                )}
                <p className="text-slate-500 text-xs">
                  Criada em {format(parseISO(quote.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Snowflake className="h-8 w-8 text-sky-600" />
            Aprovação de Propostas
          </h1>
          <p className="text-slate-500 mt-1">
            {activeTab === "pendentes"
              ? totalPendentes === 0
                ? "Nenhuma proposta aguardando aprovação."
                : `${totalPendentes} proposta(s) aguardando sua análise.`
              : activeTab === "aprovadas"
                ? "Histórico de propostas aprovadas pela plataforma."
                : "Histórico de propostas rejeitadas pela plataforma."}
          </p>
        </div>
        {activeTab === "pendentes" && (
          <Badge variant="secondary" className="text-base px-4 py-2">
            {totalPendentes} pendente(s)
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as QuoteTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="aprovadas" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aprovadas
          </TabsTrigger>
          <TabsTrigger value="rejeitadas" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejeitadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-6">
          {quotes.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-80" />
                <p className="text-slate-600 font-medium">Fila zerada</p>
                <p className="text-sm text-slate-500 mt-1">Todas as propostas foram processadas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => renderQuoteCard(quote, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aprovadas" className="mt-6">
          {quotes.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-16 text-center">
                <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Nenhuma proposta aprovada</p>
                <p className="text-sm text-slate-500 mt-1">As propostas aprovadas aparecerão aqui.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => renderQuoteCard(quote, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejeitadas" className="mt-6">
          {quotes.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-16 text-center">
                <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Nenhuma proposta rejeitada</p>
                <p className="text-sm text-slate-500 mt-1">As propostas rejeitadas aparecerão aqui.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => renderQuoteCard(quote, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            Página {pagination.current_page} de {pagination.last_page} ({pagination.total} no total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.current_page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={pagination.current_page >= pagination.last_page || loading}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={approveDialogOpen} onOpenChange={handleApproveDialogChange}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Aprovar proposta</DialogTitle>
            <DialogDescription>
              Você pode ajustar o valor antes de aprovar. O demandante receberá a proposta com este valor.
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Valor aprovado (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={approvedPrice}
                  onChange={(e) => setApprovedPrice(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => handleApproveDialogChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={!approvedPrice || parseFloat(approvedPrice) <= 0}>
              {processingId === selectedQuote?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={handleRejectDialogChange}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Rejeitar proposta</DialogTitle>
            <DialogDescription>
              Informe um motivo opcional. O ofertante será notificado e poderá enviar nova proposta.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo da rejeição (opcional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleRejectDialogChange(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              {processingId === selectedQuote?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
