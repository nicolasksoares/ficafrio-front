"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PaymentMethodSelector } from "./PaymentMethodSelector"
import type { Payment } from "@/types/payment"
import { PaymentMethod, PaymentStatus } from "@/types/payment"
import { usePayment } from "@/hooks/usePayment"
import { Loader2, DollarSign, AlertCircle, Clock, Info, ExternalLink, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { differenceInHours, differenceInMinutes } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
  onSuccess?: () => void
}

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [processedPayment, setProcessedPayment] = useState<Payment | null>(null)
  const { processPayment, loading } = usePayment()

  useEffect(() => {
    if (!open) {
      setSelectedMethod(null)
      setProcessedPayment(null)
    }
  }, [open])

  // Contador de tempo restante
  useEffect(() => {
    if (!payment?.expires_at || !open) return
    const p = payment
    const updateTimeLeft = () => {
      if (!p?.expires_at) return
      const now = new Date()
      const expiresAt = new Date(p.expires_at)
      const hoursLeft = differenceInHours(expiresAt, now)
      const minutesLeft = differenceInMinutes(expiresAt, now)

      if (minutesLeft <= 0) {
        setTimeLeft("Expirado")
        return
      }

      if (hoursLeft < 1) {
        setTimeLeft(`${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}`)
      } else if (hoursLeft < 24) {
        setTimeLeft(`${hoursLeft} hora${hoursLeft !== 1 ? 's' : ''}`)
      } else {
        const days = Math.floor(hoursLeft / 24)
        setTimeLeft(`${days} dia${days !== 1 ? 's' : ''}`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [payment, open])

  // Informações sobre métodos de pagamento
  const methodInfo = useMemo(() => {
    const info: Record<PaymentMethod, { description: string; time: string }> = {
      [PaymentMethod.Pix]: {
        description: "Pagamento instantâneo via PIX",
        time: "Confirmação imediata"
      },
      [PaymentMethod.CreditCard]: {
        description: "Pagamento com cartão de crédito",
        time: "Confirmação em até 2 dias úteis"
      },
      [PaymentMethod.Boleto]: {
        description: "Boleto bancário",
        time: "Confirmação em até 2 dias úteis após pagamento"
      }
    }
    return selectedMethod ? info[selectedMethod] : null
  }, [selectedMethod])

  const handleProcess = async () => {
    if (!selectedMethod || !payment) return

    const result = await processPayment(payment.id, selectedMethod)
    if (result) {
      if (result.payment_url) {
        setProcessedPayment(result)
      } else {
        onSuccess?.()
        onOpenChange(false)
      }
    }
  }

  if (!payment) return null

  const paymentUrlToUse = processedPayment?.payment_url ?? (payment?.payment_url && !payment?.is_expired ? payment.payment_url : null)
  const handleGoToPayment = () => {
    if (paymentUrlToUse) {
      onSuccess?.()
      onOpenChange(false)
      window.location.href = paymentUrlToUse
    }
  }

  const canProcess = payment.status === PaymentStatus.Pending && !payment.is_expired
  const hasExistingPaymentUrl = Boolean(payment.payment_url && !payment.is_expired && (payment.status === PaymentStatus.Pending || payment.status === PaymentStatus.Processing))
  const showRedirectStep = Boolean(processedPayment?.payment_url || hasExistingPaymentUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {showRedirectStep ? "Redirecionar para pagamento" : "Finalizar Pagamento"}
          </DialogTitle>
          <DialogDescription>
            {showRedirectStep
              ? "Você será enviado ao ambiente seguro para concluir o pagamento."
              : "Escolha o método de pagamento para concluir sua compra"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Etapa: redirecionar para Stripe */}
          {showRedirectStep && paymentUrlToUse && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="space-y-3">
                <p className="text-sm text-emerald-800 font-medium">
                  Clique no botão abaixo para ser redirecionado ao ambiente seguro de pagamento.
                  Após concluir, você voltará ao painel.
                </p>
                <Button
                  onClick={handleGoToPayment}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir para pagamento
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!showRedirectStep && (
          <>
          {/* Contador de Tempo */}
          {payment.expires_at && !payment.is_expired && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Tempo restante para pagamento:</span>
                <Badge variant="outline" className="ml-2 font-semibold">
                  {timeLeft || "Calculando..."}
                </Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* Resumo do Valor */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold">Valor Total:</span>
              <span className="text-2xl font-black text-slate-900">
                {payment.formatted_amount}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Taxa da Plataforma (10%):</span>
              <span className="text-slate-700 font-semibold">
                {payment.formatted_fee}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Valor Líquido para Parceiro:</span>
              <span className="text-emerald-600 font-semibold">
                {payment.formatted_net_amount}
              </span>
            </div>
          </div>

          {payment.is_expired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este pagamento expirou. Entre em contato com o suporte.
              </AlertDescription>
            </Alert>
          )}

          {!canProcess && !payment.is_expired && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este pagamento não pode ser processado no momento.
              </AlertDescription>
            </Alert>
          )}

          {canProcess && (
            <>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">
                  Selecione o método de pagamento:
                </h3>
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                  disabled={loading}
                />
                
                {/* Informações sobre o método selecionado */}
                {methodInfo && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          {methodInfo.description}
                        </p>
                        <p className="text-xs text-blue-700">
                          {methodInfo.time}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {showRedirectStep ? "Fechar" : "Cancelar"}
          </Button>
          {!showRedirectStep && canProcess && (
            <Button
              onClick={handleProcess}
              disabled={!selectedMethod || loading}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Confirmar Pagamento
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

