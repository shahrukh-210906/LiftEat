import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { WorkoutSession, WorkoutExercise } from "@/lib/types";

export function useWorkoutSession(workoutId?: string) {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutName, setWorkoutName] = useState("");

  const fetchWorkout = async () => {
    if (!workoutId) return;
    try {
      const { data } = await api.get(`/workouts/${workoutId}`);
      setWorkout(data.session);
      setWorkoutName(data.session.name);
      setExercises(data.exercises);
    } catch (error: any) {
      console.error("Failed to load workout:", error);
      // [FIX] Handle 404 by redirecting to safety
      if (error.response?.status === 404) {
        toast.error("This workout session no longer exists.");
        navigate("/workout"); // Redirect to the library
      } else {
        toast.error("Error loading workout details");
      }
    }
  };

  const addSet = async (exerciseId: string, reps: number, weight: number) => {
    try {
      await api.post(`/workouts/exercises/${exerciseId}/sets`, {
        reps,
        weight,
      });
      await fetchWorkout();
      toast.success("Set logged!");
    } catch (error) {
      toast.error("Could not add set");
    }
  };

  const deleteSet = async (exerciseId: string, setId: string) => {
    try {
      await api.delete(`/workouts/exercises/${exerciseId}/sets/${setId}`);
      await fetchWorkout();
      toast.success("Set removed");
    } catch (error) {
      toast.error("Could not delete set");
    }
  };

  const finishWorkout = async () => {
    if (!workoutId) return;
    try {
      await api.put(`/workouts/${workoutId}/finish`, {
        name: workoutName,
        duration_minutes: Math.floor(elapsedTime / 60),
      });
      toast.success("Workout completed! 💪");
      navigate("/workout");
    } catch (error) {
      toast.error("Failed to finish workout");
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (workout?.is_active) {
      interval = setInterval(() => {
        const startTime = new Date(workout.started_at).getTime();
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workout]);

  // Initial fetch
  useEffect(() => {
    if (workoutId) {
      fetchWorkout();
    }
  }, [workoutId]);

  return {
    workout,
    exercises,
    workoutName,
    setWorkoutName,
    elapsedTime,
    addSet,
    deleteSet,
    finishWorkout,
  };
}