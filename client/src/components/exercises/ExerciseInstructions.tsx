import { Zap } from "lucide-react";

interface ExerciseInstructionsProps {
  instructions: string[];
}

export function ExerciseInstructions({ instructions }: ExerciseInstructionsProps) {
  return (
    <div className="glass-card p-6 md:p-10 space-y-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
        <div className="p-2 bg-black text-white rounded-lg">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <h2 className="text-xl font-black text-black tracking-tight">
          Execution Steps
        </h2>
      </div>
      
      <div className="space-y-0 relative pl-4">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-100/80" />

        {instructions?.map((step, i) => (
          <div key={i} className="relative pl-10 pb-8 last:pb-0 group">
            {/* Number Bubble */}
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white border-2 border-gray-100 text-gray-400 text-[10px] font-bold flex items-center justify-center transition-all duration-300 group-hover:border-black group-hover:text-black group-hover:scale-110 z-10">
              {i + 1}
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed font-medium group-hover:text-black transition-colors">
              {step}
            </p>
          </div>
        ))}

        {!instructions?.length && (
          <p className="text-gray-400 italic pl-4">No instructions available.</p>
        )}
      </div>
    </div>
  );
}