"use client"

import React, { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { 
  TrendingUp, Thermometer, 
  User, Loader2, Info, MapPin, FileText, CalendarIcon 
} from "lucide-react"
import api from "@/lib/api"
import { AxiosError } from "axios"

// Mapeamento do Enum PHP ProductType
const PRODUCT_TYPES = [
  { value: 'carnes_proteinas', label: 'Carnes e Proteínas' },
  { value: 'laticinios_derivados', label: 'Laticínios e Derivados' },
  { value: 'frutas_vegetais', label: 'Frutas e Vegetais' },
  { value: 'congelados_industrializados', label: 'Congelados Industrializados' },
  { value: 'farmacos_vacinas', label: 'Fármacos e Vacinas' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'flores_plantas', label: 'Flores e Plantas' },
  { value: 'quimicos_materias_primas', label: 'Químicos e Matérias-primas' },
  { value: 'outros', label: 'Outros' },
];

const needFormSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  category: z.string().min(1, "Selecione a categoria"),
  product_type: z.string().min(1, "Selecione o tipo de produto"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, "Mínimo 1 palete"),
  temp_min: z.coerce.number(),
  temp_max: z.coerce.number(),
  target_city: z.string().min(2, "Cidade obrigatória"),
  target_state: z.string().min(2, "UF obrigatória").max(2),
  start_date: z.date({ message: "Data obrigatória" }),
  end_date: z.date({ message: "Data obrigatória" }),
  proposed_price: z.string().optional(),
  contact_name: z.string().min(2, "Obrigatório"),
  contact_phone: z.string().min(10, "Telefone inválido"),
  contact_email: z.string().email("E-mail inválido"),
})
.refine((data) => data.temp_min <= data.temp_max, {
  message: "A temperatura mínima não pode ser maior que a máxima",
  path: ["temp_min"],
})
.refine((data) => data.end_date >= data.start_date, {
  message: "A data de saída deve ser posterior à entrada",
  path: ["end_date"],
});

type NeedFormValues = z.infer<typeof needFormSchema>;

interface NeedFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NeedFormDialog = ({ open, onOpenChange, onSuccess }: NeedFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<NeedFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(needFormSchema) as any,
    defaultValues: {
      title: "",
      category: "",
      product_type: "",
      description: "",
      quantity: 1,
      temp_min: -18,
      temp_max: 5,
      target_city: "",
      target_state: "",
      proposed_price: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    if (!rawValue) { onChange(""); return; }
    const formatted = (Number(rawValue) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    onChange(formatted)
  }

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const onSubmit: SubmitHandler<NeedFormValues> = async (values) => {
    try {
      setLoading(true);

      let numericPrice = null;
      if (values.proposed_price) {
        numericPrice = parseFloat(values.proposed_price.replace(/\./g, '').replace(',', '.'));
      }

      await api.post("/storage-requests", {
        ...values,
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        proposed_price: numericPrice,
        unit: 'pallets',
        status: 'pendente'
      });

      toast({ title: "Sucesso!", description: "Demanda enviada." });
      onSuccess();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast({ title: "Erro", description: err.response?.data?.message || "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-50 border-none shadow-2xl p-0 rounded-[32px]">
        
        <DialogHeader className="p-8 bg-linear-to-r from-indigo-600 to-sky-700 text-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Anunciar Carga</DialogTitle>
              <DialogDescription className="text-indigo-100/90 font-medium">
                Sua demanda será vista por centenas de operadores logísticos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <Form {...form}>
            <form id="need-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest border-b pb-3">
                  <FileText className="h-4 w-4 text-indigo-600" /> Detalhes da Mercadoria
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Título</FormLabel>
                      <FormControl><Input placeholder="Título da demanda" className="bg-white h-12 rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Regime</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="bg-white h-12 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white rounded-xl">
                          <SelectItem value="resfriados">Resfriados</SelectItem>
                          <SelectItem value="congelados">Congelados</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="product_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Tipo de Produto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white h-12 rounded-xl">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white rounded-xl max-h-[200px]">
                          {PRODUCT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Quantidade (Paletes)</FormLabel>
                      <FormControl><Input type="number" className="bg-white h-12 rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="proposed_price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Preço Alvo</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">R$</span>
                            <Input 
                              placeholder="0,00" 
                              className="pl-9 bg-white h-12 rounded-xl font-medium" 
                              value={field.value}
                              onChange={(e) => handlePriceChange(e, field.onChange)}
                            />
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase"><Thermometer className="h-4 w-4 text-orange-500" /> Temperatura</div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="temp_min" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Min (°C)</FormLabel>
                        <FormControl><Input type="number" className="text-center h-12" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="temp_max" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Max (°C)</FormLabel>
                        <FormControl><Input type="number" className="text-center h-12" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase"><MapPin className="h-4 w-4 text-rose-500" /> Destino</div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="target_city" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel className="text-[10px] font-bold uppercase text-slate-400">Cidade</FormLabel><FormControl><Input className="h-12 bg-white" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="target_state" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-400">UF</FormLabel><FormControl><Input className="h-12 text-center bg-white uppercase" maxLength={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="start_date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Data de Entrada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("h-12 w-full pl-3 text-left font-normal bg-white rounded-xl border-slate-200", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd 'de' MMM, yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      {/* ADICIONADO bg-white AQUI */}
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar 
                          className="bg-white rounded-md border" /* ADICIONADO bg-white AQUI TAMBÉM */
                          mode="single" 
                          selected={field.value} 
                          onSelect={field.onChange} 
                          disabled={isDateDisabled} 
                          initialFocus 
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="end_date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Data de Saída</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("h-12 w-full pl-3 text-left font-normal bg-white rounded-xl border-slate-200", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd 'de' MMM, yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      {/* ADICIONADO bg-white AQUI */}
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar 
                          className="bg-white rounded-md border" /* ADICIONADO bg-white AQUI TAMBÉM */
                          mode="single" 
                          selected={field.value} 
                          onSelect={field.onChange} 
                          disabled={(date) => isDateDisabled(date) || (form.getValues("start_date") ? date <= form.getValues("start_date") : false)} 
                          initialFocus 
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </section>

              <section className="space-y-6 bg-indigo-600 p-8 rounded-[32px] text-white">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-80">
                  <User className="h-4 w-4" /> Dados de Contato
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="contact_name" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase font-bold opacity-70">Responsável</FormLabel><FormControl><Input className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12" {...field} /></FormControl><FormMessage className="text-red-200" /></FormItem>
                  )} />
                  <FormField control={form.control} name="contact_phone" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase font-bold opacity-70">WhatsApp</FormLabel><FormControl><Input className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12" {...field} /></FormControl><FormMessage className="text-red-200" /></FormItem>
                  )} />
                  <FormField control={form.control} name="contact_email" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase font-bold opacity-70">E-mail</FormLabel><FormControl><Input type="email" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12" {...field} /></FormControl><FormMessage className="text-red-200" /></FormItem>
                  )} />
                </div>
              </section>
            </form>
          </Form>
        </div>

        <DialogFooter className="p-8 bg-white border-t flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-3 text-xs text-indigo-600 font-bold bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100">
            <Info size={18}/>
            <span>Sua demanda será processada para encontrar matches.</span>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-12 px-6 font-bold uppercase text-xs tracking-widest">Cancelar</Button>
            <Button form="need-form" type="submit" disabled={loading} className="bg-slate-900 hover:bg-indigo-600 text-white h-12 px-10 font-black uppercase text-xs tracking-widest rounded-xl transition-all active:scale-95 shadow-xl shadow-slate-200">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Publicar Demanda"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};