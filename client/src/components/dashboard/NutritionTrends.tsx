import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Utensils } from "lucide-react";

// Data normalized for calories. 
// Protein (4 cal/g), Carbs (4 cal/g), Fat (9 cal/g)
const nutritionData = [
  { week: "Aug 10", Protein: 640, Carbs: 1120, Fats: 684 },
  { week: "Aug 17", Protein: 660, Carbs: 1160, Fats: 684 },
  { week: "Aug 24", Protein: 620, Carbs: 1080, Fats: 693 },
  { week: "Aug 31", Protein: 680, Carbs: 1120, Fats: 675 },
];

export function NutritionTrends({ dateRange }: { dateRange: string }) {
  return (
    <Card className="h-96 flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Utensils className="w-5 h-5 text-orange-500" />
          Nutrition Breakdown (Calories)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={nutritionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }}/>
            <Bar dataKey="Protein" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Carbs" stackId="a" fill="#eab308" />
            <Bar dataKey="Fats" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}