"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ChamberType, CHAMBER_TYPE_LABELS } from "@/lib/constants"
import { Upload, X, Loader2, Building2, MapPin, Thermometer, Clock, User, ImageIcon, Calendar } from "lucide-react"
import api from "@/lib/api"

// --- Helper para garantir Data Local (Corrige o bug do dia anterior) ---
const getLocalDate = (date = new Date()) => {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - (offset * 60 * 1000))
  return local.toISOString().split('T')[0]
}

const getFutureDate = (months = 1) => {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return getLocalDate(date)
}
// ----------------------------------------------------------------------

interface Space {
  id: number
  name: string
  city: string
  state: string
  chamber_type: string
  capacity: number
  active: boolean
  created_at: string
  description?: string
  address?: string
  street_address?: string
  number?: string
  district?: string
  zip_code?: string
  temp_min?: number
  temp_max?: number
  min_temperature_celsius?: number
  max_temperature_celsius?: number
  total_pallet_positions?: number
  available_pallet_positions?: number
  available_from?: string 
  available_until?: string 
  main_image?: string 
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  photos?: string[]
}

const spaceFormSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional(),
  street_address: z.string().min(5, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  district: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "UF inválida").toUpperCase().refine((val) => ["SP", "MG", "RJ"].includes(val), {
    message: "Atendemos apenas SP, MG e RJ no momento",
  }),
  zip_code: z.string().min(8, "CEP inválido"),
  chamber_type: z.string().min(1, "Selecione um tipo"),
  total_pallet_positions: z.number().min(1, "Mínimo 1"),
  available_pallet_positions: z.number().min(0, "Mínimo 0"),
  available_from: z.string().min(1, "Data inicial obrigatória"), 
  available_until: z.string().min(1, "Data final obrigatória"), 
  min_temperature_celsius: z.number(),
  max_temperature_celsius: z.number(),
  operating_hour_start: z.string(),
  operating_hour_end: z.string(),
  is_24h: z.boolean(),
  accepts_offhours: z.boolean(),
  offers_pickup_dropoff: z.boolean(),
  contact_name: z.string().min(2, "Nome obrigatório"),
  contact_phone: z.string().min(10, "Telefone inválido"),
  contact_email: z.string().email("E-mail inválido"),
}).refine((data) => data.min_temperature_celsius <= data.max_temperature_celsius, {
  message: "A temperatura mínima não pode ser maior que a máxima",
  path: ["min_temperature_celsius"],
}).refine((data) => {
  return data.available_until >= data.available_from;
}, {
  message: "A data de fim deve ser igual ou posterior à data de início",
  path: ["available_until"],
});

type SpaceFormValues = z.infer<typeof spaceFormSchema>

interface SpaceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess: () => void
  initialData?: Space
}

