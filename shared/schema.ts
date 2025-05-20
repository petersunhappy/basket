import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("athlete"),
  notifications: integer("notifications").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  completedExercises: many(completedExercises),
  trainings: many(userTrainings),
  authoredNews: many(news, { relationName: "author" }),
  authoredTrainings: many(trainings, { relationName: "creator" }),
}));

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  avatar: text("avatar"),
  position: text("position"),
  height: text("height"),
  weight: text("weight"),
  birthdate: text("birthdate"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// Trainings table
export const trainings = pgTable("trainings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  focus: text("focus").notNull(),
  instructions: text("instructions"),
  scheduledDate: timestamp("scheduled_date"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trainingsRelations = relations(trainings, ({ many, one }) => ({
  exercises: many(exercises),
  users: many(userTrainings),
  creator: one(users, {
    fields: [trainings.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
}));

// Exercises table
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  trainingId: integer("training_id").references(() => trainings.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions"),
  sets: integer("sets").default(3).notNull(),
  reps: integer("reps").default(10).notNull(),
  category: text("category").default("Essencial").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  training: one(trainings, {
    fields: [exercises.trainingId],
    references: [trainings.id],
  }),
  completions: many(completedExercises),
}));

// Completed exercises table
export const completedExercises = pgTable("completed_exercises", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  exerciseId: integer("exercise_id").references(() => exercises.id).notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  completion: integer("completion").notNull(),
  effort: text("effort").notNull(),
  accuracy: integer("accuracy").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const completedExercisesRelations = relations(completedExercises, ({ one }) => ({
  user: one(users, {
    fields: [completedExercises.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [completedExercises.exerciseId],
    references: [exercises.id],
  }),
}));

// User trainings table (relationship between users and trainings)
export const userTrainings = pgTable("user_trainings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  trainingId: integer("training_id").references(() => trainings.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completionDate: timestamp("completion_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userTrainingsRelations = relations(userTrainings, ({ one }) => ({
  user: one(users, {
    fields: [userTrainings.userId],
    references: [users.id],
  }),
  training: one(trainings, {
    fields: [userTrainings.trainingId],
    references: [trainings.id],
  }),
}));

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  type: text("type").notNull().default("other"), // game, training, other
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// News table
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isPublic: boolean("is_public").default(false),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const newsRelations = relations(news, ({ one }) => ({
  author: one(users, {
    fields: [news.authorId],
    references: [users.id],
    relationName: "author",
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users, {
  name: (schema) => schema.min(3, "O nome deve ter no mínimo 3 caracteres"),
  username: (schema) => schema.min(3, "O nome de usuário deve ter no mínimo 3 caracteres"),
  email: (schema) => schema.email("Email inválido"),
  password: (schema) => schema.min(6, "A senha deve ter no mínimo 6 caracteres"),
}).omit({ createdAt: true, updatedAt: true, notifications: true });

export const insertTrainingSchema = createInsertSchema(trainings, {
  name: (schema) => schema.min(3, "O nome do treino deve ter no mínimo 3 caracteres"),
  description: (schema) => schema.min(10, "A descrição deve ter no mínimo 10 caracteres"),
  focus: (schema) => schema.min(3, "O foco do treino deve ter no mínimo 3 caracteres"),
}).omit({ createdAt: true, updatedAt: true });

export const insertExerciseSchema = createInsertSchema(exercises, {
  name: (schema) => schema.min(3, "O nome do exercício deve ter no mínimo 3 caracteres"),
  description: (schema) => schema.min(5, "A descrição deve ter no mínimo 5 caracteres"),
}).omit({ createdAt: true, updatedAt: true });

export const insertEventSchema = createInsertSchema(events, {
  title: (schema) => schema.min(3, "O título deve ter no mínimo 3 caracteres"),
  location: (schema) => schema.min(3, "O local deve ter no mínimo 3 caracteres"),
}).omit({ createdAt: true, updatedAt: true });

export const insertNewsSchema = createInsertSchema(news, {
  title: (schema) => schema.min(3, "O título deve ter no mínimo 3 caracteres"),
  content: (schema) => schema.min(10, "O conteúdo deve ter no mínimo 10 caracteres"),
}).omit({ createdAt: true, updatedAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Training = typeof trainings.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type CompletedExercise = typeof completedExercises.$inferSelect;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
