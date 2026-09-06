import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Mock data generator for a 4-week grid
const generateHeatmap = () => {
  return Array.from({ length: 28 }).map(() => Math.random() > 0.4);
};

export function WorkoutConsistency({ dateRange }: { dateRange: string }) {
  const days = generateHeatmap();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Consistency Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex flex-col gap-2">
          {/* Weekday Labels (Optional) */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
          
          {/* 4 Weeks = 28 Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((isCompleted, i) => (
              <div
                key={i}
                className={`w-full aspect-square rounded-sm ${
                  isCompleted ? "bg-primary" : "bg-muted"
                }`}
                title={`Day ${i + 1}`}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/50"></div>
            <div className="w-3 h-3 rounded-sm bg-primary"></div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}