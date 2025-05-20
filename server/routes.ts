import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { storage } from "./storage";
import { exercises, trainings, userTrainings, completedExercises, events, news, userProfiles, users } from "@shared/schema";
import { eq, and, gte, desc, sql, or, like } from "drizzle-orm";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Não autorizado" });
};

// Middleware to check if user is a coach
const isCoach = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && req.user.role === "coach") {
    return next();
  }
  return res.status(403).json({ message: "Acesso negado" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  /**
   * Dashboard API Routes
   */
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get completed workouts count
      let completedWorkoutsCount = [{ count: 0 }];
      try {
        completedWorkoutsCount = await db.select({
          count: sql<number>`count(*)`
        }).from(completedExercises)
          .where(eq(completedExercises.userId, userId));
      } catch (error) {
        console.error("Error fetching completed workouts count:", error);
        // Continue with default count
      }
      
      // Get upcoming events
      const upcomingEvents = await db.select()
        .from(events)
        .where(gte(events.date, new Date()))
        .orderBy(events.date)
        .limit(5);
      
      // Get next game (if any)
      const nextGame = upcomingEvents.find(event => event.type === "game");
      
      // Get most recent activities
      let recentActivities = [];
      try {
        recentActivities = await db.select({
          id: completedExercises.id,
          type: sql<string>`'workoutCompleted'`,
          title: sql<string>`'Treino Concluído'`,
          description: sql<string>`CONCAT('Você completou ', CAST("completion" AS VARCHAR), '% dos exercícios propostos')`,
          date: completedExercises.createdAt
        })
        .from(completedExercises)
        .where(eq(completedExercises.userId, userId))
        .orderBy(desc(completedExercises.createdAt))
        .limit(5);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        // Continue with empty activities
      }
      
      // Get recent news
      const recentNews = await db.select()
        .from(news)
        .where(or(
          eq(news.isPublic, true),
          eq(news.authorId, userId)
        ))
        .orderBy(desc(news.createdAt))
        .limit(3);

      // Get today's training for the user
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayTraining = await db.select({
        id: trainings.id,
        name: trainings.name,
        focus: trainings.focus,
        description: trainings.description,
      })
      .from(userTrainings)
      .innerJoin(trainings, eq(userTrainings.trainingId, trainings.id))
      .where(
        and(
          eq(userTrainings.userId, userId),
          gte(trainings.scheduledDate, today)
        )
      )
      .orderBy(trainings.scheduledDate)
      .limit(1);
      
      // If training found, get exercises
      let trainingExercises = [];
      if (todayTraining && todayTraining.length > 0) {
        trainingExercises = await db.select()
          .from(exercises)
          .where(eq(exercises.trainingId, todayTraining[0].id));
      }
      
      // Calculate days until next game
      let daysUntilNextGame = 0;
      if (nextGame) {
        const gameDate = new Date(nextGame.date);
        const today = new Date();
        daysUntilNextGame = Math.ceil((gameDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      }
      
      res.json({
        stats: {
          completedWorkouts: completedWorkoutsCount[0].count || 0,
          totalWorkouts: 30, // Assuming monthly goal is 30
          nextGameDays: daysUntilNextGame,
          nextGame: nextGame,
          notifications: 3 // Mock for now
        },
        todayTraining: todayTraining.length > 0 ? {
          ...todayTraining[0],
          exercises: trainingExercises
        } : null,
        activities: recentActivities,
        events: upcomingEvents,
        news: recentNews
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Erro ao carregar dados do dashboard" });
    }
  });

  /**
   * Training API Routes
   */
  app.get("/api/training/today", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get today's date (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get training for today
      const todayTraining = await db.select({
        id: trainings.id,
        name: trainings.name,
        focus: trainings.focus,
        description: trainings.description,
        instructions: trainings.instructions
      })
      .from(userTrainings)
      .innerJoin(trainings, eq(userTrainings.trainingId, trainings.id))
      .where(
        and(
          eq(userTrainings.userId, userId),
          gte(trainings.scheduledDate, today)
        )
      )
      .orderBy(trainings.scheduledDate)
      .limit(1);
      
      if (!todayTraining || todayTraining.length === 0) {
        return res.json({ exercises: [] });
      }
      
      // Get exercises for this training
      const trainingExercises = await db.select()
        .from(exercises)
        .where(eq(exercises.trainingId, todayTraining[0].id));
      
      res.json({
        ...todayTraining[0],
        exercises: trainingExercises
      });
    } catch (error) {
      console.error("Error fetching today's training:", error);
      res.status(500).json({ message: "Erro ao carregar treino do dia" });
    }
  });

  app.post("/api/exercises/:exerciseId/register", isAuthenticated, async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const userId = req.user!.id;
      
      // Insert completed exercise
      const [completedExercise] = await db.insert(completedExercises)
        .values({
          exerciseId: parseInt(exerciseId),
          userId: userId,
          sets: req.body.sets || 0,
          reps: req.body.reps || 0,
          weight: req.body.weight || null,
          completion: parseInt(req.body.completion || "0"),
          effort: req.body.effort || "Moderado",
          accuracy: req.body.accuracy || 0,
          notes: req.body.notes || ""
        })
        .returning();
      
      res.status(201).json(completedExercise);
    } catch (error) {
      console.error("Error registering exercise:", error);
      res.status(500).json({ message: "Erro ao registrar exercício" });
    }
  });

  app.post("/api/training/today/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get today's date (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get training for today
      const todayTraining = await db.select()
        .from(userTrainings)
        .innerJoin(trainings, eq(userTrainings.trainingId, trainings.id))
        .where(
          and(
            eq(userTrainings.userId, userId),
            gte(trainings.scheduledDate, today)
          )
        )
        .orderBy(trainings.scheduledDate)
        .limit(1);
      
      if (!todayTraining || todayTraining.length === 0) {
        return res.status(404).json({ message: "Nenhum treino encontrado para hoje" });
      }
      
      // Get exercises for this training
      let trainingExercises = [];
      try {
        const trainingId = todayTraining[0].trainings?.id || todayTraining[0].id;
        trainingExercises = await db.select()
          .from(exercises)
          .where(eq(exercises.trainingId, trainingId));
      } catch (error) {
        console.error("Error fetching training exercises:", error);
        // Continue with empty exercises
      }
      
      // Mark all exercises as completed
      const completedExercisesData = trainingExercises.map(exercise => ({
        exerciseId: exercise.id,
        userId: userId,
        sets: exercise.sets,
        reps: exercise.reps,
        completion: 100,
        effort: "Moderado",
        accuracy: 80,
        notes: "Concluído automaticamente"
      }));
      
      await db.insert(completedExercises).values(completedExercisesData);
      
      res.status(200).json({ message: "Todos os exercícios foram marcados como concluídos" });
    } catch (error) {
      console.error("Error completing all exercises:", error);
      res.status(500).json({ message: "Erro ao concluir todos os exercícios" });
    }
  });

  app.get("/api/exercises", isAuthenticated, async (req, res) => {
    try {
      const allExercises = await db.select().from(exercises);
      res.json(allExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Erro ao carregar exercícios" });
    }
  });

  app.post("/api/exercises/log", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Insert completed exercise
      const [completedExercise] = await db.insert(completedExercises)
        .values({
          exerciseId: parseInt(req.body.exerciseId),
          userId: userId,
          sets: parseInt(req.body.sets),
          reps: parseInt(req.body.reps),
          weight: req.body.weight ? parseFloat(req.body.weight) : null,
          completion: parseInt(req.body.completion),
          effort: req.body.effort,
          accuracy: req.body.accuracy,
          notes: req.body.notes || ""
        })
        .returning();
      
      res.status(201).json(completedExercise);
    } catch (error) {
      console.error("Error logging exercise:", error);
      res.status(500).json({ message: "Erro ao registrar exercício" });
    }
  });

  app.get("/api/exercises/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { period = "30days", exercise = "all" } = req.query;
      
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case "7days":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case "all":
          startDate.setFullYear(1970);
          break;
      }
      
      // Base query
      let query = db.select({
        id: completedExercises.id,
        date: completedExercises.createdAt,
        sets: completedExercises.sets,
        reps: completedExercises.reps,
        weight: completedExercises.weight,
        completion: completedExercises.completion,
        effort: completedExercises.effort,
        accuracy: completedExercises.accuracy,
        notes: completedExercises.notes,
        exercise: {
          id: exercises.id,
          name: exercises.name,
          description: exercises.description
        }
      })
      .from(completedExercises)
      .innerJoin(exercises, eq(completedExercises.exerciseId, exercises.id))
      .where(
        and(
          eq(completedExercises.userId, userId),
          gte(completedExercises.createdAt, startDate)
        )
      );
      
      // Add exercise filter if specified
      if (exercise !== "all") {
        query = query.where(eq(completedExercises.exerciseId, parseInt(exercise as string)));
      }
      
      // Execute query
      const logs = await query.orderBy(desc(completedExercises.createdAt));
      
      // Prepare progress data points
      const progressDataPoints = logs.map(log => ({
        date: log.date,
        data: {
          accuracy: log.accuracy,
          completion: log.completion,
          weight: log.weight || 0
        }
      }));
      
      res.json({
        logs,
        progress: progressDataPoints
      });
    } catch (error) {
      console.error("Error fetching exercise history:", error);
      res.status(500).json({ message: "Erro ao carregar histórico de exercícios" });
    }
  });

  /**
   * Calendar API Routes
   */
  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const allEvents = await db.select().from(events).orderBy(events.date);
      res.json(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Erro ao carregar eventos" });
    }
  });

  app.post("/api/events", isCoach, async (req, res) => {
    try {
      const [newEvent] = await db.insert(events)
        .values({
          title: req.body.title,
          date: req.body.date,
          location: req.body.location,
          description: req.body.description || "",
          type: req.body.type
        })
        .returning();
      
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Erro ao criar evento" });
    }
  });

  /**
   * News API Routes
   */
  app.get("/api/news", isAuthenticated, async (req, res) => {
    try {
      const allNews = await db.select().from(news).orderBy(desc(news.createdAt));
      res.json(allNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Erro ao carregar notícias" });
    }
  });

  app.get("/api/news/public", async (req, res) => {
    try {
      const publicNews = await db.select()
        .from(news)
        .where(eq(news.isPublic, true))
        .orderBy(desc(news.createdAt));
      
      res.json(publicNews);
    } catch (error) {
      console.error("Error fetching public news:", error);
      res.status(500).json({ message: "Erro ao carregar notícias públicas" });
    }
  });

  app.post("/api/news", isCoach, async (req, res) => {
    try {
      const [newNews] = await db.insert(news)
        .values({
          title: req.body.title,
          content: req.body.content,
          imageUrl: req.body.imageUrl || null,
          isPublic: req.body.isPublic || false,
          authorId: req.user!.id
        })
        .returning();
      
      res.status(201).json(newNews);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Erro ao criar notícia" });
    }
  });

  /**
   * User Profile API Routes
   */
  app.get("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user profile
      const profile = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        avatar: userProfiles.avatar,
        position: userProfiles.position,
        height: userProfiles.height,
        weight: userProfiles.weight,
        birthdate: userProfiles.birthdate,
        completedWorkouts: sql<number>`(SELECT COUNT(*) FROM "completed_exercises" WHERE "user_id" = ${userId})`
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1);
      
      if (!profile || profile.length === 0) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }
      
      res.json(profile[0]);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Erro ao carregar perfil do usuário" });
    }
  });

  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // First, check if user profile exists
      const existingProfile = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));
      
      if (existingProfile.length === 0) {
        // Create new profile if it doesn't exist
        await db.insert(userProfiles)
          .values({
            userId: userId,
            position: req.body.position || null,
            height: req.body.height || null,
            weight: req.body.weight || null,
            birthdate: req.body.birthdate || null,
            avatar: req.body.avatar || null
          });
      } else {
        // Update existing profile
        await db.update(userProfiles)
          .set({
            position: req.body.position !== undefined ? req.body.position : existingProfile[0].position,
            height: req.body.height !== undefined ? req.body.height : existingProfile[0].height,
            weight: req.body.weight !== undefined ? req.body.weight : existingProfile[0].weight,
            birthdate: req.body.birthdate !== undefined ? req.body.birthdate : existingProfile[0].birthdate,
            avatar: req.body.avatar !== undefined ? req.body.avatar : existingProfile[0].avatar
          })
          .where(eq(userProfiles.userId, userId));
      }
      
      // Update user info if provided
      if (req.body.name || req.body.email) {
        await db.update(users)
          .set({
            name: req.body.name !== undefined ? req.body.name : req.user!.name,
            email: req.body.email !== undefined ? req.body.email : req.user!.email
          })
          .where(eq(users.id, userId));
      }
      
      // Get updated profile
      const updatedProfile = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        avatar: userProfiles.avatar,
        position: userProfiles.position,
        height: userProfiles.height,
        weight: userProfiles.weight,
        birthdate: userProfiles.birthdate
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1);
      
      res.json(updatedProfile[0]);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Erro ao atualizar perfil do usuário" });
    }
  });

  /**
   * Admin API Routes
   */
  app.get("/api/admin/athletes", isCoach, async (req, res) => {
    try {
      const athletes = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        position: userProfiles.position,
        height: userProfiles.height,
        weight: userProfiles.weight,
        birthdate: userProfiles.birthdate,
        completedWorkouts: sql<number>`(SELECT COUNT(*) FROM ${completedExercises} WHERE ${completedExercises.userId} = ${users.id})`
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.role, "athlete"))
      .orderBy(users.name);
      
      res.json(athletes);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      res.status(500).json({ message: "Erro ao carregar atletas" });
    }
  });

  app.get("/api/admin/reports", isCoach, async (req, res) => {
    try {
      // Get total athletes count
      const athletesCount = await db.select({
        count: sql<number>`count(*)`
      })
      .from(users)
      .where(eq(users.role, "athlete"));
      
      // Get total completed exercises
      const exercisesCount = await db.select({
        count: sql<number>`count(*)`
      })
      .from(completedExercises);
      
      // Get exercise completion by athlete
      const athleteCompletion = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        exercises: sql<number>`(SELECT COUNT(*) FROM "completed_exercises" WHERE "user_id" = ${users.id})`,
        avgCompletion: sql<number>`(SELECT AVG("completion") FROM "completed_exercises" WHERE "user_id" = ${users.id})`,
        avgAccuracy: sql<number>`(SELECT AVG("accuracy") FROM "completed_exercises" WHERE "user_id" = ${users.id})`
      })
      .from(users)
      .where(eq(users.role, "athlete"))
      .orderBy(users.name);
      
      // Get most completed exercises
      const popularExercises = await db.select({
        id: exercises.id,
        name: exercises.name,
        count: sql<number>`(SELECT COUNT(*) FROM "completed_exercises" WHERE "exercise_id" = ${exercises.id})`,
        avgCompletion: sql<number>`(SELECT AVG("completion") FROM "completed_exercises" WHERE "exercise_id" = ${exercises.id})`,
        avgAccuracy: sql<number>`(SELECT AVG("accuracy") FROM "completed_exercises" WHERE "exercise_id" = ${exercises.id})`
      })
      .from(exercises)
      .orderBy(desc(sql<number>`(SELECT COUNT(*) FROM "completed_exercises" WHERE "exercise_id" = ${exercises.id})`))
      .limit(5);
      
      res.json({
        statistics: {
          totalAthletes: athletesCount[0].count,
          totalExercises: exercisesCount[0].count
        },
        athletePerformance: athleteCompletion,
        popularExercises
      });
    } catch (error) {
      console.error("Error generating reports:", error);
      res.status(500).json({ message: "Erro ao gerar relatórios" });
    }
  });

  app.post("/api/admin/training", isCoach, async (req, res) => {
    try {
      // Insert training
      const [newTraining] = await db.insert(trainings)
        .values({
          name: req.body.name,
          description: req.body.description,
          focus: req.body.focus,
          instructions: req.body.instructions || "",
          scheduledDate: req.body.scheduledDate,
          createdBy: req.user!.id
        })
        .returning();
      
      // Insert exercises
      if (req.body.exercises && Array.isArray(req.body.exercises)) {
        const exercisesData = req.body.exercises.map((exercise: any) => ({
          trainingId: newTraining.id,
          name: exercise.name,
          description: exercise.description,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          instructions: exercise.instructions || "",
          videoUrl: exercise.videoUrl || null,
          category: exercise.category
        }));
        
        await db.insert(exercises).values(exercisesData);
      }
      
      // Assign training to athletes
      if (req.body.athletes && Array.isArray(req.body.athletes)) {
        const assignmentsData = req.body.athletes.map((athleteId: number) => ({
          userId: athleteId,
          trainingId: newTraining.id
        }));
        
        await db.insert(userTrainings).values(assignmentsData);
      }
      
      res.status(201).json(newTraining);
    } catch (error) {
      console.error("Error creating training:", error);
      res.status(500).json({ message: "Erro ao criar treino" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper functions for authentication (defined in auth.ts)
// These are just stubs and aren't actually used as the real functions are in auth.ts
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return false;
}

async function hashPassword(password: string): Promise<string> {
  return '';
}