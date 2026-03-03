"use client"

import { useMemo, useState, memo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Payment } from "@/types/payment"
import { PaymentStatus } from "@/types/payment"
import { PaymentStatus as PaymentStatusComponent } from "./PaymentStatus"
import { format, differenceInHours, differenceInMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DollarSign, Calendar, ExternalLink, Copy, AlertTriangle, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PaymentCardProps {
  payment: Payment
  onPay?: () => void
  onViewDetails?: () => void
  showActions?: boolean
  loading?: boolean
}

function PaymentCardComponent({
  payment,
  onPay,
  onViewDetails,
  showActions = true,
  loading = false,
}: PaymentCardProps) {
  const [copied, setCopied] = useState(false)

  // Calcula tempo até expiração
  const expirationInfo = useMemo(() => {
    if (!payment.expires_at || payment.status !== PaymentStatus.Pending) return null
    
    const now = new Date()
    const expiresAt = new Date(payment.expires_at)
    const hoursLeft = differenceInHours(expiresAt, now)
    const minutesLeft = differenceInMinutes(expiresAt, now)
    
    if (minutesLeft <= 0) return { urgent: true, text: 'Expirado', color: 'text-red-600 bg-red-50 border-red-200' }
    if (hoursLeft < 1) return { urgent: true, text: `${minutesLeft} min`, color: 'text-red-600 bg-red-50 border-red-200' }
    if (hoursLeft < 24) return { urgent: true, text: `${hoursLeft}h`, color: 'text-amber-600 bg-amber-50 border-amber-200' }
    if (hoursLeft < 48) return { urgent: false, text: `${hoursLeft}h`, color: 'text-amber-600 bg-amber-50/50 border-amber-100' }
    
    return null
  }, [payment.expires_at, payment.status])

  const handleCopyCode = async () => {
    if (payment.payment_code) {
      try {
        await navigator.clipboard.writeText(payment.payment_code)
        setCopied(true)
        toast.success('Código copiado!', { duration: 2000 })
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('Erro ao copiar código')
      }
    }
  }

  const handleOpenPaymentUrl = () => {
    if (payment.payment_url) {
      window.open(payment.payment_url, '_blank')
    }
  }

  const getTimeLeftTooltip = () => {
    if (!payment.expires_at || payment.status !== PaymentStatus.Pending) return null
    const now = new Date()
    const expiresAt = new Date(payment.expires_at)
    const hoursLeft = differenceInHours(expiresAt, now)
    const minutesLeft = differenceInMinutes(expiresAt, now)
    
    if (minutesLeft <= 0) return 'Este pagamento expirou'
    if (hoursLeft < 1) return `Expira em ${minutesLeft} minutos`
    if (hoursLeft < 24) return `Expira em ${hoursLeft} horas`
    return `Expira em ${format(expiresAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
  }

  return (
    <TooltipProvider>
      <Card className={cn(
        "group relative border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white overflow-hidden",
        expirationInfo?.urgent && "border-l-4 border-l-amber-500"
      )}>
        <CardHeader className="pb-3 pt-5 border-b border-slate-50 bg-slate-50/30">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Pagamento #{payment.id}
                </div>
                <h3 className="font-bold text-lg text-slate-800">
                  {payment.formatted_amount}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {expirationInfo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1",
                      expirationInfo.color
                    )}>
                      <AlertTriangle className="h-3 w-3" />
                      {expirationInfo.text}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getTimeLeftTooltip()}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <PaymentStatusComponent status={payment.status} />
            </div>
          </div>
        </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              Taxa da Plataforma
            </div>
            <div className="text-lg font-black text-slate-900">
              {payment.formatted_fee}
            </div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">
              Valor Líquido
            </div>
            <div className="text-lg font-black text-emerald-700">
              {payment.formatted_net_amount}
            </div>
          </div>
        </div>

        {payment.payment_method && (
          <div className="flex items-center gap-2 text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-xs">Método:</span>
            <span className="font-bold text-slate-700">{payment.payment_method_label}</span>
          </div>
        )}

        {payment.payment_code && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
              Código de Pagamento
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono break-all text-slate-800 bg-white p-2 rounded border border-slate-200">
                {payment.payment_code}
              </code>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-9 w-9 p-0 hover:bg-slate-100"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copiado!' : 'Copiar código'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {payment.expires_at && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 text-sm p-2 rounded-lg border",
                expirationInfo?.urgent 
                  ? "text-amber-700 bg-amber-50 border-amber-200" 
                  : "text-slate-600 bg-amber-50/50 border-amber-100"
              )}>
                <Calendar className={cn(
                  "h-4 w-4",
                  expirationInfo?.urgent ? "text-amber-600" : "text-amber-500"
                )} />
                <span className="font-medium">
                  Válido até {format(new Date(payment.expires_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getTimeLeftTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {payment.paid_at && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">
              Pago em {format(new Date(payment.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            {payment.status === PaymentStatus.Pending && onPay && (
              <Button 
                onClick={onPay} 
                disabled={loading || payment.is_expired}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pagar Agora
                  </>
                )}
              </Button>
            )}
            
            {payment.status === PaymentStatus.Processing && payment.payment_url && (
              <Button 
                onClick={handleOpenPaymentUrl} 
                variant="outline" 
                className="flex-1 border-slate-200 hover:bg-slate-50 font-semibold"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Link de Pagamento
              </Button>
            )}

            {onViewDetails && (
              <Button 
                onClick={onViewDetails} 
                variant="outline" 
                className="border-slate-200 hover:bg-slate-50 font-semibold"
              >
                Ver Detalhes
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}

// Memoização para performance
export const PaymentCard = memo(PaymentCardComponent)

