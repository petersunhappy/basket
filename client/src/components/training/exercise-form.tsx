import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Exercise } from "@shared/types";

interface ExerciseFormProps {
  exercise: Exercise;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  completion: z.string(),
  accuracy: z.number().min(0).max(100),
  effort: z.enum(["Fácil", "Moderado", "Difícil"]),
  notes: z.string().optional(),
});

export function ExerciseForm({ exercise, onSubmit, onCancel }: ExerciseFormProps) {
  const [accuracyValue, setAccuracyValue] = useState(70);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completion: "100",
      accuracy: 70,
      effort: "Moderado",
      notes: "",
    },
  });
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      exerciseId: exercise.id,
      ...values,
      date: new Date(),
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-secondary mb-2">{exercise.name}</h3>
          <p className="text-sm text-neutral-medium">{exercise.description}</p>
        </div>
        
        <FormField
          control={form.control}
          name="completion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completou todas as séries?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a porcentagem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="100">Sim, todas as séries (100%)</SelectItem>
                  <SelectItem value="80">Parcialmente (80%)</SelectItem>
                  <SelectItem value="60">Parcialmente (60%)</SelectItem>
                  <SelectItem value="40">Parcialmente (40%)</SelectItem>
                  <SelectItem value="20">Parcialmente (20%)</SelectItem>
                  <SelectItem value="0">Não consegui realizar</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accuracy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de acerto (aproximada)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[field.value]}
                    onValueChange={(vals) => {
                      field.onChange(vals[0]);
                      setAccuracyValue(vals[0]);
                    }}
                  />
                  <div className="flex justify-between text-xs text-neutral-medium">
                    <span>0%</span>
                    <span>{accuracyValue}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="effort"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de esforço percebido</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de esforço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Moderado">Moderado</SelectItem>
                  <SelectItem value="Difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o exercício (opcional)"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Registro
          </Button>
        </div>
      </form>
    </Form>
  );
}
