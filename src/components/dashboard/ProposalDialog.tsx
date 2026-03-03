"use client"

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  Package,
  Thermometer,
  FileText,
  Loader2,
  ArrowRight,
  MapPin,
  Snowflake,
} from "lucide-react";
import { format, addDays, startOfDay, isBefore, isAfter, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { isAxiosError } from "axios";

interface SpaceConstraints {
  minTemp: number;
  maxTemp: number;
  maxCapacity: number;
  availableFrom: string | null;
  availableUntil: string | null;
}

interface ProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  spaceCity: string;
  spaceState: string;
  spaceDisplayName: string;
}

interface ProductOption {
  value: string;
  label: string;
}

function parseSafeDate(value: string | null): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export const ProposalDialog = ({
  open,
  onOpenChange,
  spaceId,
  spaceCity,
  spaceState,
  spaceDisplayName,
}: ProposalDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpace, setIsLoadingSpace] = useState(true);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [constraints, setConstraints] = useState<SpaceConstraints | null>(null);

  const proposalSchema = useMemo(() => {
    if (!constraints) return z.any();

    return z
      .object({
        product_category: z.string().min(1, "Selecione a categoria"),
        product_description: z
          .string()
          .min(5, "Descrição muito curta")
          .max(500)
          .trim(),
        pallet_positions_requested: z
          .number()
          .min(1, "Mínimo de 1 palete")
          .max(
            constraints.maxCapacity,
            `Máximo disponível: ${constraints.maxCapacity} paletes`
          ),
        min_temperature_required: z.number(),
        max_temperature_required: z.number(),
        proposed_price: z.string().optional(),
        proposed_start_date: z.date(),
        proposed_end_date: z.date(),
        requester_message: z
          .string()
          .max(300)
          .optional()
          .transform((v) => v?.trim()),
      })
      .refine(
        (data) => data.min_temperature_required <= data.max_temperature_required,
        { message: "Temperatura mínima não pode ser maior que a máxima.", path: ["min_temperature_required"] }
      )
      .refine(
        (data) => data.proposed_end_date >= data.proposed_start_date,
        {
          message: "Data de saída deve ser igual ou posterior à entrada.",
          path: ["proposed_end_date"],
        }
      );
  }, [constraints]);

  type ProposalFormData = z.infer<typeof proposalSchema>;

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!open || !spaceId) return;

    let cancelled = false;
    const fetchData = async () => {
      setIsLoadingSpace(true);
      try {
        const [typesRes, spaceRes] = await Promise.all([
          api.get("/product-types"),
          api.get(`/spaces/${spaceId}`),
        ]);

        if (cancelled) return;

        setProductOptions(Array.isArray(typesRes.data) ? typesRes.data : []);

        const spaceData = spaceRes.data.data;
        const fromRaw = spaceData?.available_from ?? null;
        const untilRaw = spaceData?.available_until ?? null;

        const newConstraints: SpaceConstraints = {
          minTemp: Number(spaceData?.min_temperature_celsius ?? 0),
          maxTemp: Number(spaceData?.max_temperature_celsius ?? 0),
          maxCapacity: Number(spaceData?.available_pallet_positions ?? 0),
          availableFrom: fromRaw,
          availableUntil: untilRaw,
        };

        setConstraints(newConstraints);

        const startDefault =
          parseSafeDate(newConstraints.availableFrom) ?? new Date();
        const safeStart = isBefore(startDefault, new Date())
          ? new Date()
          : startDefault;
        const endDefault = addDays(new Date(), 30);

        form.reset({
          product_category: "",
          product_description: "",
          pallet_positions_requested: 1,
          min_temperature_required: newConstraints.minTemp,
          max_temperature_required: newConstraints.maxTemp,
          proposed_price: "",
          requester_message: "",
          proposed_start_date: safeStart,
          proposed_end_date: endDefault,
        });
      } catch {
        if (!cancelled) {
          toast({
            title: "Erro",
            description: "Falha ao carregar dados do espaço.",
            variant: "destructive",
          });
          onOpenChange(false);
        }
      } finally {
        if (!cancelled) setIsLoadingSpace(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form.reset estável; toast/onOpenChange omitidos para evitar reexecuções
  }, [open, spaceId]);

  const isDateDisabled = (date: Date) => {
    if (!constraints) return true;
    const today = startOfDay(new Date());
    const spaceStart = parseSafeDate(constraints.availableFrom) ?? today;
    const spaceEnd =
      parseSafeDate(constraints.availableUntil) ?? addDays(today, 365);
    return (
      isBefore(date, today) ||
      isBefore(date, spaceStart) ||
      isAfter(date, spaceEnd)
    );
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let numericPrice: number | null = null;
      if (data.proposed_price?.trim()) {
        numericPrice = parseFloat(
          data.proposed_price.replace(/\./g, "").replace(",", ".")
        );
      }

      const productLabel =
        productOptions.find((opt) => opt.value === data.product_category)
          ?.label ?? data.product_category;
      const title = `Armazenagem de ${productLabel} - ${spaceDisplayName}`;

      const requestPayload = {
        title,
        product_type: data.product_category,
        description: data.product_description,
        quantity: data.pallet_positions_requested,
        unit: "pallets",
        temp_min: data.min_temperature_required,
        temp_max: data.max_temperature_required,
        start_date: format(data.proposed_start_date, "yyyy-MM-dd"),
        end_date: format(data.proposed_end_date, "yyyy-MM-dd"),
        target_city: spaceCity,
        target_state: spaceState,
        requester_message: data.requester_message ?? undefined,
        proposed_price: numericPrice,
        contact_name: user?.trade_name ?? "Não informado",
        contact_phone: user?.phone ?? "",
        contact_email: user?.email ?? "",
      };

      const requestResponse = await api.post("/storage-requests", requestPayload);
      const storageRequestId =
        requestResponse.data.data?.id ?? requestResponse.data.id;

      await api.post("/quotes", {
        storage_request_id: storageRequestId,
        space_id: spaceId,
      });

      toast({
        title: "Solicitação enviada",
        description: "O parceiro receberá sua proposta e poderá responder em breve.",
        className: "bg-emerald-50 text-emerald-900 border-emerald-200",
      });

      form.reset();
      onOpenChange(false);
      navigate("/dashboard?section=proposals");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const errors = err.response.data.errors;
        if (errors?.unit)
          toast({
            title: "Erro",
            description: "Unidade inválida.",
            variant: "destructive",
          });
        if (errors?.start_date)
          form.setError("proposed_start_date", { message: "Data inválida." });
        if (errors?.quantity)
          form.setError("pallet_positions_requested", {
            message: Array.isArray(errors.quantity) ? errors.quantity[0] : "Quantidade inválida.",
          });
        if (!errors?.unit && !errors?.start_date && !errors?.quantity) {
          toast({
            title: "Dados inválidos",
            description: "Verifique os campos destacados.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Falha na comunicação. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationLabel = [spaceCity, spaceState].filter(Boolean).join(", ") || "Espaço";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0 bg-white border border-slate-200 shadow-xl rounded-2xl"
        aria-describedby="proposal-dialog-description"
      >
        {/* Header alinhado ao ResponseDialog e padrão da aplicação */}
        <DialogHeader className="shrink-0 p-6 pb-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 border border-sky-100">
              <Package className="h-5 w-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-slate-800 tracking-tight">
                Solicitar armazenagem
              </DialogTitle>
              <DialogDescription
                id="proposal-dialog-description"
                className="text-sm text-slate-500 flex items-center gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {spaceDisplayName}
                {locationLabel && (
                  <span className="text-slate-400">· {locationLabel}</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoadingSpace || !constraints ? (
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 rounded-xl bg-slate-100" />
                <Skeleton className="h-10 w-28 rounded-xl bg-slate-100" />
              </div>
              <Skeleton className="h-24 w-full rounded-xl bg-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 rounded-xl bg-slate-100" />
                <Skeleton className="h-10 rounded-xl bg-slate-100" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl bg-slate-100" />
            </div>
          ) : (
            <>
              {/* Resumo das condições do espaço */}
              <div className="mx-6 mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Condições do espaço
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Snowflake className="h-3.5 w-3.5 text-sky-500" />
                    {constraints.minTemp}°C a {constraints.maxTemp}°C
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    {constraints.maxCapacity} vagas (paletes)
                  </span>
                  {constraints.availableFrom && constraints.availableUntil && (
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      {format(
                        parseISO(constraints.availableFrom),
                        "dd/MM/yy",
                        { locale: ptBR }
                      )}{" "}
                      –{" "}
                      {format(
                        parseISO(constraints.availableUntil),
                        "dd/MM/yy",
                        { locale: ptBR }
                      )}
                    </span>
                  )}
                </div>
              </div>

              <Form {...form}>
                <form
                  id="proposal-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="p-6 pt-5 space-y-6"
                >
                  {/* Seção: Carga */}
                  <section className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      <FileText className="h-4 w-4 text-sky-600" />
                      Detalhes da carga
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="product_category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">
                              Categoria do produto
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-11">
                                  <SelectValue
                                    placeholder={
                                      productOptions.length === 0
                                        ? "Carregando..."
                                        : "Selecione a categoria"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white rounded-xl">
                                {productOptions.map((opt) => (
                                  <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="rounded-lg"
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-600 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pallet_positions_requested"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">
                              Quantidade de paletes
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={1}
                                  max={constraints.maxCapacity}
                                  className="rounded-xl border-slate-200 bg-slate-50/50 h-11 pr-14"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                                  máx. {constraints.maxCapacity}
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription className="text-slate-500 text-xs">
                              Até {constraints.maxCapacity} vagas disponíveis
                            </FormDescription>
                            <FormMessage className="text-red-600 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="product_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">
                            Descrição da carga
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex.: produto, embalagem, peso aproximado..."
                              className="rounded-xl border-slate-200 bg-slate-50/50 min-h-[80px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 text-xs" />
                        </FormItem>
                      )}
                    />
                  </section>

                  {/* Seção: Temperatura */}
                  <section className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      <Thermometer className="h-4 w-4 text-amber-500" />
                      Temperatura
                    </h3>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <FormField
                        control={form.control}
                        name="min_temperature_required"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-600 text-xs font-medium">
                              Mínima (°C)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="rounded-lg h-10 text-center border-slate-200 bg-white"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-red-600 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="max_temperature_required"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-600 text-xs font-medium">
                              Máxima (°C)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="rounded-lg h-10 text-center border-slate-200 bg-white"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-red-600 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  {/* Seção: Período */}
                  <section className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      <CalendarIcon className="h-4 w-4 text-sky-600" />
                      Período
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="proposed_start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-slate-700">
                              Data de entrada
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-11 rounded-xl border-slate-200 bg-slate-50/50 justify-start font-normal",
                                      !field.value && "text-slate-500"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                                    {field.value
                                      ? format(field.value, "dd 'de' MMM, yyyy", {
                                          locale: ptBR,
                                        })
                                      : "Selecione"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 rounded-xl border-slate-200"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={isDateDisabled}
                                  initialFocus
                                  locale={ptBR}
                                  className="rounded-xl border-0 bg-white"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-red-600 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="proposed_end_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-slate-700">
                              Previsão de saída
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-11 rounded-xl border-slate-200 bg-slate-50/50 justify-start font-normal",
                                      !field.value && "text-slate-500"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                                    {field.value
                                      ? format(field.value, "dd 'de' MMM, yyyy", {
                                          locale: ptBR,
                                        })
                                      : "Selecione"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 rounded-xl border-slate-200"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const start = form.getValues(
                                      "proposed_start_date"
                                    );
                                    return (
                                      isDateDisabled(date) ||
                                      (start ? date < start : false)
                                    );
                                  }}
                                  initialFocus
                                  locale={ptBR}
                                  className="rounded-xl border-0 bg-white"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-red-600 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <FormField
                    control={form.control}
                    name="requester_message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">
                          Observações (opcional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instruções de entrega, observações especiais..."
                            className="rounded-xl border-slate-200 bg-slate-50/50 min-h-[72px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-xs" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 p-6 pt-4 bg-slate-50 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl text-slate-600 hover:text-slate-800 order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            form="proposal-form"
            type="submit"
            disabled={isSubmitting || isLoadingSpace}
            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm px-6 order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar solicitação
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
