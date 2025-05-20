import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Trash2, Pencil, SaveIcon, Copy } from "lucide-react";

const exerciseSchema = z.object({
  name: z.string().min(3, "O nome do exercício deve ter no mínimo 3 caracteres"),
  description: z.string().min(5, "A descrição deve ter no mínimo 5 caracteres"),
  instructions: z.string().optional(),
  sets: z.coerce.number().min(1, "Mínimo de 1 série"),
  reps: z.coerce.number().min(1, "Mínimo de 1 repetição"),
  category: z.string().min(1, "Categoria é obrigatória"),
});

const trainingSchema = z.object({
  name: z.string().min(3, "O nome do treino deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter no mínimo 10 caracteres"),
  focus: z.string().min(3, "O foco do treino deve ter no mínimo 3 caracteres"),
  scheduledDate: z.date().optional(),
  assignToAll: z.boolean().default(false),
  selectedAthletes: z.array(z.number()).optional(),
  exercises: z.array(exerciseSchema).min(1, "Adicione pelo menos um exercício"),
});

export default function CreateTraining() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedTraining, setSelectedTraining] = useState(null);
  
  // Fetch existing exercises
  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ["/api/exercises"],
  });
  
  // Fetch existing trainings
  const { data: trainings, isLoading: isLoadingTrainings } = useQuery({
    queryKey: ["/api/admin/trainings"],
  });
  
  // Fetch athletes
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ["/api/admin/athletes"],
  });
  
  // Setup form
  const form = useForm<z.infer<typeof trainingSchema>>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      name: "",
      description: "",
      focus: "",
      assignToAll: true,
      selectedAthletes: [],
      exercises: [
        {
          name: "",
          description: "",
          instructions: "",
          sets: 3,
          reps: 10,
          category: "Essencial",
        },
      ],
    },
  });
  
  // Setup field array for exercises
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });
  
  // Create training mutation
  const createTrainingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trainingSchema>) => {
      return await apiRequest("POST", "/api/admin/trainings", data);
    },
    onSuccess: () => {
      toast({
        title: "Treino criado",
        description: "O plano de treino foi criado com sucesso.",
      });
      form.reset({
        name: "",
        description: "",
        focus: "",
        assignToAll: true,
        selectedAthletes: [],
        exercises: [
          {
            name: "",
            description: "",
            instructions: "",
            sets: 3,
            reps: 10,
            category: "Essencial",
          },
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trainings"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar treino",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof trainingSchema>) => {
    createTrainingMutation.mutate(values);
  };
  
  const handleAddExercise = () => {
    append({
      name: "",
      description: "",
      instructions: "",
      sets: 3,
      reps: 10,
      category: "Essencial",
    });
  };
  
  const handleAddExistingExercise = (exercise: any) => {
    append({
      name: exercise.name,
      description: exercise.description,
      instructions: exercise.instructions || "",
      sets: exercise.sets || 3,
      reps: exercise.reps || 10,
      category: exercise.category || "Essencial",
    });
    
    toast({
      title: "Exercício adicionado",
      description: `${exercise.name} foi adicionado ao treino.`,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                Criar Treinos
              </h2>
              <p className="text-neutral-medium">
                Crie e gerencie planos de treino para os atletas
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="mb-4">
                <TabsTrigger value="create" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Treino
                </TabsTrigger>
                <TabsTrigger value="manage" className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  Gerenciar Treinos
                </TabsTrigger>
                <TabsTrigger value="exercises" className="flex items-center">
                  <Copy className="mr-2 h-4 w-4" />
                  Biblioteca de Exercícios
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>Novo Plano de Treino</CardTitle>
                    <CardDescription>
                      Crie um novo plano de treino e atribua aos atletas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Treino</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Treino de Arremessos" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="focus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Foco Principal</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Arremessos e Condicionamento" {...field} />
                                </FormControl>
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
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descreva os objetivos e a estrutura geral do treino"
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="scheduledDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Data Programada (opcional)</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "dd/MM/yyyy")
                                        ) : (
                                          <span>Selecione uma data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormDescription>
                                  Deixe em branco para salvar como modelo
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-3">
                            <FormField
                              control={form.control}
                              name="assignToAll"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Atribuir a todos os atletas ativos
                                    </FormLabel>
                                    <FormDescription>
                                      Se desmarcado, você poderá selecionar atletas específicos
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            {!form.watch("assignToAll") && (
                              <FormField
                                control={form.control}
                                name="selectedAthletes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Selecionar Atletas</FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={(value) => {
                                          // Handle multi-select athletes
                                          const athleteId = parseInt(value);
                                          const currentSelection = field.value || [];
                                          
                                          if (currentSelection.includes(athleteId)) {
                                            field.onChange(currentSelection.filter(id => id !== athleteId));
                                          } else {
                                            field.onChange([...currentSelection, athleteId]);
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione os atletas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {isLoadingAthletes ? (
                                            <SelectItem value="loading">Carregando atletas...</SelectItem>
                                          ) : athletes?.filter((a: any) => a.status === "active").map((athlete: any) => (
                                            <SelectItem key={athlete.id} value={athlete.id.toString()}>
                                              {athlete.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormDescription>
                                      {field.value?.length 
                                        ? `${field.value.length} atletas selecionados` 
                                        : "Nenhum atleta selecionado"}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-secondary">Exercícios</h3>
                            <div className="flex gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="flex items-center">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Usar Existente
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Adicionar Exercício Existente</h4>
                                    <div className="h-40 overflow-y-auto space-y-2">
                                      {isLoadingExercises ? (
                                        <p className="text-center py-4 text-sm">Carregando exercícios...</p>
                                      ) : exercises?.map((exercise: any) => (
                                        <div 
                                          key={exercise.id}
                                          className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                                          onClick={() => handleAddExistingExercise(exercise)}
                                        >
                                          <p className="font-medium">{exercise.name}</p>
                                          <p className="text-xs text-neutral-medium">{exercise.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddExercise}
                                className="flex items-center"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Exercício
                              </Button>
                            </div>
                          </div>
                          
                          {fields.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-md">
                              <p className="text-neutral-medium">
                                Nenhum exercício adicionado. Clique em "Novo Exercício" para adicionar.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {fields.map((field, index) => (
                                <Card key={field.id} className="relative">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4"
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                  <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <FormField
                                        control={form.control}
                                        name={`exercises.${index}.name`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Nome do Exercício</FormLabel>
                                            <FormControl>
                                              <Input placeholder="Ex: Arremessos de 3 pontos" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`exercises.${index}.category`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Categoria</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Selecione a categoria" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="Essencial">Essencial</SelectItem>
                                                <SelectItem value="Condicionamento">Condicionamento</SelectItem>
                                                <SelectItem value="Técnica">Técnica</SelectItem>
                                                <SelectItem value="Tático">Tático</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <FormField
                                        control={form.control}
                                        name={`exercises.${index}.sets`}
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
                                        name={`exercises.${index}.reps`}
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
                                    </div>
                                    
                                    <FormField
                                      control={form.control}
                                      name={`exercises.${index}.description`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Descrição</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Ex: 5 séries × 10 arremessos" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`exercises.${index}.instructions`}
                                      render={({ field }) => (
                                        <FormItem className="mt-4">
                                          <FormLabel>Instruções (opcional)</FormLabel>
                                          <FormControl>
                                            <Textarea 
                                              placeholder="Instruções detalhadas para o exercício"
                                              className="resize-none"
                                              rows={2}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="flex items-center"
                            disabled={createTrainingMutation.isPending}
                          >
                            <SaveIcon className="mr-2 h-4 w-4" />
                            {createTrainingMutation.isPending ? "Salvando..." : "Salvar Treino"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="manage">
                <Card>
                  <CardHeader>
                    <CardTitle>Gerenciar Treinos</CardTitle>
                    <CardDescription>
                      Visualize, edite e atribua treinos existentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTrainings ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-neutral-medium">Carregando treinos...</p>
                      </div>
                    ) : !trainings || trainings.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-md">
                        <p className="text-neutral-medium">
                          Nenhum treino criado ainda. Vá para a aba "Criar Novo Treino" para começar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {trainings.map((training: any) => (
                          <Card key={training.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-heading font-semibold text-lg text-secondary">
                                    {training.name}
                                  </h3>
                                  <p className="text-sm text-neutral-medium">
                                    Foco: {training.focus}
                                  </p>
                                  <p className="text-sm text-neutral-medium mt-1">
                                    {training.exercises?.length || 0} exercícios • 
                                    {training.scheduledDate 
                                      ? ` Programado para ${format(new Date(training.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}` 
                                      : " Sem data programada"}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Copy className="h-4 w-4 mr-1" />
                                    Duplicar
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="exercises">
                <Card>
                  <CardHeader>
                    <CardTitle>Biblioteca de Exercícios</CardTitle>
                    <CardDescription>
                      Visualize e gerencie a biblioteca de exercícios disponíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingExercises ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-neutral-medium">Carregando exercícios...</p>
                      </div>
                    ) : !exercises || exercises.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-md">
                        <p className="text-neutral-medium">
                          Nenhum exercício cadastrado ainda. Os exercícios são adicionados automaticamente quando você cria treinos.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exercises.map((exercise: any) => (
                          <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-heading font-semibold text-lg text-secondary">
                                    {exercise.name}
                                  </h3>
                                  <p className="text-sm text-neutral-medium">
                                    {exercise.description}
                                  </p>
                                  {exercise.category && (
                                    <div className="mt-2">
                                      <span className="text-xs px-2 py-1 bg-neutral-lightest rounded-full">
                                        {exercise.category}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAddExistingExercise(exercise)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
