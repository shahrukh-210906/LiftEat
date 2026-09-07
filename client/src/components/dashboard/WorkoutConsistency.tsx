import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgressData } from "./ProgressTab";

export function WorkoutConsistency({ activity, range }: { activity: ProgressData["workoutConsistency"]; range: ProgressData["range"] }) {
  const activityByDay = new Map(activity.map(day => [day.date, day.count]));
  const end = new Date(range.end);
  const start = new Date(Math.max(new Date(range.start).getTime(), end.getTime() - 97 * 86400000));
  start.setUTCHours(0, 0, 0, 0);
  const days: { date: string; count: number }[] = [];
  for (const day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    const date = day.toISOString().slice(0, 10);
    days.push({ date, count: activityByDay.get(date) || 0 });
  }
  const total = activity.reduce((sum, day) => sum + day.count, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg"><span className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Consistency</span><span className="text-sm font-medium text-black/45">{total} workouts</span></CardTitle></CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label={`${total} completed workouts in the selected period`}>
          {days.map(day => <div key={day.date} className={`h-4 rounded-sm ${day.count > 1 ? "bg-black" : day.count === 1 ? "bg-black/65" : "bg-black/[0.06]"}`} title={`${day.date}: ${day.count} workout${day.count === 1 ? "" : "s"}`} />)}
        </div>
        <p className="mt-4 text-xs text-black/40">Showing up to the latest 14 weeks in the selected range.</p>
      </CardContent>
    </Card>
  );
}