export const SpaceFormDialog = ({ open, onOpenChange, onSuccess, initialData }: SpaceFormDialogProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const form = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      street_address: "",
      number: "",
      district: "",
      city: "",
      state: "",
      zip_code: "",
      chamber_type: "",
      total_pallet_positions: 0,
      available_pallet_positions: 0,
      // FIX: Usando getLocalDate para evitar UTC shift
      available_from: getLocalDate(), 
      available_until: getFutureDate(1),
      min_temperature_celsius: 0,
      max_temperature_celsius: 5,
      operating_hour_start: "08:00",
      operating_hour_end: "18:00",
      is_24h: false,
      accepts_offhours: false,
      offers_pickup_dropoff: false,
      contact_name: "",
      contact_phone: "",
      contact_email: "",
    },
  })

  useEffect(() => {
    if (initialData && open) {
      // FIX: Tratamento robusto para data vinda do backend
      const fixDate = (d?: string) => {
        if (!d) return getLocalDate();
        // Se vier com T (ISO), pega só a primeira parte. 
        // Isso evita que o new Date() converta para fuso local e subtraia um dia
        return d.split('T')[0]; 
      };

      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        street_address: initialData.street_address || initialData.address || "",
        number: initialData.number || "",
        district: initialData.district || "",
        city: initialData.city,
        state: initialData.state,
        zip_code: initialData.zip_code || "",
        chamber_type: initialData.chamber_type?.toLowerCase() || "",
        total_pallet_positions: initialData.total_pallet_positions ?? initialData.capacity ?? 0,
        available_pallet_positions: initialData.available_pallet_positions ?? 0,
        min_temperature_celsius: initialData.min_temperature_celsius ?? initialData.temp_min ?? 0,
        max_temperature_celsius: initialData.max_temperature_celsius ?? initialData.temp_max ?? 0,
        available_from: fixDate(initialData.available_from),
        available_until: fixDate(initialData.available_until),
        contact_name: initialData.contact_name || "",
        contact_phone: initialData.contact_phone || "",
        contact_email: initialData.contact_email || "",
        operating_hour_start: "08:00",
        operating_hour_end: "18:00",
        is_24h: false,
        accepts_offhours: false,
        offers_pickup_dropoff: false,
      })
      
      if (initialData.main_image) {
        // O backend já retorna a URL completa, então usamos diretamente
        const mainImgUrl = initialData.main_image.startsWith('http') 
          ? initialData.main_image 
          : `${import.meta.env.VITE_API_URL}${initialData.main_image.startsWith('/') ? '' : '/'}${initialData.main_image}`;
        setImagePreviews([mainImgUrl])
      }
    } else if (!open) {
      form.reset({
        ...form.getValues(), // Mantém outros valores ou reseta tudo
        name: "",
        description: "",
        street_address: "",
        number: "",
        district: "",
        city: "",
        state: "",
        zip_code: "",
        chamber_type: "",
        total_pallet_positions: 0,
        available_pallet_positions: 0,
        available_from: getLocalDate(), // Reseta para hoje local
        available_until: getFutureDate(1),
        min_temperature_celsius: 0,
        max_temperature_celsius: 5,
        contact_name: "",
        contact_phone: "",
        contact_email: "",
      })
      setImageFiles([])
      setImagePreviews([])
    }
  }, [initialData, open, form])

  const is24h = form.watch("is_24h")

  const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e") e.preventDefault()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageFiles((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: SpaceFormValues) => {
    try {
      setLoading(true)
      const formData = new FormData()
      const start_time = values.is_24h ? "00:00" : values.operating_hour_start
      const end_time = values.is_24h ? "23:59" : values.operating_hour_end

      formData.append("name", values.name)
      formData.append("description", values.description || "")
      formData.append("address", values.street_address)
      formData.append("number", values.number)
      formData.append("district", values.district)
      formData.append("city", values.city)
      formData.append("state", values.state)
      formData.append("zip_code", values.zip_code)
      formData.append("temp_min", values.min_temperature_celsius.toString())
      formData.append("temp_max", values.max_temperature_celsius.toString())
      formData.append("capacity", values.total_pallet_positions.toString())
      formData.append("available_pallet_positions", values.available_pallet_positions.toString())
      
      // Datas já estão no formato YYYY-MM-DD correto graças ao Input type="date"
      formData.append("available_from", values.available_from)
      formData.append("available_until", values.available_until)
      
      formData.append("type", values.chamber_type.toLowerCase())
      formData.append("operating_hours", `${start_time} - ${end_time}`)
      formData.append("contact_name", values.contact_name)
      formData.append("contact_phone", values.contact_phone)
      formData.append("contact_email", values.contact_email)
      formData.append("active", "1")

      // Envia todas as imagens selecionadas de uma vez
      // A primeira será a imagem principal (main_image)
      // As demais serão fotos adicionais (photos)
      if (imageFiles.length > 0) {
        formData.append("photo", imageFiles[0]) // Imagem principal
        
        // Adiciona fotos adicionais (a partir da segunda)
        // O backend processa todas de uma vez
        for (let i = 1; i < imageFiles.length; i++) {
          formData.append("photos[]", imageFiles[i])
        }
      }

      if (initialData) {
        formData.append("_method", "PUT")
        await api.post(`/spaces/${initialData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
      } else {
        await api.post("/spaces", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
      }

      toast({ title: "Sucesso!", description: initialData ? "Espaço atualizado." : "Espaço cadastrado." })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      // --- CORREÇÃO AQUI ---
      // Removemos 'error: any' e fazemos um cast para o formato esperado do erro
      const apiError = error as { response?: { data?: { message?: string } } }
      const errorMessage = apiError.response?.data?.message || "Falha ao salvar."
      
      toast({ title: "Erro", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white border-2 border-sky-200 shadow-2xl">
        <DialogHeader className="border-b border-sky-200 pb-4 bg-linear-to-r from-sky-50 to-blue-50 px-6 pt-6 -mx-6 -mt-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-sky-900">
                {initialData ? "Editar Espaço" : "Cadastrar Novo Espaço"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 font-medium">
                {initialData ? "Atualize as informações do seu anúncio" : "Anuncie sua câmara fria para parceiros logísticos"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 scrollbar-thin scrollbar-thumb-sky-300 scrollbar-track-sky-50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
              
              <div className="space-y-4 p-4 bg-linear-to-br from-sky-50/80 to-blue-50/60 rounded-xl border border-sky-100">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-800">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <span>Informações Básicas</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Espaço</FormLabel>
                        <FormControl><Input {...field} className="border-sky-200" placeholder="Ex: Galpão Central SP" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chamber_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Câmara</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-sky-200">
                              <SelectValue placeholder="Selecione"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value={ChamberType.RESFRIADO}>{CHAMBER_TYPE_LABELS[ChamberType.RESFRIADO]}</SelectItem>
                            <SelectItem value={ChamberType.CONGELADO}>{CHAMBER_TYPE_LABELS[ChamberType.CONGELADO]}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Curta</FormLabel>
                      <FormControl><Textarea {...field} className="border-sky-200 min-h-[80px]" placeholder="Destaque diferenciais como segurança, certificações..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 p-4 bg-linear-to-br from-sky-50/80 to-blue-50/60 rounded-xl border border-sky-100">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-800">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <span>Período de Disponibilidade (Ociosidade)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="available_from" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponível de:</FormLabel>
                        <FormControl><Input type="date" {...field} className="border-sky-200" /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="available_until" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Até:</FormLabel>
                        <FormControl><Input type="date" {...field} className="border-sky-200" /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-linear-to-br from-blue-50/80 to-sky-50/60 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-r from-blue-500 to-sky-600 flex items-center justify-center shadow-md">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <span>Endereço da Operação</span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <FormField control={form.control} name="street_address" render={({ field }) => (
                        <FormItem><FormLabel>Rua</FormLabel><FormControl><Input {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="number" render={({ field }) => (
                      <FormItem><FormLabel>Nº</FormLabel><FormControl><Input {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="district" render={({ field }) => (
                      <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="zip_code" render={({ field }) => (
                      <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} className="border-sky-200" placeholder="00000-000" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>UF</FormLabel><FormControl><Input {...field} maxLength={2} className="border-sky-200 uppercase" placeholder="SP" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-linear-to-br from-sky-50/80 to-blue-50/60 rounded-xl border border-sky-100">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-800">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Thermometer className="h-4 w-4 text-white" />
                  </div>
                  <span>Capacidade Técnica</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="min_temperature_celsius" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp. Mín (°C)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            onKeyDown={preventNegative} 
                            {...field} 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} 
                            className="border-sky-200" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="max_temperature_celsius" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp. Máx (°C)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            onKeyDown={preventNegative} 
                            {...field} 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} 
                            className="border-sky-200" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="total_pallet_positions" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Paletes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            onKeyDown={preventNegative} 
                            min="0" 
                            {...field} 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} 
                            className="border-sky-200" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="available_pallet_positions" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponíveis Agora</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            onKeyDown={preventNegative} 
                            min="0" 
                            {...field} 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} 
                            className="border-sky-200" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-linear-to-br from-blue-50/80 to-sky-50/60 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-r from-blue-500 to-sky-600 flex items-center justify-center shadow-md">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span>Horário de Funcionamento</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="is_24h"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-white/50 px-3 py-1 rounded-full border border-blue-200">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                        </FormControl>
                        <FormLabel className="text-xs font-bold text-blue-700 cursor-pointer">Operação 24h</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                {!is24h && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <FormField control={form.control} name="operating_hour_start" render={({ field }) => (
                        <FormItem><FormLabel>Abertura</FormLabel><FormControl><Input type="time" {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="operating_hour_end" render={({ field }) => (
                        <FormItem><FormLabel>Fechamento</FormLabel><FormControl><Input type="time" {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 bg-linear-to-br from-sky-50/80 to-blue-50/60 rounded-xl border border-sky-100">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-800">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                  <span>Fotos do Espaço</span>
                </div>
                <div className="space-y-3">
                  <label htmlFor="img-upload" className="cursor-pointer flex items-center justify-center gap-3 border-2 border-dashed border-sky-400 hover:border-sky-500 bg-white hover:bg-sky-50 p-6 rounded-xl transition-all duration-200 group shadow-sm">
                    <Upload className="h-6 w-6 text-sky-500" />
                    <div className="text-left">
                      <div className="text-sm font-bold text-sky-800">Adicionar Fotos</div>
                      <div className="text-xs text-gray-600 font-medium">{imageFiles.length} foto(s) selecionada(s)</div>
                    </div>
                    <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-sky-200 group/img">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-linear-to-br from-blue-50/80 to-sky-50/60 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span>Responsável Operacional</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="contact_name" render={({ field }) => (
                      <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="contact_phone" render={({ field }) => (
                      <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="contact_email" render={({ field }) => (
                      <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} className="border-sky-200" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="border-t border-sky-200 px-6 py-4 bg-linear-to-r from-sky-50 to-blue-50 -mx-6 -mb-6 mt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-sky-300 text-sky-700 hover:bg-sky-50">Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg min-w-[140px]">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Espaço"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}