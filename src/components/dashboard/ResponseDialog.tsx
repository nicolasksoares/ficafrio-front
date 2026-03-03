"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2, DollarSign, Info } from "lucide-react"
import { format, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Schema
const responseSchema = z.object({
  price: z.string().min(1, "O valor é obrigatório"),
  valid_until: z.date({ 
    message: "Defina a validade da proposta"
  }),
})

interface ResponseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteId: number
  clientName: string
  onSuccess: () => void
}

// Utility para formatar moeda (R$ 1.500,00)
const formatCurrency = (value: string) => {
  const numericValue = value.replace(/\D/g, "")
  const floatValue = Number(numericValue) / 100
  return floatValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function ResponseDialog({ open, onOpenChange, quoteId, clientName, onSuccess }: ResponseDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default para validade: 7 dias a partir de hoje
  const form = useForm<z.infer<typeof responseSchema>>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      price: "",
      valid_until: addDays(new Date(), 7), 
    },
  })

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    if (!rawValue) {
      onChange("")
      return
    }
    // Mantemos o valor "bruto" visualmente formatado no input
    const formatted = (Number(rawValue) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    onChange(formatted)
  }

  const onSubmit = async (values: z.infer<typeof responseSchema>) => {
    setIsSubmitting(true)
    try {
      // Converte "1.500,50" para 1500.50
      const numericPrice = parseFloat(values.price.replace(/\./g, '').replace(',', '.'))

      if (isNaN(numericPrice) || numericPrice <= 0) {
        form.setError("price", { message: "Valor inválido" })
        setIsSubmitting(false)
        return
      }

      await api.put(`/quotes/${quoteId}`, {
        price: numericPrice,
        valid_until: format(values.valid_until, 'yyyy-MM-dd'),
      })

      toast({
        title: "Proposta Enviada!",
        description: `Orçamento de ${formatCurrency(numericPrice.toString())} enviado para ${clientName}.`,
        className: "bg-emerald-50 text-emerald-900 border-emerald-200"
      })
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({
        title: "Erro ao enviar",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden gap-0 rounded-2xl">
        <DialogHeader className="bg-slate-50 p-6 border-b border-slate-100">
          <DialogTitle className="text-xl text-slate-800">Enviar Orçamento</DialogTitle>
          <DialogDescription className="text-slate-500">
            Você está respondendo à solicitação de <strong>{clientName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            
            {/* Campo Preço */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Valor Mensal Total</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-100 text-slate-500 text-xs font-bold px-1.5 py-0.5 rounded">
                        R$
                      </div>
                      <Input 
                        placeholder="0,00" 
                        className="pl-12 h-12 text-lg font-medium border-slate-200 focus:border-sky-500 focus:ring-sky-200 transition-all" 
                        value={field.value}
                        onChange={(e) => handlePriceChange(e, field.onChange)}
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Inclua taxas de movimentação e armazenagem.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Validade */}
            <FormField
              control={form.control}
              name="valid_until"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-700 font-semibold">Validade da Proposta</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-12 border-slate-200",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0  bg-white border-slate-200 shadow-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="rounded-md border shadow-lg"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dica de UX */}
            <Alert className="bg-sky-50 text-sky-800 border-sky-100">
              <Info className="h-4 w-4 text-sky-600" />
              <AlertDescription className="text-xs">
                Ao enviar, o cliente receberá uma notificação instantânea. Você poderá editar o valor se ele rejeitar.
              </AlertDescription>
            </Alert>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-11">Cancelar</Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 h-11 px-8 shadow-lg shadow-sky-200" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                Confirmar Envio
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}