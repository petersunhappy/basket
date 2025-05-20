import { useEffect } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Volleyball, Users, Calendar, Clipboard } from "lucide-react";

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, "O nome de usuário deve ter no mínimo 3 caracteres"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// Registration schema
const registerSchema = z.object({
  name: z.string().min(3, "O nome completo deve ter no mínimo 3 caracteres"),
  username: z.string().min(3, "O nome de usuário deve ter no mínimo 3 caracteres"),
  email: z.string().email("Forneça um email válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Setup login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Setup registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  // Handle registration form submission
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate({ ...userData, role: "athlete" });
  };

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-neutral-lightest flex flex-col md:flex-row">
      {/* Left column - Authentication forms */}
      <div className="md:w-1/2 p-6 md:p-10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-primary rounded-full flex items-center justify-center">
              <span className="font-accent font-bold text-2xl text-white">BT</span>
            </div>
            <CardTitle className="text-2xl font-bold text-secondary">BasketTeam Portal</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar treinos e acompanhar seu progresso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Digite sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full mt-4" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Registration Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Escolha um nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Digite seu email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Crie uma senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirme sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full mt-4" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Right column - Hero content */}
      <div className="md:w-1/2 bg-secondary text-white p-6 md:p-10 flex items-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-6">
            Seu portal completo para evolução no basquete
          </h1>
          <p className="text-lg mb-8">
            Gerencie seus treinos, acompanhe seu progresso e mantenha-se conectado com sua equipe em um só lugar.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-primary rounded-full p-2 mr-4">
                <Volleyball className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl">Treinos Personalizados</h3>
                <p className="text-neutral-light">Acesse planos de treinamento detalhados criados especificamente para você e sua posição.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-accent rounded-full p-2 mr-4">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl">Calendário Integrado</h3>
                <p className="text-neutral-light">Nunca perca um treino ou jogo com o calendário completo da equipe sempre atualizado.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary rounded-full p-2 mr-4">
                <Clipboard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl">Registro de Progresso</h3>
                <p className="text-neutral-light">Acompanhe sua evolução com gráficos detalhados e histórico completo de atividades.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-accent rounded-full p-2 mr-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl">Comunicação da Equipe</h3>
                <p className="text-neutral-light">Acesse notícias exclusivas e mantenha-se informado sobre todas as novidades do time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
