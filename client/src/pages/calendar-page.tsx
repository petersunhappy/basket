import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useCalendar } from "@/hooks/use-calendar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@shared/types";

const eventFormSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  date: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  location: z.string().min(3, "O local deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(["game", "training", "other"]),
});

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { formatEventDate } = useCalendar();
  
  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });
  
  // Setup form
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      time: "15:00",
      location: "",
      description: "",
      type: "training",
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventFormSchema>) => {
      // Combine date and time
      const dateTimeStr = `${format(data.date, 'yyyy-MM-dd')}T${data.time}:00`;
      const dateTime = new Date(dateTimeStr);
      
      const eventData = {
        ...data,
        date: dateTime.toISOString(),
      };
      
      return await apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      toast({
        title: "Evento criado",
        description: "O evento foi adicionado ao calendário.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get selected date events
  const selectedDateEvents = events?.filter((event: Event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  }) || [];
  
  const onSubmit = (values: z.infer<typeof eventFormSchema>) => {
    createEventMutation.mutate(values);
  };
  
  // Check if user is coach to show create event button
  const isCoach = user?.role === "coach";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                  Calendário da Equipe
                </h2>
                <p className="text-neutral-medium">
                  Visualize jogos, treinos e eventos da equipe
                </p>
              </div>
              
              {isCoach && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Evento</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input placeholder="Título do evento" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Data</FormLabel>
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
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Local</FormLabel>
                              <FormControl>
                                <Input placeholder="Local do evento" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo do evento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="game">Jogo</SelectItem>
                                  <SelectItem value="training">Treino</SelectItem>
                                  <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                              </Select>
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
                                  placeholder="Detalhes do evento (opcional)"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" disabled={createEventMutation.isPending}>
                            {createEventMutation.isPending ? "Criando..." : "Criar Evento"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Calendar */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Calendário</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(date) => setDate(date || new Date())}
                    className="rounded-md border"
                    modifiers={{
                      hasEvent: events?.map(event => new Date(event.date)) || [],
                    }}
                    modifiersStyles={{
                      hasEvent: {
                        backgroundColor: "rgba(230, 57, 70, 0.1)",
                        fontWeight: "bold",
                        borderRadius: "4px",
                      }
                    }}
                  />
                </CardContent>
              </Card>
              
              {/* Events for selected date */}
              <Card>
                <CardHeader>
                  <CardTitle>Eventos do Dia</CardTitle>
                  <CardDescription>
                    {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Carregando eventos...</div>
                  ) : selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8 text-neutral-medium">
                      Nenhum evento agendado para esta data.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event: Event) => {
                        // Determine border color based on event type
                        const borderColor = event.type === "game" 
                          ? "border-accent" 
                          : event.type === "training" 
                            ? "border-primary" 
                            : "border-secondary";
                        
                        return (
                          <div 
                            key={event.id} 
                            className={`p-4 border-l-4 ${borderColor} rounded-r-md bg-white shadow-sm`}
                          >
                            <h3 className="font-semibold text-lg text-secondary">{event.title}</h3>
                            <p className="text-neutral-medium text-sm">
                              {format(parseISO(event.date), "HH:mm", { locale: ptBR })} • {event.location}
                            </p>
                            {event.description && (
                              <p className="mt-2 text-sm">{event.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Upcoming Events List */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Eventos que ocorrerão nas próximas semanas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Carregando eventos...</div>
                ) : !events || events.length === 0 ? (
                  <div className="text-center py-4 text-neutral-medium">
                    Nenhum evento futuro agendado.
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Evento</th>
                          <th className="text-left py-3 px-4">Data</th>
                          <th className="text-left py-3 px-4">Local</th>
                          <th className="text-left py-3 px-4">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events
                          .filter((event: Event) => new Date(event.date) >= new Date())
                          .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, 10)
                          .map((event: Event) => {
                            const eventTypeLabel = 
                              event.type === "game" ? "Jogo" : 
                              event.type === "training" ? "Treino" : "Outro";
                            
                            const eventTypeBadge = 
                              event.type === "game" ? "bg-accent text-secondary" : 
                              event.type === "training" ? "bg-primary text-white" : 
                              "bg-secondary text-white";
                            
                            return (
                              <tr key={event.id} className="border-b hover:bg-neutral-lightest">
                                <td className="py-3 px-4 font-medium">{event.title}</td>
                                <td className="py-3 px-4">{formatEventDate(event.date)}</td>
                                <td className="py-3 px-4">{event.location}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${eventTypeBadge}`}>
                                    {eventTypeLabel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
