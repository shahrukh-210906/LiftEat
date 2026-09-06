import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, X, Flame, Beef, Wheat, Droplets, Sparkles } from "lucide-react";
import { useDiet } from "@/hooks/useDiet";
import { AddFoodDialog } from "@/components/diet/AddFoodDialog";
import { MealTextLogger } from '@/components/diet/MealTextLogger';

export default function Diet() {
  const { profile, todaysLogs: logs, foodItems, totals, addLog, deleteLog, refreshData } = useDiet();
  const [addingFood, setAddingFood] = useState(false);
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const metrics = [
    { label: 'Calories', value: totals.calories, goal: calorieGoal, unit: 'kcal', icon: Flame },
    { label: 'Protein', value: Math.round(totals.protein), goal: profile?.daily_protein_goal || 150, unit: 'g', icon: Beef },
    { label: 'Carbs', value: Math.round(totals.carbs), goal: profile?.daily_carbs_goal || 200, unit: 'g', icon: Wheat },
    { label: 'Fat', value: Math.round(totals.fat), goal: profile?.daily_fat_goal || 65, unit: 'g', icon: Droplets },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="relative overflow-hidden rounded-[2rem] bg-[#11151d] px-6 py-7 text-white md:px-9 md:py-8">
          <div className="absolute right-8 top-0 h-full w-40 -skew-x-12 bg-[#c6ff40]/10" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><span className="lime-chip mb-4"><Sparkles className="h-3.5 w-3.5" /> AI assisted logging</span><h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">Fuel the work.</h1><p className="mt-2 text-sm text-white/55">Log naturally, review the estimate, and stay on target.</p></div>
            <Button aria-label="Add Food" onClick={() => setAddingFood(true)} className="w-fit rounded-2xl bg-white text-[#11151d] hover:bg-[#c6ff40]">
              <Plus className="w-4 h-4 mr-2" /> Add food manually
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map(({ label, value, goal, unit, icon: Icon }) => {
            const progress = Math.min((value / goal) * 100, 100);
            return <article key={label} className="app-card p-5">
              <div className="mb-5 flex items-center justify-between"><span className="eyebrow">{label}</span><span className="rounded-xl bg-secondary p-2 text-foreground/60"><Icon className="h-4 w-4" /></span></div>
              <p className="text-3xl font-black tracking-tight">{value}<span className="ml-1 text-xs font-bold text-foreground/35">{unit}</span></p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-xs text-foreground/40">{Math.max(goal - value, 0)} {unit} remaining</p>
            </article>;
          })}
        </section>

        <MealTextLogger onSaved={refreshData} />
        {/* Clean List */}
        <section className="app-card p-5 md:p-7">
           <div className="mb-2 flex items-center justify-between"><div><p className="eyebrow">Daily log</p><h3 className="mt-1 text-xl font-black">Today's meals</h3></div><span className="text-sm font-bold text-foreground/40">{logs.length} items</span></div>
           <div className="space-y-0 divide-y divide-black/[0.06]">
             {logs.map((log) => (
               <div key={log._id} className="flex items-center justify-between py-5 group">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{log.food_name}</p>
                    <p className="text-sm text-gray-400">{log.quantity_g}g • {log.calories} kcal</p>
                    {log.source === 'ai_estimate' && <p className="mt-1 text-xs font-bold text-green-700">AI estimate · reviewed by you</p>}
                  </div>
                  <button aria-label={`Delete ${log.food_name}`} onClick={() => deleteLog(log._id)} className="text-gray-300 hover:text-red-500 sm:opacity-0 group-hover:opacity-100 transition-all p-2">
                    <X className="w-5 h-5" />
                  </button>
               </div>
             ))}
             {logs.length === 0 && (
                <div className="py-8 text-center text-gray-400 italic">No meals logged yet.</div>
             )}
           </div>
        </section>

      </div>
      <AddFoodDialog open={addingFood} onOpenChange={setAddingFood} foods={foodItems} onAdd={addLog} />
    </AppLayout>
  );
}
