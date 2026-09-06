import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, X, Flame } from "lucide-react";
import { useDiet } from "@/hooks/useDiet";
import { AddFoodDialog } from "@/components/diet/AddFoodDialog";
import { MealTextLogger } from '@/components/diet/MealTextLogger';

export default function Diet() {
  const { profile, todaysLogs: logs, foodItems, totals, addLog, deleteLog, refreshData } = useDiet();
  const [addingFood, setAddingFood] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-2">
           <h1 className="text-3xl font-bold text-gray-900">Nutrition</h1>
           <Button onClick={() => setAddingFood(true)} variant="outline" className="border-gray-200 rounded-xl hover:bg-gray-50">
             <Plus className="w-4 h-4 mr-2" /> Add Food
           </Button>
        </div>

        {/* Minimal Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 rounded-3xl bg-gray-50 border border-transparent">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Calories</span>
              </div>
              <p className="text-4xl font-black text-gray-900">{totals.calories}</p>
              <p className="text-sm text-gray-400 mt-1">Goal: {profile?.daily_calorie_goal || 2000}</p>
           </div>
           
           <div className="p-6 rounded-3xl bg-white border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                 <span className="text-sm font-bold uppercase tracking-wider">Protein</span>
              </div>
              <p className="text-4xl font-black text-gray-900">{Math.round(totals.protein)}g</p>
              <p className="text-sm text-gray-400 mt-1">Goal: {profile?.daily_protein_goal || 150}g</p>
           </div>
        </div>

        <MealTextLogger onSaved={refreshData} />
        {/* Clean List */}
        <div className="px-2">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Today's Meals</h3>
           <div className="space-y-0 divide-y divide-gray-100">
             {logs.map((log) => (
               <div key={log._id} className="flex items-center justify-between py-4 group">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{log.food_name}</p>
                    <p className="text-sm text-gray-400">{log.quantity_g}g • {log.calories} kcal</p>
                    {log.source === 'ai_estimate' && <p className="text-xs text-violet-600">AI estimate · reviewed by you</p>}
                  </div>
                  <button aria-label={`Delete ${log.food_name}`} onClick={() => deleteLog(log._id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                    <X className="w-5 h-5" />
                  </button>
               </div>
             ))}
             {logs.length === 0 && (
                <div className="py-8 text-center text-gray-400 italic">No meals logged yet.</div>
             )}
           </div>
        </div>

      </div>
      <AddFoodDialog open={addingFood} onOpenChange={setAddingFood} foods={foodItems} onAdd={addLog} />
    </AppLayout>
  );
}
