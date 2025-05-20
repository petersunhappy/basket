import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { NewsItem } from "@/components/news/news-item";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { News } from "@shared/types";
import { useLocation } from "wouter";

const newsFormSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter no mínimo 10 caracteres"),
  imageUrl: z.string().url("URL da imagem inválida").optional(),
  isPublic: z.boolean().default(false),
});

export default function NewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isPublicPage = location === "/public/news";
  
  // Fetch news
  const { data: news, isLoading } = useQuery({
    queryKey: [isPublicPage ? "/api/news/public" : "/api/news"],
  });
  
  // Setup form
  const form = useForm<z.infer<typeof newsFormSchema>>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      isPublic: false,
    },
  });
  
  // Create news mutation
  const createNewsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newsFormSchema>) => {
      return await apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      toast({
        title: "Notícia criada",
        description: "A notícia foi publicada com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/public"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar notícia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter news by type
  const publicNews = news?.filter((item: News) => item.isPublic) || [];
  const internalNews = news?.filter((item: News) => !item.isPublic) || [];
  
  const onSubmit = (values: z.infer<typeof newsFormSchema>) => {
    createNewsMutation.mutate(values);
  };
  
  // Check if user is coach to show create news button
  const isCoach = user?.role === "coach";
  const showCreateNewsButton = isCoach && !isPublicPage;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {!isPublicPage && <Sidebar />}
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                  {isPublicPage ? "Notícias do Time" : "Central de Notícias"}
                </h2>
                <p className="text-neutral-medium">
                  {isPublicPage 
                    ? "Fique por dentro das últimas notícias do nosso time" 
                    : "Acompanhe as últimas novidades e comunicados internos"}
                </p>
              </div>
              
              {showCreateNewsButton && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <Button onClick={() => setIsDialogOpen(true)} className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Notícia
                  </Button>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Notícia</DialogTitle>
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
                                <Input placeholder="Título da notícia" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Conteúdo</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Conteúdo da notícia"
                                  className="min-h-[200px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL da Imagem (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isPublic"
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
                                  Notícia Pública
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Se marcado, a notícia será visível para todos, incluindo visitantes não autenticados.
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" disabled={createNewsMutation.isPending}>
                            {createNewsMutation.isPending ? "Publicando..." : "Publicar Notícia"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {isPublicPage ? (
              // Public news page layout
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-3 text-center py-8">Carregando notícias...</div>
                ) : publicNews.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-neutral-medium">
                    Nenhuma notícia disponível no momento.
                  </div>
                ) : (
                  publicNews.map((item: News) => (
                    <Card key={item.id} className="overflow-hidden">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <CardContent className="p-4 pt-6">
                        <h3 className="font-heading font-semibold text-xl mb-2 text-secondary">
                          {item.title}
                        </h3>
                        <p className="text-neutral-medium mb-4">
                          {item.content.length > 200
                            ? `${item.content.substring(0, 200)}...`
                            : item.content}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-medium">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge variant="public">Notícia Pública</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              // Internal news page layout with tabs
              <Card>
                <CardHeader>
                  <CardTitle>Notícias e Comunicados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                      <TabsTrigger value="all">Todas</TabsTrigger>
                      <TabsTrigger value="internal">Internas</TabsTrigger>
                      <TabsTrigger value="public">Públicas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      {isLoading ? (
                        <div className="text-center py-8">Carregando notícias...</div>
                      ) : news?.length === 0 ? (
                        <div className="text-center py-8 text-neutral-medium">
                          Nenhuma notícia disponível no momento.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {news.map((item: News) => (
                            <NewsItem key={item.id} news={item} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="internal">
                      {isLoading ? (
                        <div className="text-center py-8">Carregando notícias...</div>
                      ) : internalNews.length === 0 ? (
                        <div className="text-center py-8 text-neutral-medium">
                          Nenhuma notícia interna disponível no momento.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {internalNews.map((item: News) => (
                            <NewsItem key={item.id} news={item} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="public">
                      {isLoading ? (
                        <div className="text-center py-8">Carregando notícias...</div>
                      ) : publicNews.length === 0 ? (
                        <div className="text-center py-8 text-neutral-medium">
                          Nenhuma notícia pública disponível no momento.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {publicNews.map((item: News) => (
                            <NewsItem key={item.id} news={item} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
