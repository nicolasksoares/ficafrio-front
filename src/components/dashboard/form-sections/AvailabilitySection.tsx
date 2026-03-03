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
import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilitySectionProps {
  form: UseFormReturn<FieldValues>;
}

export const AvailabilitySection = ({ form }: AvailabilitySectionProps) => {
  const daysOfWeek = [
    { id: "seg", label: "Segunda" },
    { id: "ter", label: "Terça" },
    { id: "qua", label: "Quarta" },
    { id: "qui", label: "Quinta" },
    { id: "sex", label: "Sexta" },
    { id: "sab", label: "Sábado" },
    { id: "dom", label: "Domingo" },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Disponibilidade</h3>
        <p className="text-sm text-muted-foreground">
          Períodos e horários disponíveis
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="available_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disponível a partir de</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                Data de início da disponibilidade
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available_until"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disponível até</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                Deixe vazio para disponibilidade contínua
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="available_days_of_week"
        render={() => (
          <FormItem>
            <FormLabel>Dias da Semana Disponíveis</FormLabel>
            <div className="grid grid-cols-4 gap-4 mt-2">
              {daysOfWeek.map((day) => (
                <FormField
                  key={day.id}
                  control={form.control}
                  name="available_days_of_week"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={day.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(day.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), day.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== day.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {day.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
