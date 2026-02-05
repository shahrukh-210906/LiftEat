import { useEffect, useState } from "react";
import { Activity, Flame, Target } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { StatsCard } from "../components/dashboard/StatsCard";
import { MacroProgress } from "../components/dashboard/MacroProgress";
import { QuickActions } from "../components/dashboard/QuickActions";
import { LastWorkout } from "../components/dashboard/LastWorkout";
import { AICoachWidget } from "../components/AICoachWidget"; // <-- IMPORT
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { WorkoutSession, DietLog } from "../lib/types";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [todaysDiet, setTodaysDiet] = useState<DietLog[]>([]);
  const [workoutCount, setWorkoutCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setLastWorkout(data.lastWorkout);
      setExerciseCount(data.lastWorkoutExerciseCount);
      setTodaysDiet(data.todaysDiet);
      setWorkoutCount(data.weeklyWorkoutCount);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const todayTotals = todaysDiet.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const firstName = profile?.full_name?.split(" ")[0] || "Athlete";

  // Data for AI Context
  const dashboardContext = {
    user: firstName,
    goal: profile?.fitness_goal,
    caloriesToday: todayTotals.calories,
    workoutsThisWeek: workoutCount,
    lastWorkoutName: lastWorkout?.name || "None"
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto">
        <div className="pt-4">
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">
            <span className="text-gradient">{firstName}</span> 💪
          </h1>
        </div>

        {/* --- AI WIDGET --- */}
        <AICoachWidget page="dashboard" contextData={dashboardContext} />

        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            icon={<Flame />}
            title="Calories"
            value={todayTotals.calories}
            subtitle={`of ${profile?.daily_calorie_goal || 2000}`}
            trend={todayTotals.calories > 0 ? "up" : "neutral"}
          />
          <StatsCard
            icon={<Activity />}
            title="Workouts"
            value={workoutCount}
            subtitle="this week"
            trend={workoutCount >= 3 ? "up" : "neutral"}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Quick Actions
          </h2>
          <QuickActions />
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today's Nutrition</h2>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-4">
            <MacroProgress
              label="Protein"
              current={Math.round(todayTotals.protein)}
              goal={profile?.daily_protein_goal || 150}
              unit="g"
              color="primary"
            />
            <MacroProgress
              label="Carbs"
              current={Math.round(todayTotals.carbs)}
              goal={profile?.daily_carbs_goal || 200}
              unit="g"
              color="accent"
            />
            <MacroProgress
              label="Fat"
              current={Math.round(todayTotals.fat)}
              goal={profile?.daily_fat_goal || 65}
              unit="g"
              color="warning"
            />
          </div>
        </div>

        <LastWorkout workout={lastWorkout} exerciseCount={exerciseCount} />
      </div>
    </AppLayout>
  );
}