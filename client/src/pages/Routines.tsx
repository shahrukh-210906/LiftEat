import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Play, Dumbbell, MoreVertical, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Routines() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    try {
      const { data } = await api.get("/workouts/routines");
      setRoutines(data);
    } catch (error) {
      toast.error("Failed to load routines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const startWorkout = async (routineId: string) => {
    try {
      const { data } = await api.post(`/workouts/start/${routineId}`);
      navigate(`/workout/${data._id}`);
    } catch (error) {
      toast.error("Failed to start workout");
    }
  };

  const deleteRoutine = async (id: string) => {
    try {
      await api.delete(`/workouts/routines/${id}`);
      setRoutines((prev) => prev.filter((r) => r._id !== id));
      toast.success("Routine deleted");
    } catch (error) {
      toast.error("Failed to delete routine");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">MY ROUTINES</h1>
            <p className="text-gray-500 font-medium">Your custom built workout plans</p>
          </div>
          <Button 
            onClick={() => navigate("/routines/new")}
            className="bg-black text-white rounded-full px-6 font-bold hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New
          </Button>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed">
            <Dumbbell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">No routines found.</p>
            <Button variant="link" onClick={() => navigate("/routines/new")}>Build your first one now</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.map((routine) => (
              <div key={routine._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black capitalize">{routine.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {routine.exercises?.length || 0} Exercises
                    </p>
                  </div>

                  {/* Dropdown Menu for Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 -mr-2">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 rounded-xl">
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoutine(routine._id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {routine.exercises?.slice(0, 3).map((item: any, i: number) => (
                    // Handle both new {exercise: {...}} structure and old fallback
                    <Badge key={i} variant="secondary" className="bg-gray-50 text-[10px] uppercase">
                      {item.exercise?.name || item.name || "Exercise"}
                    </Badge>
                  ))}
                  {routine.exercises?.length > 3 && (
                    <span className="text-[10px] text-gray-400 font-bold">+{routine.exercises.length - 3} more</span>
                  )}
                </div>

                <Button 
                  onClick={() => startWorkout(routine._id)}
                  className="w-full bg-zinc-900 text-white rounded-2xl h-12 font-black group-hover:bg-black transition-colors"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" /> START WORKOUT
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}