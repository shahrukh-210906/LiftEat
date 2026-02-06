import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Trash2, Dumbbell, Timer } from "lucide-react";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { Badge } from "@/components/ui/badge";

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const {
    workout,
    exercises,
    workoutName,
    setWorkoutName,
    elapsedTime,
    addSet,
    deleteSet,
    finishWorkout,
    loading
  } = useWorkoutSession(id);

  // Local state to manage inputs for each exercise independently
  const [inputs, setInputs] = useState<Record<string, { reps: string; weight: string }>>({});

  const handleInputChange = (exId: string, field: 'reps' | 'weight', value: string) => {
    setInputs(prev => ({
      ...prev,
      [exId]: { ...prev[exId], [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!workout) return null;

  return (
    <AppLayout hideNav>
      <div className="min-h-screen bg-gray-50/50 pb-32">
        {/* Header - Sticky Top */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
            <WorkoutHeader
            elapsedTime={elapsedTime}
            workoutName={workoutName}
            setWorkoutName={setWorkoutName}
            />
        </div>

        <div className="p-4 space-y-6 max-w-3xl mx-auto mt-4">
          {exercises.map((exercise, index) => {
             // Handle both new structure (exercise_base object) and legacy fallback
            const exerciseName = exercise.exercise_base?.name || exercise.exercise_name || "Unknown Exercise";
            const bodyPart = exercise.exercise_base?.bodyPart || exercise.muscle_group || "General";
            const imageUrl = exercise.exercise_base?.images?.[0];

            return (
            <div key={exercise._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Exercise Header */}
              <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={exerciseName} className="h-full w-full object-cover" />
                  ) : (
                    <Dumbbell className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 h-5 bg-black text-white">{bodyPart}</Badge>
                   </div>
                  <h3 className="font-black text-lg text-gray-900 leading-tight capitalize">
                    {exerciseName}
                  </h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Sets List */}
                <div className="space-y-2">
                  {/* Table Header */}
                   {exercise.sets && exercise.sets.length > 0 && (
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-gray-400 px-2">
                        <div className="col-span-2 text-center">Set</div>
                        <div className="col-span-4 text-center">kg</div>
                        <div className="col-span-4 text-center">Reps</div>
                        <div className="col-span-2"></div>
                    </div>
                   )}

                  {exercise.sets?.map((set: any, i: number) => (
                    <div key={set._id || i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2 h-12">
                      <div className="col-span-2 flex justify-center">
                         <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                             {i + 1}
                         </div>
                      </div>
                      <div className="col-span-4 text-center font-black text-gray-900 text-lg">
                        {set.weight}
                      </div>
                      <div className="col-span-4 text-center font-black text-gray-900 text-lg">
                        {set.reps}
                      </div>
                      <div className="col-span-2 flex justify-end pr-1">
                        <button 
                          onClick={() => deleteSet(exercise._id, set._id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Set Form */}
                <div className="flex gap-2 items-center pt-2 mt-2 border-t border-dashed border-gray-100">
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all">
                      <label className="text-[9px] uppercase font-bold text-gray-400 block">Weight</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={inputs[exercise._id]?.weight || ""}
                        onChange={(e) => handleInputChange(exercise._id, 'weight', e.target.value)}
                        className="w-full font-black text-lg outline-none placeholder:text-gray-200"
                      />
                  </div>

                  <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all">
                      <label className="text-[9px] uppercase font-bold text-gray-400 block">Reps</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={inputs[exercise._id]?.reps || ""}
                        onChange={(e) => handleInputChange(exercise._id, 'reps', e.target.value)}
                        className="w-full font-black text-lg outline-none placeholder:text-gray-200"
                      />
                  </div>

                  <Button 
                    onClick={() => {
                      const weight = parseFloat(inputs[exercise._id]?.weight || "0");
                      const reps = parseInt(inputs[exercise._id]?.reps || "0");
                      if (reps > 0) {
                          addSet(exercise._id, reps, weight);
                          // Keep weight for convenience, clear reps
                          handleInputChange(exercise._id, 'reps', "");
                      }
                    }}
                    className="h-14 w-14 rounded-xl bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          )})}

          {exercises.length === 0 && (
             <div className="text-center py-12 text-gray-400">
                 <p>No exercises in this session.</p>
             </div>
          )}
        </div>

        {/* Floating Action Button for Finish */}
        <div className="fixed bottom-6 left-4 right-4 max-w-3xl mx-auto">
          <Button
            onClick={finishWorkout}
            className="w-full h-16 bg-black text-white hover:bg-gray-900 font-black text-lg rounded-2xl shadow-2xl shadow-black/20 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Trophy className="w-5 h-5 text-yellow-400" /> 
            FINISH WORKOUT
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}