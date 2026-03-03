import type { UseFormReturn, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SpecificationsSectionProps {
  form: UseFormReturn<FieldValues>;
}

export const SpecificationsSection = ({ form }: SpecificationsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Capacidade e Especificações Técnicas</h3>
        <p className="text-sm text-muted-foreground">
          Detalhes técnicos do espaço refrigerado
        </p>
      </div>

      <FormField
        control={form.control}
        name="chamber_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Câmara *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="resfriada">Resfriada (0°C a 10°C)</SelectItem>
                <SelectItem value="congelada">Congelada (-18°C a 0°C)</SelectItem>
                <SelectItem value="ultracongelada">Ultracongelada (abaixo de -18°C)</SelectItem>
                <SelectItem value="ambiente_controlado">Ambiente Controlado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="total_pallet_positions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total de Posições Paletes *</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="Ex: 100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available_pallet_positions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posições Disponíveis *</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="Ex: 50"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="min_temperature_celsius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temp. Mínima (°C) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="-18"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_temperature_celsius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temp. Máxima (°C) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="5"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="cooling_system"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sistema de Refrigeração</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Compressor Parafuso, R-404A"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Tipo de sistema e gás refrigerante utilizado
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="floor_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Piso</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="concreto">Concreto</SelectItem>
                <SelectItem value="epoxi">Epóxi</SelectItem>
                <SelectItem value="industrial">Industrial Reforçado</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="energy_consumption_kwh"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Consumo Energético Estimado (kWh/mês)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01"
                placeholder="Ex: 5000"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
              />
            </FormControl>
            <FormDescription>
              Consumo médio mensal para referência
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
