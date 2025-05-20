// ... (previous imports and code)

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  // Destructure data with defaults in case data is loading
  const {
    stats = {
      completedWorkouts: 0,
      totalWorkouts: 30,
      nextGameDays: 0,
      notifications: 0,
      nextGame: null
    },
    todayTraining = null, // Set a proper default here, maybe null initially
    activities = [],
    events = [],
    news = []
  } = dashboardData || {};

  const handleRegisterExercise = async (exerciseId: number, data: any) => {
    // Logic to register exercise
    console.log("Registering exercise", exerciseId, data);
  };

  // Format date for display
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              // --- Loading State ---
              <div className="flex justify-center items-center h-64">
                <p>Carregando dados do dashboard...</p> {/* Replace with a spinner or loading component */}
              </div>
            ) : (
              // --- Content once loaded ---
              <>
                {/* Dashboard Welcome Section */}
                <div className="mb-8">
                  <h2 className="text-3xl font-heading font-bold text-secondary mb-2">
                    Bem-vindo, {user?.name.split(' ')[0]}!
                  </h2>
                  <p className="text-neutral-medium">
                    Confira seu progresso e atividades para hoje, {formattedDate}.
                  </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* ... (StatsCard components) ... */}
                  <StatsCard
                    title="Treinos Concluídos"
                    value={stats.completedWorkouts}
                    icon={Check}
                    color="primary"
                    progress={{
                      value: stats.completedWorkouts,
                      max: stats.totalWorkouts,
                      label: "Meta mensal"
                    }}
                  />

                  <StatsCard
                    title="Próximo Jogo"
                    value={`Em ${stats.nextGameDays} dias`}
                    icon={Clock}
                    color="accent"
                    subtext={stats.nextGame?.opponent || "Não há jogos agendados"}
                    date={stats.nextGame?.date ? formatDate(stats.nextGame.date) : undefined}
                  />

                  <StatsCard
                    title="Notificações"
                    value={stats.notifications}
                    icon={Bell}
                    color="secondary"
                    subtext={stats.notifications > 0 ? "Ver todas as notificações" : "Não há notificações"}
                  />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column (2/3 width on lg) */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Today's Training Plan */}
                    <Card className="overflow-hidden">
                      <div className="bg-secondary p-4 text-white flex justify-between items-center">
                        <CardTitle className="font-heading font-bold text-xl">Treino do Dia</CardTitle>
                        <span className="text-sm bg-accent text-secondary px-3 py-1 rounded-full font-semibold">
                          {todayTraining ? `Treino #${todayTraining.id}` : 'Nenhum treino hoje'}
                        </span>
                      </div>

                      <CardContent className="p-6">
                        <div className="mb-6">
                          <h3 className="font-heading font-semibold text-lg text-secondary mb-2">
                            Foco: {todayTraining?.focus || "Não há treino para hoje"}
                          </h3>
                          <p className="text-neutral-medium">
                            {todayTraining?.exercises?.length > 0
                              ? "Complete todos os exercicios abaixo e registre seus resultados."
                              : "Aproveite seu dia de descanso ou confira seu histórico de treinos."}
                          </p>
                        </div>

                        {/* Exercise List */}
                        {todayTraining?.exercises?.length > 0 ? ( // Added optional chaining here as well for safety
                          <div className="space-y-4">
                            {todayTraining.exercises.map((exercise: any) => (
                              <ExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                onRegister={handleRegisterExercise}
                              />
                            ))}

                            <div className="mt-6 flex justify-between items-center">
                              <Button variant="outline" asChild>
                                <Link href="/training">Ver Treino Completo</Link>
                              </Button>
                              <Button>Concluir Todos</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 flex flex-col items-center justify-center text-center">
                            <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-neutral-medium">Não há exercícios agendados para hoje.</p>
                            <Button className="mt-4" asChild>
                              <Link href="/training">Ver Treinos Disponíveis</Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader className="p-4 border-b border-gray-200 flex flex-row justify-between items-center">
                        <CardTitle className="font-heading font-bold text-xl text-secondary">
                          Atividades Recentes
                        </CardTitle>
                        <Link href="/history" className="text-neutral-medium hover:text-secondary text-sm">
                          Ver todas
                        </Link>
                      </CardHeader>

                      <CardContent className="p-4">
                        {activities.length > 0 ? (
                          <ul className="divide-y divide-gray-200">
                            {activities.map((activity: any) => {
                              const iconMap: Record<string, any> = {
                                workoutCompleted: CheckCircle,
                                comment: MessageSquare,
                                calendar: Calendar
                              };

                              const colorMap: Record<string, string> = {
                                workoutCompleted: "primary",
                                comment: "accent",
                                calendar: "secondary"
                              };

                              const Icon = iconMap[activity.type] || CheckCircle;
                              const color = colorMap[activity.type] || "primary";

                              return (
                                <ActivityItem
                                  key={activity.id}
                                  icon={Icon}
                                  iconColor={color}
                                  title={activity.title}
                                  description={activity.description}
                                  date={activity.date}
                                />
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="py-4 text-center text-neutral-medium">
                            Nenhuma atividade recente.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column (1/3 width on lg) */}
                  <div className="space-y-8">
                    {/* Mini Calendar */}
                    <Card>
                      <CardHeader className="p-4 border-b border-gray-200">
                        <CardTitle className="font-heading font-bold text-xl text-secondary">
                          Próximos Eventos
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-4">
                        <MiniCalendar events={events} />

                        <div className="mt-4 text-center">
                          <Button variant="link" asChild>
                            <Link href="/calendar">Ver calendário completo</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Team News */}
                    <Card>
                      <CardHeader className="p-4 border-b border-gray-200 flex flex-row justify-between items-center">
                        <CardTitle className="font-heading font-bold text-xl text-secondary">
                          Notícias da Equipe
                        </CardTitle>
                        <Link href="/news" className="text-neutral-medium hover:text-secondary text-sm">
                          Ver todas
                        </Link>
                      </CardHeader>

                      <CardContent className="p-4">
                        {news.length > 0 ? (
                          <div className="space-y-4">
                            {news.map((item: any) => (
                              <NewsItem key={item.id} news={item} />
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-neutral-medium">
                            Nenhuma notícia disponível.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
