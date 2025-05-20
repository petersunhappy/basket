import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DownloadIcon, FilterIcon } from "lucide-react";

export default function ExerciseHistory() {
  const [period, setPeriod] = useState("30days");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [exercise, setExercise] = useState<string>("all");
  
  // Fetch exercise history
  const { data: history, isLoading } = useQuery({
    queryKey: ["/api/exercises/history", period, exercise, selectedDate],
  });
  
  // Fetch available exercises for filter
  const { data: exercises } = useQuery({
    queryKey: ["/api/exercises"],
  });
  
  // Format progress data for charts
  const getProgressData = () => {
    if (!history?.progress) return [];
    
    return history.progress.map((item: any) => ({
      date: formatDate(item.date),
      ...item.data
    }));
  };
  
  const handleExport = () => {
    // Logic to export history data
    console.log("Exporting data...");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
              <div>
                <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                  Meu Histórico de Treinos
                </h2>
                <p className="text-neutral-medium">
                  Visualize seu progresso e histórico de exercícios completos.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button variant="outline" onClick={handleExport} className="flex items-center">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Filters */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FilterIcon className="mr-2 h-5 w-5" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Período</label>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Últimos 7 dias</SelectItem>
                        <SelectItem value="30days">Últimos 30 dias</SelectItem>
                        <SelectItem value="90days">Últimos 3 meses</SelectItem>
                        <SelectItem value="year">Este ano</SelectItem>
                        <SelectItem value="all">Todo o histórico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exercício</label>
                    <Select value={exercise} onValueChange={setExercise}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o exercício" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os exercícios</SelectItem>
                        {exercises?.map((ex: any) => (
                          <SelectItem key={ex.id} value={ex.id.toString()}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data específica</label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="border rounded-md p-3"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* History Content */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progresso</CardTitle>
                    <CardDescription>
                      Visualize a evolução do seu desempenho ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="accuracy">
                      <TabsList className="mb-4">
                        <TabsTrigger value="accuracy">Taxa de Acerto</TabsTrigger>
                        <TabsTrigger value="completion">Conclusão</TabsTrigger>
                        <TabsTrigger value="weight">Carga</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="accuracy">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getProgressData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="accuracy" stroke="#E63946" name="Taxa de Acerto (%)" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="completion">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getProgressData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="completion" stroke="#1D3557" name="Taxa de Conclusão (%)" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="weight">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getProgressData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="weight" fill="#FFD700" name="Carga (kg)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico Detalhado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Carregando histórico...</div>
                    ) : !history?.logs || history.logs.length === 0 ? (
                      <div className="text-center py-4 text-neutral-medium">
                        Nenhum registro encontrado para os filtros selecionados.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Exercício</TableHead>
                              <TableHead>Séries × Reps</TableHead>
                              <TableHead>Conclusão</TableHead>
                              <TableHead>Esforço</TableHead>
                              <TableHead>Acerto</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {history.logs.map((log: any) => (
                              <TableRow key={log.id}>
                                <TableCell>{formatDate(log.date)}</TableCell>
                                <TableCell>{log.exercise.name}</TableCell>
                                <TableCell>
                                  {log.sets} × {log.reps}
                                  {log.weight ? ` (${log.weight}kg)` : ''}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={parseInt(log.completion) >= 80 ? "default" : "outline"}>
                                    {log.completion}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={
                                    log.effort === "Fácil" ? "outline" :
                                    log.effort === "Moderado" ? "secondary" : "destructive"
                                  }>
                                    {log.effort}
                                  </Badge>
                                </TableCell>
                                <TableCell>{log.accuracy}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
