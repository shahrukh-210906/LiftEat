import { TrendingUp } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgressData } from "./ProgressTab";

const colors = ["#111111", "#666666", "#aaaaaa"];

export function StrengthTrends({ data, exercises }: { data: ProgressData["strengthTrends"]; exercises: string[] }) {
  const chartData = data.map(point => ({
    date: point.date,
    ...Object.fromEntries(exercises.map((exercise, index) => [`exercise${index}`, point[exercise]])),
  }));
  return (
    <Card className="flex h-96 flex-col">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5" /> Strength trends</CardTitle></CardHeader>
      <CardContent className="min-h-0 flex-1">
        {!chartData.length ? <div className="grid h-full place-items-center text-sm text-black/45">Complete weighted sets to build this chart.</div> :
          <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="date" tickFormatter={value => value.slice(5)} fontSize={12} />
            <YAxis unit=" kg" fontSize={12} width={54} />
            <Tooltip labelFormatter={value => new Date(`${value}T00:00:00`).toLocaleDateString()} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {exercises.map((exercise, index) => <Line key={exercise} type="monotone" dataKey={`exercise${index}`} name={exercise} connectNulls stroke={colors[index]} strokeWidth={2.5} dot={{ r: 3 }} />)}
          </LineChart></ResponsiveContainer>}
      </CardContent>
    </Card>
  );
}
