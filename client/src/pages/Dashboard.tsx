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
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get("/dashboard/stats");
      setLastWorkout(data.lastWorkout);
      setTodaysDiet(data.todaysDiet);
      setWorkoutCount(data.weeklyWorkoutCount);
      setActiveWorkout(data.activeWorkout || null);
    } catch (error) {
      setError('Your overview could not load. Please retry.');
    } finally {
      setLoading(false);
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
        <header className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-black/40">
                <Sparkles className="h-3.5 w-3.5" /> TODAY
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-[-0.04em] text-black md:text-5xl">Good day, {firstName}.</h1>
              <p className="mt-3 max-w-lg text-sm text-black/45">Your training and nutrition overview for today.</p>
            </div>
            <Link to="/ai-chat" className="inline-flex w-fit items-center gap-2 rounded-xl border border-black/15 px-5 py-3 text-sm font-bold transition-colors hover:bg-black/5">
              Ask your coach <ArrowUpRight className="h-4 w-4" />
            </Link>
        </header>

        {loading && <p role="status">Loading your day…</p>}
        {error && <div role="alert" className="app-card p-4">{error} <button className="underline font-semibold" onClick={fetchDashboardData}>Retry</button></div>}
        <section aria-label="Daily actions" className="grid gap-4 sm:grid-cols-2">
          <Link to={activeWorkout ? `/workout/${activeWorkout._id}` : '/routines'} className="app-card p-6 hover:border-black/30">
            <Activity className="mb-4 h-6 w-6" /><h2 className="text-xl font-bold">{activeWorkout ? 'Continue workout' : 'Choose a workout'}</h2>
            <p className="mt-2 text-sm text-gray-500">{activeWorkout ? activeWorkout.name : 'Open your routines and plan your next session.'}</p>
          </Link>
          <Link to="/diet" className="app-card p-6 hover:border-black/30"><Flame className="mb-4 h-6 w-6" /><h2 className="text-xl font-bold">Log a meal</h2><p className="mt-2 text-sm text-gray-500">Search foods, describe a meal, or scan your plate.</p></Link>
        </section>
        {!loading && !error && <>

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
            title="Meals logged"
            value={todaysDiet.length}
            subtitle="Entries today"
          />
          <StatsCard
            icon={<Trophy className="w-6 h-6" />}
            title="Weight"
            value={`${profile?.weight_kg || "-"} kg`}
            subtitle="Current weight"
          />
        </div>
        <ProactiveInsights />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Actions & Last Workout */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-black text-foreground mb-4">
                Quick Start
              </h2>
              <div className="app-card p-4">
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
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
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
        </>}
      </div>
    </AppLayout>
  );
}
