import { ArrowLeft, Clock, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface Props {
  elapsedTime: number;
  workoutName: string;
  setWorkoutName: (name: string) => void;
}

export function WorkoutHeader({ elapsedTime, workoutName, setWorkoutName }: Props) {
  const navigate = useNavigate();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate("/workout")} className="p-2 -ml-2 hover:bg-white/10 rounded-full text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="font-mono font-bold text-indigo-100">{formatTime(elapsedTime)}</span>
        </div>
      </div>
      <div className="relative">
        <Input
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="bg-transparent border-none text-2xl font-black text-white p-0 h-auto focus-visible:ring-0"
          placeholder="Workout Name..."
        />
        <Dumbbell className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
      </div>
    </div>
  );
}