import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { Plus, Search, Edit, UserPlus, X } from "lucide-react";

const athleteFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  username: z.string().min(3, "O nome de usuário deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  position: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  status: z.enum(["active", "injured", "suspended", "inactive"]),
});

export default function ManageAthletes() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  
  // Fetch athletes
  const { data: athletes, isLoading } = useQuery({
    queryKey: ["/api/admin/athletes"],
  });
  
  // Setup form
  const form = useForm<z.infer<typeof athleteFormSchema>>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      position: "",
      height: "",
      weight: "",
      status: "active",
    },
  });
  
  // Create athlete mutation
  const createAthleteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof athleteFormSchema>) => {
      return await apiRequest("POST", "/api/admin/athletes", {
        ...data,
        role: "athlete",
      });
    },
    onSuccess: () => {
      toast({
        title: "Atleta criado",
        description: "O atleta foi adicionado com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/athletes"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar atleta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update athlete status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ athleteId, status }: { athleteId: number, status: string }) => {
      return await apiRequest("PATCH", `/api/admin/athletes/${athleteId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do atleta foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/athletes"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof athleteFormSchema>) => {
    createAthleteMutation.mutate(values);
  };
  
  const handleChangeStatus = (athleteId: number, status: string) => {
    updateStatusMutation.mutate({ athleteId, status });
  };
  
  // Filter athletes based on search query
  const filteredAthletes = athletes?.filter((athlete: any) => {
    const query = searchQuery.toLowerCase();
    return (
      athlete.name.toLowerCase().includes(query) ||
      athlete.username.toLowerCase().includes(query) ||
      athlete.email.toLowerCase().includes(query) ||
      (athlete.position && athlete.position.toLowerCase().includes(query))
    );
  }) || [];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "injured": return "bg-red-100 text-red-700";
      case "suspended": return "bg-yellow-100 text-yellow-700";
      case "inactive": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                  Gestão de Atletas
                </h2>
                <p className="text-neutral-medium">
                  Gerencie atletas, visualize informações e ajuste status
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Button onClick={() => setIsDialogOpen(true)} className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Atleta
                </Button>
              </div>
            </div>
            
            {/* Search and filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-medium" />
                    <Input
                      placeholder="Buscar por nome, username, email..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value="all"
                    onValueChange={(value) => console.log(value)}
                    defaultValue="all"
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="injured">Lesionados</SelectItem>
                      <SelectItem value="suspended">Suspensos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Athletes list */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Atletas</CardTitle>
                <CardDescription>
                  {filteredAthletes.length} atletas encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-neutral-medium">Carregando atletas...</p>
                  </div>
                ) : filteredAthletes.length === 0 ? (
                  <div className="text-center py-8 text-neutral-medium">
                    {searchQuery 
                      ? "Nenhum atleta encontrado para a busca atual."
                      : "Nenhum atleta cadastrado ainda."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Atleta</TableHead>
                          <TableHead>Posição</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Treinos</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAthletes.map((athlete: any) => (
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
                                  <p className="text-sm text-neutral-medium">@{athlete.username}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{athlete.position || "-"}</TableCell>
                            <TableCell>{athlete.email}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(athlete.status)}>
                                {athlete.status === "active" && "Ativo"}
                                {athlete.status === "injured" && "Lesionado"}
                                {athlete.status === "suspended" && "Suspenso"}
                                {athlete.status === "inactive" && "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>{athlete.completedWorkouts || 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Select
                                  defaultValue={athlete.status}
                                  onValueChange={(value) => handleChangeStatus(athlete.id, value)}
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Alterar status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="injured">Lesionado</SelectItem>
                                    <SelectItem value="suspended">Suspenso</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add Athlete Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Atleta</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do atleta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de Usuário</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Senha inicial" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posição</FormLabel>
                            <FormControl>
                              <Input placeholder="Ala / Pivô / Armador" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="injured">Lesionado</SelectItem>
                                <SelectItem value="suspended">Suspenso</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altura (cm)</FormLabel>
                            <FormControl>
                              <Input placeholder="185" {...field} />
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
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input placeholder="80" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createAthleteMutation.isPending}>
                        {createAthleteMutation.isPending ? "Criando..." : "Adicionar Atleta"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
