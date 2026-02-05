import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type SingleMacroProps = {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color?: string; // We will ignore color to enforce monochrome
};

type AggregateMacroProps = {
  protein: number;
  carbs: number;
  fat: number;
  goal: number;
};

type MacroProgressProps = SingleMacroProps | AggregateMacroProps;

export function MacroProgress(props: MacroProgressProps) {
  // 1. SINGLE MACRO VIEW (Minimal Row)
  if ((props as SingleMacroProps).label) {
    const { label, current, goal, unit } = props as SingleMacroProps;
    const value = Math.min(Math.round((current / goal) * 100), 100);
    
    return (
      <div className="py-3 group">
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </span>
          <div className="text-right">
             <span className="font-bold text-lg text-black">{current}</span>
             <span className="text-xs text-gray-400 ml-1">/ {goal}{unit}</span>
          </div>
        </div>
        
        {/* Custom Monochrome Progress Bar */}
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out" 
            style={{ width: `${value}%` }} 
          />
        </div>
      </div>
    );
  }

  // 2. AGGREGATE VIEW (Clean Summary)
  const { protein, carbs, fat, goal } = props as AggregateMacroProps;
  const total = protein + carbs + fat;
  const percentage = (total / goal) * 100;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-black">Macros</h3>
        <span className="text-sm font-mono text-gray-500">
          {total} / {goal} kcal
        </span>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Protein Column */}
        <div className="flex flex-col gap-2">
           <span className="text-xs font-bold text-gray-400 uppercase">Protein</span>
           <span className="text-xl font-black">{protein}g</span>
           <div className="h-1.5 w-full bg-gray-100 rounded-full">
             <div className="h-full bg-black rounded-full" style={{ width: `${Math.min((protein/(goal * 0.3))*100, 100)}%` }} />
           </div>
        </div>

        {/* Carbs Column */}
        <div className="flex flex-col gap-2">
           <span className="text-xs font-bold text-gray-400 uppercase">Carbs</span>
           <span className="text-xl font-black">{carbs}g</span>
           <div className="h-1.5 w-full bg-gray-100 rounded-full">
             {/* Using a dark grey for contrast distinction without color */}
             <div className="h-full bg-gray-600 rounded-full" style={{ width: `${Math.min((carbs/(goal * 0.5))*100, 100)}%` }} />
           </div>
        </div>

        {/* Fat Column */}
        <div className="flex flex-col gap-2">
           <span className="text-xs font-bold text-gray-400 uppercase">Fat</span>
           <span className="text-xl font-black">{fat}g</span>
           <div className="h-1.5 w-full bg-gray-100 rounded-full">
             {/* Using a medium grey */}
             <div className="h-full bg-gray-400 rounded-full" style={{ width: `${Math.min((fat/(goal * 0.2))*100, 100)}%` }} />
           </div>
        </div>
      </div>
      
      {/* Total Energy Bar */}
      <div className="mt-6">
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black" style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}