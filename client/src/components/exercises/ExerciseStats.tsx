import { cn } from "@/lib/utils";

interface StatsProps {
  stats?: {
    counts: {
      INJURED: number;
      NO_FEEL: number;
      MODERATE: number;
      EFFECTIVE: number;
    };
    total: number;
  };
}

const CATEGORIES = [
  { key: 'EFFECTIVE', label: 'Super Effective', color: 'bg-black' },
  { key: 'MODERATE', label: 'Felt a bit', color: 'bg-gray-400' },
  { key: 'NO_FEEL', label: "Didn't feel anything", color: 'bg-gray-200' },
  { key: 'INJURED', label: 'Injured', color: 'bg-red-500' }, // Keep red for safety warning
];

export function ExerciseStats({ stats }: StatsProps) {
  const total = stats?.total || 0;
  
  if (total === 0) {
    return (
      <div className="py-4 text-sm text-gray-400 italic">
        No ratings yet. Be the first!
      </div>
    );
  }

  return (
    <div className="w-full py-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Community Feedback</h3>
        <span className="text-xs font-bold text-black">{total} Votes</span>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          // @ts-ignore - Dynamic key access
          const count = stats?.counts?.[cat.key] || 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={cat.key} className="group flex items-center gap-3 text-sm">
              <div className="w-32 flex-shrink-0 font-medium text-gray-600 group-hover:text-black transition-colors">
                {cat.label}
              </div>
              
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", cat.color)} 
                  style={{ width: `${percent}%` }}
                />
              </div>
              
              <div className="w-8 text-right font-bold text-xs text-gray-400 group-hover:text-black">
                {percent}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}