import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { NutritionTrends } from "./NutritionTrends";
import { PersonalRecords } from "./PersonalRecords";
import { StrengthTrends } from "./StrengthTrends";
import { WorkoutConsistency } from "./WorkoutConsistency";

export interface ProgressData {
  range: { start: string; end: string };
  personalRecords: { exercise: string; estimated1RM: number; weight: number; reps: number; date: string }[];
  workoutConsistency: { date: string; count: number }[];
  strengthExercises: string[];
  strengthTrends: Record<string, string | number>[];
  nutritionTrends: { date: string; calories: number; protein: number; carbs: number; fat: number }[];
}

export function ProgressTab() {
  const [dateRange, setDateRange] = useState("30");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    api.get<ProgressData>("/dashboard/progress", { params: { range: dateRange } })
      .then(response => { if (current) setData(response.data); })
      .catch(() => { if (current) setError("Your progress could not load. Please try again."); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [dateRange, retry]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Your progress</h1>
          <p className="mt-1 text-sm text-black/50">Built from your completed workouts and logged meals.</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Progress date range">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <div className="app-card p-6 text-sm text-black/50" role="status">Calculating your progress…</div>}
      {error && <div className="app-card flex items-center justify-between gap-4 p-6" role="alert"><span>{error}</span><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>}
      {!loading && !error && data && <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PersonalRecords records={data.personalRecords} />
          <WorkoutConsistency activity={data.workoutConsistency} range={data.range} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StrengthTrends data={data.strengthTrends} exercises={data.strengthExercises} />
          <NutritionTrends data={data.nutritionTrends} />
        </div>
      </>}
    </div>
  );
}
