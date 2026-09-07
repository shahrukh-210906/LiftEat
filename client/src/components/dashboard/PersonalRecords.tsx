import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgressData } from "./ProgressTab";

export function PersonalRecords({ records }: { records: ProgressData["personalRecords"] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5" /> Personal records</CardTitle></CardHeader>
      <CardContent>
        {!records.length ? <p className="py-8 text-center text-sm text-black/45">Complete weighted sets to see your records here.</p> :
          <div className="mt-4 space-y-3">{records.map(record => (
            <div key={record.exercise} className="flex items-center justify-between rounded-xl bg-black/[0.035] p-3">
              <div><p className="font-semibold">{record.exercise}</p><p className="text-xs text-black/45">{new Date(`${record.date}T00:00:00`).toLocaleDateString()}</p></div>
              <div className="text-right"><p className="font-bold">{record.estimated1RM} kg est. 1RM</p><p className="text-xs text-black/45">{record.weight} kg × {record.reps}</p></div>
            </div>
          ))}</div>}
      </CardContent>
    </Card>
  );
}
