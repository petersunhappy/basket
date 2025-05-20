import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ExerciseItem } from "@/components/training/exercise-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Exercise } from "@shared/types";

export default function TrainingPage() {
  const { toast } = useToast();
  
  // Fetch today's training plan
  const { data: training, isLoading } = useQuery({
    queryKey: ["/api/training/today"],
  });
  
  // Mutation to register exercise completion
  const registerExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, data }: { exerciseId: number, data: any }) => {
      return await apiRequest("POST", `/api/exercises/${exerciseId}/register`, data);
    },
    onSuccess: () => {
      toast({
        title: "Exercício registrado",
        description: "Seu progresso foi salvo com sucesso!",
      });
      // Refresh the training data
      queryClient.invalidateQueries({ queryKey: ["/api/training/today"] });
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
  
  // Mutation to complete all exercises
  const completeAllExercisesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/training/today/complete", {});
    },
    onSuccess: () => {
      toast({
        title: "Treino concluído",
        description: "Todos os exercícios foram marcados como concluídos!",
      });
      // Refresh the training data
      queryClient.invalidateQueries({ queryKey: ["/api/training/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao concluir treino",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleRegisterExercise = (exerciseId: number, data: any) => {
    registerExerciseMutation.mutate({ exerciseId, data });
  };
  
  const handleCompleteAll = () => {
    completeAllExercisesMutation.mutate();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                Treino do Dia
              </h2>
              <p className="text-neutral-medium">
                Complete os exercícios abaixo e registre seu progresso.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
                  <p className="text-neutral-medium">Carregando seu treino...</p>
                </div>
              </div>
            ) : !training || !training.exercises || training.exercises.length === 0 ? (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-heading font-bold text-secondary">
                    Nenhum treino disponível para hoje
                  </CardTitle>
                  <CardDescription>
                    Aproveite seu dia de descanso ou confira seu histórico de treinos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <Button variant="outline">Ver treinos anteriores</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="bg-secondary text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-heading text-xl">
                      {training.name || "Treino do Dia"}
                    </CardTitle>
                    <span className="text-sm bg-accent text-secondary px-3 py-1 rounded-full font-semibold">
                      Treino #{training.id}
                    </span>
                  </div>
                  <CardDescription className="text-neutral-light mt-2">
                    {training.description || `Foco: ${training.focus}`}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="font-heading font-semibold text-lg text-secondary mb-2">
                      Instruções do treinador
                    </h3>
                    <p className="text-neutral-medium">
                      {training.instructions || "Complete todos os exercícios abaixo e registre seus resultados. Preste atenção à técnica correta durante cada execução."}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    {training.exercises.map((exercise: Exercise) => (
                      <ExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        onRegister={handleRegisterExercise}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button 
                      onClick={handleCompleteAll}
                      disabled={completeAllExercisesMutation.isPending}
                      className="flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {completeAllExercisesMutation.isPending ? "Processando..." : "Concluir Todos"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
