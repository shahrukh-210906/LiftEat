import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, Flame, Sparkles, Trophy, Zap } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { StatsCard } from "../components/dashboard/StatsCard";
import { MacroProgress } from "../components/dashboard/MacroProgress";
import { QuickActions } from "../components/dashboard/QuickActions";
import { ProactiveInsights } from '@/components/dashboard/ProactiveInsights';
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
        <header className="relative overflow-hidden rounded-[2rem] bg-[#11151d] px-6 py-7 text-white md:px-9 md:py-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[3rem] border-[#c6ff40]/10" />
          <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-[#c6ff40]" /> Daily performance brief
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-[-0.04em] md:text-5xl">Move with purpose,<br/><span className="text-[#c6ff40]">{firstName}.</span></h1>
              <p className="mt-3 max-w-lg text-sm text-white/55">Your training, recovery and nutrition are working together. Here is what needs your attention today.</p>
            </div>
            <Link to="/workout" className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#c6ff40] px-5 py-3 text-sm font-black text-[#11151d] transition-transform hover:-translate-y-0.5">
              Start training <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <ProactiveInsights />

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
              <h2 className="text-xl font-black text-foreground mb-4">
                Quick Start
              </h2>
              <div className="app-card p-4 md:p-5">
                <QuickActions />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-foreground mb-4">
                Last Session
              </h2>
              {lastWorkout ? (
                <Link to={`/workout/${lastWorkout._id}`} className="app-card group flex items-center justify-between p-6 transition-all hover:-translate-y-1">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {lastWorkout.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(lastWorkout.completed_at || lastWorkout.started_at).toLocaleDateString()} •{" "}
                      {lastWorkout.duration_minutes} mins
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-accent group-hover:text-foreground transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                </Link>
              ) : (
                <div className="p-6 text-gray-400 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  No recent workouts found.
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Nutrition */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-4">
              Nutrition
            </h2>
            <div className="app-card p-6 space-y-5">
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
