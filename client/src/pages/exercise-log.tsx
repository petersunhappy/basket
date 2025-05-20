import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  exerciseId: z.string(),
  sets: z.coerce.number().min(1, "Mínimo de 1 série"),
  reps: z.coerce.number().min(1, "Mínimo de 1 repetição"),
  weight: z.coerce.number().optional(),
  completion: z.string(),
  effort: z.enum(["Fácil", "Moderado", "Difícil"]),
  accuracy: z.number().min(0).max(100),
  notes: z.string().optional(),
});

export default function ExerciseLog() {
  const { toast } = useToast();
  const [accuracyValue, setAccuracyValue] = useState(70);
  
  // Fetch available exercises
  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ["/api/exercises"],
  });
  
  // Setup form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseId: "",
      sets: 3,
      reps: 10,
      weight: undefined,
      completion: "100",
      effort: "Moderado",
      accuracy: 70,
      notes: "",
    },
  });
  
  // Mutation to log exercise
  const logExerciseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/exercises/log", data);
    },
    onSuccess: () => {
      toast({
        title: "Exercício registrado",
        description: "Seu progresso foi salvo com sucesso!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar exercício",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    logExerciseMutation.mutate(values);
  };
  
  const selectedExerciseId = form.watch("exerciseId");
  const selectedExercise = exercises?.find((ex: any) => ex.id.toString() === selectedExerciseId);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                Registrar Exercício
              </h2>
              <p className="text-neutral-medium">
                Registre manualmente seus exercícios e acompanhe seu progresso.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Novo Registro de Exercício</CardTitle>
                <CardDescription>
                  Preencha os detalhes do exercício que você realizou.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="exerciseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercício</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um exercício" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingExercises ? (
                                <SelectItem value="loading">Carregando exercícios...</SelectItem>
                              ) : exercises?.length > 0 ? (
                                exercises.map((exercise: any) => (
                                  <SelectItem key={exercise.id} value={exercise.id.toString()}>
                                    {exercise.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none">Nenhum exercício disponível</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="sets"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Séries</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repetições</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg, opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                step={0.5} 
                                placeholder="0" 
                                {...field}
                                value={field.value === undefined ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                      name="effort"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Nível de esforço percebido</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-1"
                            >
                              <FormItem className="flex items-center space-x-1 space-y-0 flex-1">
                                <FormControl>
                                  <RadioGroupItem value="Fácil" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1 p-2 text-center border border-gray-200 rounded-l-md hover:bg-gray-50">
                                  Fácil
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-1 space-y-0 flex-1">
                                <FormControl>
                                  <RadioGroupItem value="Moderado" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1 p-2 text-center border border-gray-200 hover:bg-gray-50">
                                  Moderado
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-1 space-y-0 flex-1">
                                <FormControl>
                                  <RadioGroupItem value="Difícil" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1 p-2 text-center border border-gray-200 rounded-r-md hover:bg-gray-50">
                                  Difícil
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observações sobre o exercício (opcional)"
                              className="resize-none"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Registre sensações, dificuldades ou qualquer observação relevante.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={logExerciseMutation.isPending}>
                        {logExerciseMutation.isPending ? "Registrando..." : "Registrar Exercício"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
