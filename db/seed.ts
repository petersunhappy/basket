import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting seed process...");

    // Check if there are already users in the database
    const existingUsers = await db.select().from(schema.users);
    
    let coach;
    
    // If users exist, get the coach user for references
    if (existingUsers.length > 0) {
      console.log("Database already has users, fetching coach user for references");
      // Filter the users array in memory
      const coaches = existingUsers.filter(user => user.role === "coach");
      coach = coaches[0];
      
      if (!coach) {
        console.error("No coach user found, but users exist. Cannot continue seeding.");
        return;
      }
    } else {
      console.log("Seeding users...");
    
      // Create coach user
      const coachPassword = await hashPassword("coach123");
      const [coach] = await db.insert(schema.users)
        .values({
          name: "Carlos Silva",
          username: "coach",
          password: coachPassword,
          email: "coach@basketteam.com",
          role: "coach",
          notifications: 5
        })
        .returning();
      
      // Create coach profile
      await db.insert(schema.userProfiles)
        .values({
          userId: coach.id,
          avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          position: "Treinador Principal",
          status: "active"
        });
      
      // Create athlete users
      const athletes = [
        {
          name: "Marcus Silva",
          username: "marcus",
          email: "marcus@basketteam.com",
          position: "Ala",
          height: "185",
          weight: "80",
          avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
        },
        {
          name: "Pedro Oliveira",
          username: "pedro",
          email: "pedro@basketteam.com",
          position: "Pivô",
          height: "198",
          weight: "95",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
        },
        {
          name: "João Santos",
          username: "joao",
          email: "joao@basketteam.com",
          position: "Armador",
          height: "178",
          weight: "75",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
        }
      ];
      
      for (const athleteData of athletes) {
        const athletePassword = await hashPassword("athlete123");
        const [athlete] = await db.insert(schema.users)
          .values({
            name: athleteData.name,
            username: athleteData.username,
            password: athletePassword,
            email: athleteData.email,
            role: "athlete",
            notifications: Math.floor(Math.random() * 5)
          })
          .returning();
        
        await db.insert(schema.userProfiles)
          .values({
            userId: athlete.id,
            avatar: athleteData.avatar,
            position: athleteData.position,
            height: athleteData.height,
            weight: athleteData.weight,
            status: "active"
          });
      }
    }
    
    console.log("Seeding trainings and exercises...");
    
    // Create trainings
    const trainings = [
      {
        name: "Treino de Arremessos",
        description: "Treino focado em melhorar as habilidades de arremesso de diferentes distâncias",
        focus: "Arremessos e Condicionamento",
        instructions: "Complete todos os exercícios com atenção à técnica",
        exercises: [
          {
            name: "Arremessos de 3 pontos",
            description: "5 séries × 10 arremessos",
            instructions: "Posicione-se em 5 pontos diferentes além da linha de 3. Execute 10 arremessos em cada posição.",
            sets: 5,
            reps: 10,
            category: "Essencial"
          },
          {
            name: "Dribles e Finalização",
            description: "4 séries × 5 repetições",
            instructions: "Drible entre os cones, execute uma finta e finalize com bandeja. Alterne entre mão direita e esquerda.",
            sets: 4,
            reps: 5,
            category: "Essencial"
          },
          {
            name: "Corrida Intervalada",
            description: "10 minutos (30s sprint / 30s descanso)",
            instructions: "Alterne entre sprints de alta intensidade (30s) e caminhada ou trote leve (30s) por 10 minutos.",
            sets: 10,
            reps: 1,
            category: "Condicionamento"
          }
        ]
      },
      {
        name: "Treino de Passes",
        description: "Treino focado em melhorar precisão e velocidade nos passes",
        focus: "Passes e Movimentação",
        instructions: "Pratique os diferentes tipos de passes com atenção à precisão",
        exercises: [
          {
            name: "Passes de peito",
            description: "4 séries × 20 passes",
            instructions: "Em duplas, execute passes de peito mantendo a técnica correta.",
            sets: 4,
            reps: 20,
            category: "Essencial"
          },
          {
            name: "Passes picados",
            description: "4 séries × 20 passes",
            instructions: "Em duplas, execute passes picados alternando entre mão dominante e não-dominante.",
            sets: 4,
            reps: 20,
            category: "Essencial"
          },
          {
            name: "Passes em movimento",
            description: "6 séries × percurso completo",
            instructions: "Em trios, avance pela quadra executando passes sem deixar a bola tocar o chão.",
            sets: 6,
            reps: 1,
            category: "Técnica"
          }
        ]
      }
    ];
    
    for (const trainingData of trainings) {
      const [training] = await db.insert(schema.trainings)
        .values({
          name: trainingData.name,
          description: trainingData.description,
          focus: trainingData.focus,
          instructions: trainingData.instructions,
          createdBy: coach.id,
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        })
        .returning();
      
      // Create exercises for this training
      for (const exerciseData of trainingData.exercises) {
        await db.insert(schema.exercises)
          .values({
            trainingId: training.id,
            name: exerciseData.name,
            description: exerciseData.description,
            instructions: exerciseData.instructions,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            category: exerciseData.category
          });
      }
      
      // Assign training to all athletes
      const allAthletes = await db.select().from(schema.users);
      const athletes = allAthletes.filter(user => user.role === "athlete");
      
      for (const athlete of athletes) {
        await db.insert(schema.userTrainings)
          .values({
            userId: athlete.id,
            trainingId: training.id
          });
      }
    }
    
    console.log("Seeding events...");
    
    // Create events
    const events = [
      {
        title: "Jogo vs Rivais FC",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: "Ginásio Municipal",
        description: "Jogo amistoso contra equipe Rivais FC",
        type: "game"
      },
      {
        title: "Treino Tático",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: "Quadra Principal",
        description: "Treino focado em táticas de jogo",
        type: "training"
      },
      {
        title: "Amistoso",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: "Ginásio Estadual",
        description: "Jogo amistoso preparatório para o campeonato",
        type: "game"
      }
    ];
    
    for (const eventData of events) {
      await db.insert(schema.events)
        .values(eventData);
    }
    
    console.log("Seeding news...");
    
    // Create news
    const newsItems = [
      {
        title: "Intensificação dos treinos para playoff",
        content: "A equipe técnica anunciou um novo programa de treinamento intensivo visando a fase final do campeonato estadual. Os treinos serão realizados com maior frequência e intensidade nas próximas semanas. Todos os atletas devem comparecer aos horários designados.",
        imageUrl: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isPublic: false,
        authorId: coach.id
      },
      {
        title: "Novos uniformes para a temporada",
        content: "Os novos uniformes da equipe serão apresentados na próxima semana. Confira os detalhes exclusivos! O design incorpora as cores tradicionais do time com um toque moderno e tecnológico nos tecidos.",
        isPublic: true,
        authorId: coach.id
      },
      {
        title: "Vitória no campeonato regional",
        content: "Nossa equipe conquistou uma importante vitória no campeonato regional no último domingo. O jogo foi disputado até o último segundo, com destaque para a atuação coletiva do time.",
        imageUrl: "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isPublic: true,
        authorId: coach.id
      }
    ];
    
    for (const newsData of newsItems) {
      await db.insert(schema.news)
        .values(newsData);
    }
    
    console.log("Seeding completed exercises...");
    
    // Create some completed exercises for athletes
    const allExercises = await db.select().from(schema.exercises);
    const allUsers = await db.select().from(schema.users);
    const athletes = allUsers.filter(user => user.role === "athlete");
    
    for (const athlete of athletes) {
      // Pick 5 random exercises
      const selectedExercises = allExercises
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      
      for (const exercise of selectedExercises) {
        await db.insert(schema.completedExercises)
          .values({
            exerciseId: exercise.id,
            userId: athlete.id,
            sets: exercise.sets,
            reps: exercise.reps,
            completion: Math.floor(Math.random() * 40) + 60, // 60-100%
            effort: ["Fácil", "Moderado", "Difícil"][Math.floor(Math.random() * 3)],
            accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
            notes: "Exercício completado durante o treino",
            // Set a random date in the past week
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
          });
      }
    }
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
