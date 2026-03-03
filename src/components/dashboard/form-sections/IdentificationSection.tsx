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
import { Textarea } from "@/components/ui/textarea";

interface IdentificationSectionProps {
  form: UseFormReturn<FieldValues>;
}

export const IdentificationSection = ({ form }: IdentificationSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Identificação do Espaço</h3>
        <p className="text-sm text-muted-foreground">
          Informações básicas sobre o espaço refrigerado
        </p>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Espaço *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Câmara Fria A1 - Unidade Centro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva as características principais do espaço, equipamentos, diferenciais..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Quanto mais detalhes, melhor para atrair clientes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Fotos do Espaço</FormLabel>
        <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Upload de fotos será implementado em breve
          </p>
          <p className="text-xs text-muted-foreground">
            Aceita JPG, PNG (máx. 5MB cada, até 10 fotos)
          </p>
        </div>
      </div>
    </div>
  );
};
