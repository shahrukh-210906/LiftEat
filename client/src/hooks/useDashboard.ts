import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { WorkoutSession, DietLog } from "../lib/types";

export function useDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    lastWorkout: null as WorkoutSession | null,
    exerciseCount: 0,
    todaysDiet: [] as DietLog[],
    workoutCount: 0
  });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setStats({
        lastWorkout: data.lastWorkout,
        exerciseCount: data.lastWorkoutExerciseCount,
        todaysDiet: data.todaysDiet,
        workoutCount: data.weeklyWorkoutCount
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const todayTotals = stats.todaysDiet.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    profile,
    stats,
    todayTotals,
    firstName: profile?.full_name?.split(" ")[0] || "Athlete"
  };
}