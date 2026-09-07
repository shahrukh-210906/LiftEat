import { Utensils } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgressData } from "./ProgressTab";

export function NutritionTrends({ data }: { data: ProgressData["nutritionTrends"] }) {
  return (
    <Card className="flex h-96 flex-col">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Utensils className="h-5 w-5" /> Daily macros</CardTitle></CardHeader>
      <CardContent className="min-h-0 flex-1">
        {!data.length ? <div className="grid h-full place-items-center text-sm text-black/45">Log meals to build your nutrition chart.</div> :
          <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="date" tickFormatter={value => value.slice(5)} fontSize={12} />
            <YAxis unit=" g" fontSize={12} width={48} />
            <Tooltip labelFormatter={value => new Date(`${value}T00:00:00`).toLocaleDateString()} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="protein" name="Protein" stackId="macros" fill="#111111" />
            <Bar dataKey="carbs" name="Carbs" stackId="macros" fill="#777777" />
            <Bar dataKey="fat" name="Fat" stackId="macros" fill="#bbbbbb" radius={[3, 3, 0, 0]} />
          </BarChart></ResponsiveContainer>}
      </CardContent>
    </Card>
  );
}
