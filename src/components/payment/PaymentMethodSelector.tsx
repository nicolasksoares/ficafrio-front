"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PaymentMethod } from "@/types/payment"
import { CreditCard, QrCode, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null
  onSelectMethod: (method: PaymentMethod) => void
  disabled?: boolean
}

const methods = [
  {
    value: PaymentMethod.Pix,
    label: 'PIX',
    description: 'Pagamento instantâneo',
    icon: QrCode,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    selectedColor: 'bg-emerald-100 border-emerald-400',
  },
  {
    value: PaymentMethod.CreditCard,
    label: 'Cartão de Crédito',
    description: 'Parcelamento disponível',
    icon: CreditCard,
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    selectedColor: 'bg-blue-100 border-blue-400',
  },
  {
    value: PaymentMethod.Boleto,
    label: 'Boleto',
    description: 'Válido por 7 dias',
    icon: FileText,
    color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    selectedColor: 'bg-orange-100 border-orange-400',
  },
]

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => {
        const Icon = method.icon
        const isSelected = selectedMethod === method.value

        return (
          <Card
            key={method.value}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected ? method.selectedColor : method.color,
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && onSelectMethod(method.value)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className={cn(
                "p-3 rounded-full",
                isSelected ? "bg-white" : "bg-white/50"
              )}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{method.label}</h3>
                <p className="text-sm opacity-75">{method.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

