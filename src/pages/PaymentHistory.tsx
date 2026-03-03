import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PaymentCard } from "@/components/payment/PaymentCard"
import { PaymentDetails } from "@/components/payment/PaymentDetails"
import { PaymentDialog } from "@/components/payment/PaymentDialog"
import type { Payment } from "@/types/payment"
import { PaymentStatus, PaymentMethod } from "@/types/payment"
import { usePayment } from "@/hooks/usePayment"
import { Search, DollarSign, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type SortField = 'created_at' | 'amount' | 'status'
type SortOrder = 'asc' | 'desc'

export default function PaymentHistory() {
  const [searchParams] = useSearchParams()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentToPay, setPaymentToPay] = useState<Payment | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get("/payments")
      const data = response.data.data || response.data || []
      setPayments(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Refetch ao voltar do Stripe (payment_success ou payment_cancelled na URL)
  const returnFromPayment = searchParams.get('payment_success') || searchParams.get('payment_cancelled')
  useEffect(() => {
    if (returnFromPayment) {
      fetchPayments()
    }
  }, [returnFromPayment, fetchPayments])

  // Filtros e ordenação
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const matchesSearch = 
        payment.id.toString().includes(searchTerm) ||
        payment.payer.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.space_owner.trade_name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter
      const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter

      // Filtro por data
      let matchesDate = true
      if (dateFilter !== "all") {
        const paymentDate = new Date(payment.created_at)
        const now = new Date()
        const daysAgo = dateFilter === "today" ? 0 : dateFilter === "week" ? 7 : dateFilter === "month" ? 30 : 90
        const filterDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
        matchesDate = paymentDate >= filterDate
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDate
    })

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [payments, searchTerm, statusFilter, methodFilter, dateFilter, sortField, sortOrder])

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedPayments.length / itemsPerPage)
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedPayments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedPayments, currentPage, itemsPerPage])

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, methodFilter, dateFilter, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setDetailsOpen(true)
  }

  const handlePay = (payment: Payment) => {
    setPaymentToPay(payment)
    setPaymentDialogOpen(true)
    setDetailsOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-sky-600" />
            <h1 className="text-3xl font-bold text-slate-900">Histórico de Pagamentos</h1>
          </div>
          <p className="text-slate-600">Acompanhe todos os seus pagamentos e transações</p>
        </div>

        {/* Filtros e Ordenação */}
        <Card className="mb-6 bg-white">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar pagamentos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value={PaymentStatus.Pending}>Aguardando</SelectItem>
                  <SelectItem value={PaymentStatus.Processing}>Processando</SelectItem>
                  <SelectItem value={PaymentStatus.Paid}>Pago</SelectItem>
                  <SelectItem value={PaymentStatus.Failed}>Falhou</SelectItem>
                  <SelectItem value={PaymentStatus.Refunded}>Reembolsado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os métodos</SelectItem>
                  <SelectItem value={PaymentMethod.Pix}>PIX</SelectItem>
                  <SelectItem value={PaymentMethod.CreditCard}>Cartão</SelectItem>
                  <SelectItem value={PaymentMethod.Boleto}>Boleto</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                  <SelectItem value="quarter">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-slate-600 flex items-center justify-end">
                {filteredAndSortedPayments.length} {filteredAndSortedPayments.length === 1 ? 'pagamento' : 'pagamentos'}
              </div>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ordenar por:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('created_at')}
                className="h-8 text-xs"
              >
                Data
                {sortField === 'created_at' ? (
                  sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                ) : (
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('amount')}
                className="h-8 text-xs"
              >
                Valor
                {sortField === 'amount' ? (
                  sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                ) : (
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('status')}
                className="h-8 text-xs"
              >
                Status
                {sortField === 'status' ? (
                  sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                ) : (
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pagamentos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedPayments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Nenhum pagamento encontrado
              </h3>
              <p className="text-slate-500">
                {searchTerm || statusFilter !== "all" || methodFilter !== "all" || dateFilter !== "all"
                  ? "Tente ajustar os filtros"
                  : "Você ainda não possui pagamentos"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {paginatedPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onPay={() => handlePay(payment)}
                  onViewDetails={() => handleViewDetails(payment)}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )
                    }
                    return null
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Dialog de Detalhes */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedPayment && (
              <PaymentDetails
                payment={selectedPayment}
                onPayClick={(p) => {
                  setDetailsOpen(false)
                  setPaymentToPay(p)
                  setPaymentDialogOpen(true)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Pagamento (escolher método e processar) */}
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={(open) => {
            setPaymentDialogOpen(open)
            if (!open) setPaymentToPay(null)
          }}
          payment={paymentToPay}
          onSuccess={() => {
            fetchPayments()
            setPaymentDialogOpen(false)
            setPaymentToPay(null)
            setDetailsOpen(false)
          }}
        />
      </div>
    </div>
  )
}

