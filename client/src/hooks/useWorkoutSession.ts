import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
// We use 'any' for sets here to avoid strict type conflicts with the legacy types file
// You should eventually update your types.ts to match the new backend model perfectly.

export function useWorkoutSession(workoutId?: string) {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutName, setWorkoutName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWorkout = async () => {
    if (!workoutId) return;
    try {
      const { data } = await api.get(`/workouts/${workoutId}`);
      setWorkout(data.session);
      setWorkoutName(data.session.name);
      setExercises(data.exercises);
      
      // Calculate elapsed time based on server start time
      if (data.session.started_at) {
        const start = new Date(data.session.started_at).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }
    } catch (error: any) {
      console.error("Failed to load workout:", error);
      if (error.response?.status === 404) {
        toast.error("Workout not found");
        navigate("/workout");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSet = async (exerciseId: string, reps: number, weight: number) => {
    try {
      // Optimistic UI update (optional, but makes it snappy)
      // For now, we'll just wait for the server response to ensure ID sync
      const { data: updatedExercise } = await api.post(`/workouts/exercises/${exerciseId}/sets`, {
        reps,
        weight,
      });

      // Update local state without full refetch
      setExercises(prev => prev.map(ex => 
        ex._id === exerciseId ? updatedExercise : ex
      ));
      
      toast.success("Set logged");
    } catch (error) {
      toast.error("Could not add set");
    }
  };

  const deleteSet = async (exerciseId: string, setId: string) => {
    try {
      const { data: updatedExercise } = await api.delete(`/workouts/exercises/${exerciseId}/sets/${setId}`);
      
      // Update local state
      setExercises(prev => prev.map(ex => 
        ex._id === exerciseId ? updatedExercise : ex
      ));
      
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
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to finish workout");
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (workout?.is_active) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
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
    loading
  };
}