"use client"

import { useMemo, memo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Payment } from "@/types/payment"
import { PaymentStatus, PaymentStatus as PaymentStatusEnum } from "@/types/payment"
import { PaymentStatus as PaymentStatusComponent } from "./PaymentStatus"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  DollarSign, 
  User, 
  Building2, 
  CreditCard,
  FileText,
  QrCode,
  Copy,
  ExternalLink,
  Clock,
  CircleDot,
  FileText as FileTextIcon,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface PaymentDetailsProps {
  payment: Payment
  onPayClick?: (payment: Payment) => void
}

function PaymentDetailsComponent({ payment, onPayClick }: PaymentDetailsProps) {
  const navigate = useNavigate()

  // Gera histórico de eventos do pagamento
  const paymentHistory = useMemo(() => {
    const events: Array<{ date: Date; label: string; description: string; status: PaymentStatus }> = []
    
    if (payment.created_at) {
      events.push({
        date: new Date(payment.created_at),
        label: 'Pagamento Criado',
        description: 'Pagamento foi criado automaticamente após aceitação da cotação',
        status: PaymentStatus.Pending
      })
    }

    if (payment.paid_at) {
      events.push({
        date: new Date(payment.paid_at),
        label: 'Pagamento Confirmado',
        description: 'Pagamento foi confirmado e processado com sucesso',
        status: PaymentStatus.Paid
      })
    }

    if (payment.status === PaymentStatusEnum.Failed) {
      events.push({
        date: new Date(payment.updated_at),
        label: 'Pagamento Falhou',
        description: 'O pagamento não foi processado com sucesso',
        status: PaymentStatus.Failed
      })
    }

    if (payment.status === PaymentStatusEnum.Refunded) {
      events.push({
        date: new Date(payment.updated_at),
        label: 'Pagamento Reembolsado',
        description: 'O pagamento foi reembolsado',
        status: PaymentStatus.Refunded
      })
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [payment])

  const handleCopyCode = async () => {
    if (payment.payment_code) {
      try {
        await navigator.clipboard.writeText(payment.payment_code)
        toast.success('Código copiado!')
      } catch {
        toast.error('Erro ao copiar código')
      }
    }
  }

  const handleOpenPaymentUrl = () => {
    if (payment.payment_url) {
      window.location.href = payment.payment_url
    }
  }

  const handleViewQuote = () => {
    navigate(`/dashboard?section=proposals`)
  }

  const getMethodIcon = () => {
    switch (payment.payment_method) {
      case 'pix':
        return QrCode
      case 'credit_card':
        return CreditCard
      case 'boleto':
        return FileText
      default:
        return DollarSign
    }
  }

  const MethodIcon = getMethodIcon()

  return (
    <div className="space-y-6 bg-white">
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader className="pb-3 pt-5 border-b border-slate-50 bg-slate-50/30">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 mb-1">
                  Pagamento #{payment.id}
                </CardTitle>
                <div className="text-xs text-slate-400 font-semibold">
                  Criado em {format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>
            <PaymentStatusComponent status={payment.status} />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* CTA: Iniciar pagamento (Pending sem payment_url) */}
          {payment.status === PaymentStatusEnum.Pending && !payment.is_expired && !payment.payment_url && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-3">
              <p className="text-sm font-medium text-sky-800">
                Escolha a forma de pagamento para prosseguir.
              </p>
              {onPayClick ? (
                <Button
                  onClick={() => onPayClick(payment)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Escolher forma de pagamento
                </Button>
              ) : (
                <p className="text-xs text-slate-500">Use a lista de pagamentos para iniciar o pagamento.</p>
              )}
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                Valor Total
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {payment.formatted_amount}
              </div>
            </div>
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
              <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">
                Taxa (10%)
              </div>
              <div className="text-2xl font-black text-amber-700 tracking-tight">
                {payment.formatted_fee}
              </div>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
              <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">
                Valor Líquido
              </div>
              <div className="text-2xl font-black text-emerald-700 tracking-tight">
                {payment.formatted_net_amount}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Link para Quote */}
          {payment.quote && (
            <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">
                    Cotação Relacionada
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    Cotação #{payment.quote.id} - {payment.quote.status}
                  </div>
                </div>
                <Button
                  onClick={handleViewQuote}
                  variant="outline"
                  size="sm"
                  className="border-sky-200 text-sky-700 hover:bg-sky-100"
                >
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Ver Cotação
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          <Separator className="bg-slate-100" />

          {/* Informações do Pagamento */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Informações do Pagamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Método de Pagamento</div>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {payment.payment_method && <MethodIcon className="h-5 w-5 text-slate-600" />}
                  {payment.payment_method_label || 'Não selecionado'}
                </div>
              </div>
              
              {payment.gateway && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Gateway</div>
                  <div className="font-bold text-slate-800">{payment.gateway}</div>
                </div>
              )}

              {payment.gateway_transaction_id && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">ID da Transação</div>
                  <div className="font-mono text-sm text-slate-800 font-semibold break-all">{payment.gateway_transaction_id}</div>
                </div>
              )}

              {payment.expires_at && (
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                  <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">Válido até</div>
                  <div className="font-bold text-amber-700">
                    {format(new Date(payment.expires_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              )}

              {payment.paid_at && (
                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                  <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">Pago em</div>
                  <div className="font-bold text-emerald-700">
                    {format(new Date(payment.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Código de Pagamento */}
          {payment.payment_code && (
            <>
              <Separator className="bg-slate-100" />
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Código de Pagamento</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono break-all text-slate-800 bg-white p-3 rounded border border-slate-200">
                      {payment.payment_code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-10 w-10 p-0 hover:bg-slate-100"
                    >
                      <Copy className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Continuar para pagamento seguro (payment_url existe; Pending ou Processing) */}
          {payment.payment_url && (payment.status === PaymentStatusEnum.Pending || payment.status === PaymentStatusEnum.Processing) && !payment.is_expired && (
            <>
              <Separator className="bg-slate-100" />
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-800">Continuar para pagamento seguro</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Você será redirecionado ao ambiente seguro para concluir o pagamento.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleOpenPaymentUrl}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold h-11"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continuar para pagamento seguro
                </Button>
              </div>
            </>
          )}

          {/* Link de Pagamento (outros casos: já tem URL mas não é Pending/Processing) */}
          {payment.payment_url && payment.status !== PaymentStatusEnum.Pending && payment.status !== PaymentStatusEnum.Processing && (
            <>
              <Separator className="bg-slate-100" />
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Link de Pagamento</h3>
                <Button
                  onClick={handleOpenPaymentUrl}
                  variant="outline"
                  className="w-full border-slate-200 hover:bg-slate-50 font-semibold h-11"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Link de Pagamento
                </Button>
              </div>
            </>
          )}

          <Separator className="bg-slate-100" />

          {/* Partes Envolvidas */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Partes Envolvidas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Quem Paga</div>
                  <div className="font-bold text-slate-800">{payment.payer.trade_name}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Quem Recebe</div>
                  <div className="font-bold text-slate-800">{payment.space_owner.trade_name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico de Eventos */}
          {paymentHistory.length > 0 && (
            <>
              <Separator className="bg-slate-100" />
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Histórico do Pagamento
                </h3>
                <div className="space-y-4 ml-2">
                  {paymentHistory.map((event, idx) => (
                    <div key={idx} className="relative flex gap-4">
                      {idx !== paymentHistory.length - 1 && (
                        <span className="absolute left-[7px] top-4 w-px h-[calc(100%+1rem)] bg-slate-200" />
                      )}
                      <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                        <CircleDot
                          className={cn(
                            "h-3.5 w-3.5",
                            idx === paymentHistory.length - 1
                              ? "text-sky-500 fill-sky-50"
                              : "text-slate-300 fill-white"
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700">{event.label}</span>
                          <span className="text-xs text-slate-400 font-medium">
                            {format(event.date, "HH:mm 'em' dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Memoização para performance
export const PaymentDetails = memo(PaymentDetailsComponent)

