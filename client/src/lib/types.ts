export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'maintain' | 'gain_strength' | 'improve_endurance';

export interface Profile {
  _id: string;
  user: string;
  full_name: string | null;
  body_type: BodyType | null;
  fitness_goal: FitnessGoal | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: string | null;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
  onboarding_complete: boolean;
}

export interface Exercise {
  _id: string; // Changed to match mongo
  name: string;
  bodyPart: string; // Changed to match mongo
  equipment?: string | null;
  images?: string[];
  instructions?: string[];
}

export interface WorkoutRoutine {
  _id: string;
  name: string;
  exercises: { exercise: Exercise; sets: number }[];
}

export interface WorkoutSession {
  _id: string; // Changed to match mongo
  user: string;
  name: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
  is_active: boolean;
}

export interface WorkoutExercise {
  _id: string; // Changed to match mongo
  workout_session: string;
  exercise_base?: Exercise;
  target_sets?: number;
  exercise_name: string;
  muscle_group: string | null;
  sets?: ExerciseSet[];
}

export interface ExerciseSet {
  _id: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface DietLog {
  _id: string;
  user: string;
  food_name: string;
  quantity_g: number;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  meal_type: string | null;
  logged_at: string;
}

export interface FoodItem {
  _id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface AIChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}