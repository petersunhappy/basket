import { User, Training, Exercise, Event, News, UserProfile } from "./schema";

// Extended types with additional properties or relations

export interface Exercise extends Omit<Exercise, "trainingId"> {
  training?: Training;
}

export interface CompletedExercise {
  id: number;
  userId: number;
  exerciseId: number;
  sets: number;
  reps: number;
  weight?: number | null;
  completion: number;
  effort: string;
  accuracy: number;
  notes?: string | null;
  createdAt: string;
  exercise?: Exercise;
  user?: User;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description?: string | null;
  type: 'game' | 'training' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPublic: boolean;
  authorId?: number | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface DashboardData {
  stats: {
    completedWorkouts: number;
    totalWorkouts: number;
    nextGameDays: number;
    nextGame?: Event;
    notifications: number;
  };
  todayTraining: {
    id: number;
    name: string;
    focus: string;
    description: string;
    exercises: Exercise[];
  } | null;
  activities: Activity[];
  events: Event[];
  news: News[];
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
  completedWorkouts?: number;
}

export interface ExerciseHistoryData {
  logs: {
    id: number;
    date: string;
    sets: number;
    reps: number;
    weight?: number | null;
    completion: number;
    effort: string;
    accuracy: number;
    notes?: string | null;
    exercise: {
      id: number;
      name: string;
      description: string;
    };
  }[];
  progress: {
    date: string;
    data: {
      accuracy: number;
      completion: number;
      weight: number;
    };
  }[];
}

export interface TrainingWithExercises extends Training {
  exercises: Exercise[];
}
