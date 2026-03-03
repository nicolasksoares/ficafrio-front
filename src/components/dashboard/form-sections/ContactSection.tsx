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

interface ContactSectionProps {
  form: UseFormReturn<FieldValues>;
}

export const ContactSection = ({ form }: ContactSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Contato e Responsável</h3>
        <p className="text-sm text-muted-foreground">
          Informações de contato para este espaço
        </p>
      </div>

      <FormField
        control={form.control}
        name="contact_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Responsável *</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone *</FormLabel>
              <FormControl>
                <Input placeholder="(11) 98765-4321" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contato@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="additional_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações Adicionais</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Informações complementares sobre o espaço, condições especiais, etc."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Qualquer informação adicional relevante para os clientes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
