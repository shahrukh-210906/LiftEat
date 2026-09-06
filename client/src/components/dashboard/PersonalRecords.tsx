import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

const prData = [
  { exercise: "Back Squat", date: "Sep 2, 2026", oldPr: 225, newPr: 235 },
  { exercise: "Deadlift", date: "Aug 28, 2026", oldPr: 315, newPr: 325 },
  { exercise: "Bench Press", date: "Aug 15, 2026", oldPr: 185, newPr: 195 },
];

export function PersonalRecords({ dateRange }: { dateRange: string }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-4">
          {prData.map((pr, idx) => {
            const improvement = (((pr.newPr - pr.oldPr) / pr.oldPr) * 100).toFixed(1);
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="font-semibold">{pr.exercise}</p>
                  <p className="text-xs text-muted-foreground">{pr.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{pr.newPr} lbs</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="line-through">{pr.oldPr}</span>
                    <Badge variant="default" className="bg-green-500/10 text-green-600 border-none">
                      +{improvement}%
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}