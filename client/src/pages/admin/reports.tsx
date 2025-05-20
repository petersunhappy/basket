import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FileDown, Filter, Search, Users, PieChart as PieChartIcon, ActivitySquare } from "lucide-react";

export default function Reports() {
  const [athleteFilter, setAthleteFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("30days");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch athletes
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ["/api/admin/athletes"],
  });

  // Fetch report data
  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ["/api/admin/reports", athleteFilter, periodFilter],
  });

  // Mock data for charts (until backend is implemented)
  const completionData = [
    { name: "Marcus", completed: 85, goal: 100 },
    { name: "Pedro", completed: 65, goal: 100 },
    { name: "João", completed: 92, goal: 100 },
  ];

  const progressData = [
    { date: "01/06", accuracy: 60, effort: 3 },
    { date: "05/06", accuracy: 65, effort: 4 },
    { date: "10/06", accuracy: 70, effort: 3 },
    { date: "15/06", accuracy: 75, effort: 4 },
    { date: "20/06", accuracy: 78, effort: 2 },
    { date: "25/06", accuracy: 85, effort: 3 },
  ];

  const exerciseTypeData = [
    { name: "Arremessos", value: 35 },
    { name: "Condicionamento", value: 20 },
    { name: "Técnica", value: 25 },
    { name: "Tático", value: 20 },
  ];

  const COLORS = ["#E63946", "#1D3557", "#FFD700", "#457B9D"];

  // Filter athletes based on search query
  const filteredAthletes = athletes?.filter((athlete: any) => {
    if (!searchQuery) return true;
    return (
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      athlete.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.position?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                Relatórios e Análises
              </h2>
              <p className="text-neutral-medium">
                Visualize e exporte relatórios detalhados sobre o progresso da equipe
              </p>
            </div>
            
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={athleteFilter} onValueChange={setAthleteFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um atleta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os atletas</SelectItem>
                        {!isLoadingAthletes && athletes?.map((athlete: any) => (
                          <SelectItem key={athlete.id} value={athlete.id.toString()}>
                            {athlete.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
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
                  <Button className="flex items-center">
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Dashboard Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Taxa de Conclusão</CardTitle>
                  <CardDescription>Média de conclusão dos treinos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-accent font-bold text-primary">78%</div>
                  <p className="text-sm text-neutral-medium mt-1">Meta: 85%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Presença nos Treinos</CardTitle>
                  <CardDescription>Frequência de participação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-accent font-bold text-accent">92%</div>
                  <p className="text-sm text-neutral-medium mt-1">Meta: 90%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Exercícios Registrados</CardTitle>
                  <CardDescription>Total de exercícios concluídos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-accent font-bold text-secondary">324</div>
                  <p className="text-sm text-neutral-medium mt-1">Último mês: +78</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Data Visualization Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center">
                  <ActivitySquare className="mr-2 h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="athletes" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Atletas
                </TabsTrigger>
                <TabsTrigger value="exercises" className="flex items-center">
                  <PieChartIcon className="mr-2 h-4 w-4" />
                  Exercícios
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conclusão de Treinos por Atleta</CardTitle>
                      <CardDescription>
                        Comparação da taxa de conclusão entre atletas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={completionData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" fill="#E63946" name="Concluído (%)" />
                            <Bar dataKey="goal" fill="#1D3557" name="Meta (%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Progresso ao Longo do Tempo</CardTitle>
                      <CardDescription>
                        Evolução da precisão e esforço nos treinos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={progressData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                            <Tooltip />
                            <Legend />
                            <Line 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="accuracy" 
                              stroke="#E63946" 
                              name="Precisão (%)" 
                              activeDot={{ r: 8 }}
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="effort" 
                              stroke="#FFD700" 
                              name="Nível de Esforço" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição por Tipo de Exercício</CardTitle>
                      <CardDescription>
                        Frequência dos diferentes tipos de exercícios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={exerciseTypeData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {exerciseTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Observações do Treinador</CardTitle>
                      <CardDescription>
                        Resumo e pontos de atenção identificados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-secondary">Pontos Fortes</h4>
                          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>Alta taxa de presença nos treinos</li>
                            <li>Melhoria contínua nos exercícios de arremesso</li>
                            <li>Boa adaptação ao novo sistema defensivo</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-secondary">Pontos de Atenção</h4>
                          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>Necessidade de maior foco nos exercícios táticos</li>
                            <li>Melhorar a taxa de conclusão de treinos</li>
                            <li>Intensificar exercícios de condicionamento</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="athletes">
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho dos Atletas</CardTitle>
                    <CardDescription>
                      Análise detalhada por atleta no período selecionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-medium" />
                        <Input
                          placeholder="Buscar atleta..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Atleta</TableHead>
                            <TableHead>Treinos Concluídos</TableHead>
                            <TableHead>Taxa de Conclusão</TableHead>
                            <TableHead>Precisão Média</TableHead>
                            <TableHead>Esforço Percebido</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingAthletes ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                Carregando dados dos atletas...
                              </TableCell>
                            </TableRow>
                          ) : filteredAthletes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                Nenhum atleta encontrado com os filtros selecionados.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredAthletes.map((athlete: any) => (
                              <TableRow key={athlete.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar>
                                      <AvatarImage src={athlete.avatar} alt={athlete.name} />
                                      <AvatarFallback className="bg-primary text-white">
                                        {getInitials(athlete.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{athlete.name}</p>
                                      <p className="text-sm text-neutral-medium">
                                        {athlete.position || "-"}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{athlete.completedWorkouts || 0}</TableCell>
                                <TableCell>
                                  {Math.floor(Math.random() * 30) + 70}%
                                </TableCell>
                                <TableCell>
                                  {Math.floor(Math.random() * 30) + 70}%
                                </TableCell>
                                <TableCell>
                                  {["Baixo", "Moderado", "Alto"][Math.floor(Math.random() * 3)]}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={athlete.status === "active" ? "default" : "outline"}>
                                    {athlete.status === "active" ? "Ativo" : 
                                     athlete.status === "injured" ? "Lesionado" : 
                                     athlete.status === "suspended" ? "Suspenso" : "Inativo"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6 flex justify-between">
                    <div>
                      <span className="text-sm text-neutral-medium">
                        Mostrando {filteredAthletes.length} de {athletes?.length || 0} atletas
                      </span>
                    </div>
                    <Button variant="outline" className="flex items-center">
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar Dados
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="exercises">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exercícios Mais Realizados</CardTitle>
                      <CardDescription>
                        Top 5 exercícios mais frequentes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={[
                              { name: "Arremessos de 3 pontos", count: 87 },
                              { name: "Dribles e finalização", count: 75 },
                              { name: "Passes de peito", count: 68 },
                              { name: "Corrida intervalada", count: 62 },
                              { name: "Passes em movimento", count: 54 },
                            ]}
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Bar dataKey="count" fill="#E63946" name="Frequência" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Taxa de Conclusão por Exercício</CardTitle>
                      <CardDescription>
                        Comparação entre diferentes exercícios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: "Arremessos", completion: 92 },
                              { name: "Passes", completion: 88 },
                              { name: "Dribles", completion: 75 },
                              { name: "Condicionamento", completion: 65 },
                              { name: "Táticos", completion: 80 },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="completion" fill="#1D3557" name="Taxa de Conclusão (%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Análise de Desempenho por Categoria</CardTitle>
                      <CardDescription>
                        Médias de conclusão e precisão por categoria de exercício
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Categoria</TableHead>
                              <TableHead>Total de Exercícios</TableHead>
                              <TableHead>Taxa de Conclusão</TableHead>
                              <TableHead>Precisão Média</TableHead>
                              <TableHead>Esforço Médio</TableHead>
                              <TableHead>Pontuação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Essencial</TableCell>
                              <TableCell>156</TableCell>
                              <TableCell>87%</TableCell>
                              <TableCell>82%</TableCell>
                              <TableCell>Moderado</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-700">Alto</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Condicionamento</TableCell>
                              <TableCell>98</TableCell>
                              <TableCell>72%</TableCell>
                              <TableCell>68%</TableCell>
                              <TableCell>Alto</TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-700">Médio</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Técnica</TableCell>
                              <TableCell>42</TableCell>
                              <TableCell>89%</TableCell>
                              <TableCell>85%</TableCell>
                              <TableCell>Moderado</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-700">Alto</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Tático</TableCell>
                              <TableCell>28</TableCell>
                              <TableCell>76%</TableCell>
                              <TableCell>70%</TableCell>
                              <TableCell>Moderado</TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-700">Médio</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 text-sm text-neutral-medium">
                        <p>
                          <strong>Pontuação:</strong> Calculada com base na taxa de conclusão, precisão e nível de esforço.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
