"use client"

import { Badge } from "@/components/ui/badge"
import { PaymentStatus as PaymentStatusEnum } from "@/types/payment"
import { 
  Clock, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Ban 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentStatusProps {
  status: PaymentStatusEnum
  className?: string
}

const statusConfig = {
  [PaymentStatusEnum.Pending]: {
    label: 'Aguardando',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [PaymentStatusEnum.Processing]: {
    label: 'Processando',
    icon: Loader2,
    className: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
  },
  [PaymentStatusEnum.Paid]: {
    label: 'Pago',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [PaymentStatusEnum.Failed]: {
    label: 'Falhou',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  [PaymentStatusEnum.Refunded]: {
    label: 'Reembolsado',
    icon: RotateCcw,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  [PaymentStatusEnum.Cancelled]: {
    label: 'Cancelado',
    icon: Ban,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  },
}

export function PaymentStatus({ status, className }: PaymentStatusProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-3 py-1 font-semibold border flex items-center gap-1.5",
        config.className,
        className
      )}
    >
      <Icon className={cn(
        "h-3.5 w-3.5",
        status === PaymentStatusEnum.Processing && "animate-spin"
      )} />
      {config.label}
    </Badge>
  )
}

