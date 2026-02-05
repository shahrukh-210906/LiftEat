import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";

interface ExerciseHeroProps {
  image?: string;
  name: string;
  bodyPart: string;
  equipment: string;
}

export function ExerciseHero({ image, name, bodyPart, equipment }: ExerciseHeroProps) {
  return (
    <div className="relative w-full aspect-square md:aspect-[21/9] bg-white/40 backdrop-blur-sm border border-white/60 rounded-[2rem] p-8 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 pointer-events-none" />
      {image ? (
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain mix-blend-multiply relative z-10 transition-transform duration-700 hover:scale-105" 
        />
      ) : (
        <Dumbbell className="w-32 h-32 text-gray-200/50" />
      )}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
        <Badge className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-black/10 hover:bg-neutral-800 transition-colors cursor-default">
          {bodyPart}
        </Badge>
        <Badge variant="outline" className="bg-white/90 backdrop-blur border-white/50 text-gray-500 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm">
          {equipment}
        </Badge>
      </div>
    </div>
  );
}