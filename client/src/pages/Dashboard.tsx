import { useEffect, useState } from "react";
import { Activity, Flame, Zap, Trophy } from "lucide-react"; // Changed icons slightly for variety
import { AppLayout } from "../components/layout/AppLayout";
import { StatsCard } from "../components/dashboard/StatsCard";
import { MacroProgress } from "../components/dashboard/MacroProgress";
import { QuickActions } from "../components/dashboard/QuickActions";
import { AICoachWidget } from "../components/AICoachWidget";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { WorkoutSession, DietLog } from "../lib/types";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
  const [todaysDiet, setTodaysDiet] = useState<DietLog[]>([]);
  const [workoutCount, setWorkoutCount] = useState(0);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setLastWorkout(data.lastWorkout);
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

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hello, {firstName}
            </h1>
            <p className="text-gray-500 mt-1">
              Ready to crush your goals today?
            </p>
          </div>
          {/* Subtle profile badge or date could go here */}
        </div>

        {/* AI Widget - Keeps functionality but minimal style */}
        <div className="bg-transparent">
          <AICoachWidget page="dashboard" contextData={{ user: firstName }} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<Flame className="w-6 h-6" />}
            title="Calories"
            value={todayTotals.calories}
            subtitle={`/ ${profile?.daily_calorie_goal || 2000} kcal`}
            trend={todayTotals.calories > 0 ? "up" : "neutral"}
          />
          <StatsCard
            icon={<Activity className="w-6 h-6" />}
            title="Workouts"
            value={workoutCount}
            subtitle="Sessions this week"
            trend={workoutCount >= 3 ? "up" : "neutral"}
          />
          <StatsCard
            icon={<Zap className="w-6 h-6" />}
            title="Active Streak"
            value="3 Days"
            subtitle="Keep it up!"
          />
          <StatsCard
            icon={<Trophy className="w-6 h-6" />}
            title="Weight"
            value={`${profile?.weight_kg || "-"} kg`}
            subtitle="Current weight"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Actions & Last Workout */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">
                Quick Start
              </h2>
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-gray-100">
                <QuickActions />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">
                Last Session
              </h2>
              {lastWorkout ? (
                <div className="group flex items-center justify-between p-6 rounded-3xl bg-white/80 border border-gray-100 hover:border-gray-300 transition-all cursor-pointer">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {lastWorkout.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(lastWorkout.date).toLocaleDateString()} •{" "}
                      {lastWorkout.duration_minutes} mins
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div className="p-6 text-gray-400 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  No recent workouts found.
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Nutrition */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">
              Nutrition
            </h2>
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 space-y-6 hover:border-gray-300 hover:text-gray-900 hover:transition-all">
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
        </div>
      </div>
    </AppLayout>
  );
}
