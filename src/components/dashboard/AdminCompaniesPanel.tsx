"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Loader2,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Package,
  Snowflake,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AdminCompany {
  id: number
  trade_name: string
  legal_name: string
  cnpj: string
  type: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  active: boolean
  created_at: string
  spaces_count: number
  storage_requests_count: number
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface CompanyQuote {
  id: number
  status: string
  price: number | null
  valid_until: string | null
  admin_approved_at?: string | null
  rejection_reason?: string | null
  created_at: string
  storage_request: { quantity: number; demandante?: { trade_name: string }; company?: { trade_name: string } }
  space: { name: string; city: string; state: string; ofertante?: { trade_name: string }; company?: { trade_name: string } }
}

export const AdminCompaniesPanel = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [quotesSheetOpen, setQuotesSheetOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null)
  const [companyQuotes, setCompanyQuotes] = useState<CompanyQuote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)

  const loadCompanies = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const response = await api.get("/admin/companies", {
          params: { page, search: searchTerm || undefined },
        })
        const data = response.data.data || response.data || []
        setCompanies(Array.isArray(data) ? data : [])
        setPagination({
          current_page: response.data.current_page ?? page,
          last_page: response.data.last_page ?? 1,
          per_page: response.data.per_page ?? 20,
          total: response.data.total ?? 0,
        })
      } catch (error) {
        console.error("Erro ao carregar empresas:", error)
        toast.error("Não foi possível carregar as empresas.")
      } finally {
        setLoading(false)
      }
    },
    [searchTerm]
  )

  useEffect(() => {
    loadCompanies(currentPage)
  }, [loadCompanies, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadCompanies(1)
  }

  const openCompanyQuotes = useCallback(async (company: AdminCompany) => {
    setSelectedCompany(company)
    setQuotesSheetOpen(true)
    setQuotesLoading(true)
    try {
      const response = await api.get(`/admin/companies/${company.id}/quotes`)
      const data = response.data.data || response.data || []
      setCompanyQuotes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao carregar propostas da empresa:", error)
      toast.error("Não foi possível carregar as propostas.")
      setCompanyQuotes([])
    } finally {
      setQuotesLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8 text-sky-600" />
            Empresas
          </h1>
          <p className="text-slate-500 mt-1">
            Listagem de todas as empresas cadastradas na plataforma.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, CNPJ, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
      </div>

      {loading && companies.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Nenhuma empresa encontrada</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm ? "Tente outro termo de busca." : "Ainda não há empresas cadastradas."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{company.trade_name}</h3>
                      {company.type === "admin" && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      {!company.active && (
                        <Badge variant="outline" className="text-rose-600 border-rose-200">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{company.legal_name}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {company.email && (
                        <a
                          href={`mailto:${company.email}`}
                          className="flex items-center gap-1 text-sky-600 hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {company.email}
                        </a>
                      )}
                      {company.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {company.phone}
                        </span>
                      )}
                      {company.city && company.state && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {company.city}/{company.state}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Snowflake className="h-3.5 w-3.5" />
                        {company.spaces_count} espaço(s)
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {company.storage_requests_count} demanda(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCompanyQuotes(company)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Ver propostas
                    </Button>
                    <div className="text-right text-sm text-slate-500">
                      <p>CNPJ: {company.cnpj}</p>
                      <p className="mt-1">
                        Cadastro: {format(parseISO(company.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      <Sheet open={quotesSheetOpen} onOpenChange={setQuotesSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle>Propostas da empresa</SheetTitle>
            <SheetDescription>
              {selectedCompany?.trade_name} — cotações aprovadas e rejeitadas
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {quotesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : companyQuotes.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Nenhuma proposta aprovada ou rejeitada para esta empresa.
              </p>
            ) : (
              <div className="space-y-3">
                {companyQuotes.map((q) => {
                  const demandante = q.storage_request.demandante?.trade_name ?? q.storage_request.company?.trade_name ?? "Cliente"
                  const ofertante = q.space.ofertante?.trade_name ?? q.space.company?.trade_name ?? "Parceiro"
                  const isApproved = q.status === "respondido" || q.status === "aceito"
                  return (
                    <Card key={q.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-slate-900">{q.space.name}</p>
                            <p className="text-slate-600">
                              {demandante} ↔ {ofertante}
                            </p>
                            <p className="text-slate-500">
                              {q.storage_request.quantity} paletes ·{" "}
                              {q.price
                                ? new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(q.price)
                                : "—"}
                            </p>
                            {q.admin_approved_at && (
                              <p className="text-xs text-emerald-600">
                                Aprovada em {format(parseISO(q.admin_approved_at), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            )}
                            {q.rejection_reason && (
                              <div className="mt-2 bg-rose-50 rounded p-2 text-xs text-rose-700">
                                {q.rejection_reason}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={isApproved ? "default" : "destructive"}
                            className={isApproved ? "bg-emerald-600" : ""}
                          >
                            {isApproved ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {isApproved ? "Aprovada" : "Rejeitada"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
