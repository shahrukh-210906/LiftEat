import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonalRecords } from "./PersonalRecords";
import { WorkoutConsistency } from "./WorkoutConsistency";
import { StrengthTrends } from "./StrengthTrends";
import { NutritionTrends } from "./NutritionTrends";

export function ProgressTab() {
  const [dateRange, setDateRange] = useState("30");

  return (
    <div className="flex flex-col gap-6">
      {/* Global Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Progress</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="180">6 Months</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top Row: PRs and Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonalRecords dateRange={dateRange} />
        <WorkoutConsistency dateRange={dateRange} />
      </div>

      {/* Bottom Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrengthTrends dateRange={dateRange} />
        <NutritionTrends dateRange={dateRange} />
      </div>
    </div>
  );
}