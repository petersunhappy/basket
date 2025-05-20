import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Edit, User, Lock, Shield } from "lucide-react";
import React from "react";

const profileFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  avatar: z.string().url("URL inválida").optional().or(z.literal("")),
  position: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  birthdate: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "A senha atual deve ter no mínimo 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação da senha deve ter no mínimo 6 caracteres"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });
  
  // Setup profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      avatar: profile?.avatar || "",
      position: profile?.position || "",
      height: profile?.height || "",
      weight: profile?.weight || "",
      birthdate: profile?.birthdate || "",
    },
  });
  
  // Setup password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordFormSchema>) => {
      return await apiRequest("POST", "/api/user/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      passwordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update profile form with fetched data when available
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || "",
        email: profile.email || "",
        avatar: profile.avatar || "",
        position: profile.position || "",
        height: profile.height || "",
        weight: profile.weight || "",
        birthdate: profile.birthdate ? profile.birthdate.substring(0, 10) : "",
      });
    }
  }, [profile, profileForm]);
  
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };
  
  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate(values);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-medium">Carregando perfil...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                Meu Perfil
              </h2>
              <p className="text-neutral-medium">
                Gerencie suas informações pessoais e preferências de conta
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Profile Summary */}
              <Card className="md:col-span-1">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profile?.avatar} alt={profile?.name} />
                      <AvatarFallback className="bg-primary text-white text-xl">
                        {getInitials(profile?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-heading font-bold text-xl text-center">{profile?.name}</h3>
                    <p className="text-neutral-medium text-sm mt-1">{profile?.position || "Atleta"}</p>
                    <Badge className="mt-3" variant={user?.role === "coach" ? "accent" : "default"}>
                      {user?.role === "coach" ? "Treinador" : "Atleta"}
                    </Badge>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-medium">Membro desde</span>
                      <span className="text-sm font-medium">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-medium">Treinos concluídos</span>
                      <span className="text-sm font-medium">{profile?.completedWorkouts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-medium">Altura</span>
                      <span className="text-sm font-medium">{profile?.height || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-medium">Peso</span>
                      <span className="text-sm font-medium">{profile?.weight || "-"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Profile Settings */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Configurações de Perfil</CardTitle>
                  <CardDescription>
                    Gerencie seu perfil e preferências de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="personal">
                    <TabsList className="mb-6">
                      <TabsTrigger value="personal" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Dados Pessoais
                      </TabsTrigger>
                      <TabsTrigger value="security" className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Segurança
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome Completo</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Seu nome completo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="seu.email@exemplo.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="avatar"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL da Foto de Perfil</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://exemplo.com/avatar.jpg" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Link para sua foto de perfil
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
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
                              control={profileForm.control}
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
                              control={profileForm.control}
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
                            
                            <FormField
                              control={profileForm.control}
                              name="birthdate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data de Nascimento</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button type="submit" className="flex items-center" disabled={updateProfileMutation.isPending}>
                              <Edit className="mr-2 h-4 w-4" />
                              {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    <TabsContent value="security">
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha Atual</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Sua senha atual" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nova Senha</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Nova senha" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Mínimo de 6 caracteres
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirmar Nova Senha</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Confirmar nova senha" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button type="submit" variant="outline" className="flex items-center" disabled={changePasswordMutation.isPending}>
                              <Shield className="mr-2 h-4 w-4" />
                              {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
