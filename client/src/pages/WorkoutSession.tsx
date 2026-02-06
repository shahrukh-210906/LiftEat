import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// [NEW] Import Trash2 icon
import { Trophy, Plus, Check, Trash2 } from "lucide-react";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const {
    workout,
    exercises,
    workoutName,
    setWorkoutName,
    elapsedTime,
    addSet,
    deleteSet, // [NEW] Destructure deleteSet
    finishWorkout,
  } = useWorkoutSession(id);

  const [inputs, setInputs] = useState<Record<string, { reps: string; weight: string }>>({});

  const handleInputChange = (exId: string, field: 'reps' | 'weight', value: string) => {
    setInputs(prev => ({
      ...prev,
      [exId]: { ...prev[exId], [field]: value }
    }));
  };

  if (!workout) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <AppLayout hideNav>
      <div className="min-h-screen bg-black pb-32">
        <WorkoutHeader
          elapsedTime={elapsedTime}
          workoutName={workoutName}
          setWorkoutName={setWorkoutName}
        />

        <div className="p-4 space-y-6">
          {exercises.map((exercise) => (
            <div key={exercise._id} className="bg-zinc-900 rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-xl font-black text-white capitalize">{exercise.exercise_base?.name || "Exercise"}</h3>
              
              {/* History of Sets */}
              <div className="space-y-2">
                {exercise.sets?.map((set, i) => (
                  <div key={set._id || i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl text-sm group">
                    <div className="flex items-center gap-4">
                       <span className="text-zinc-500 font-bold w-12">SET {i + 1}</span>
                       <span className="text-white font-black text-lg">{set.weight}kg × {set.reps}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      
                      {/* [NEW] Delete Button */}
                      <button 
                        onClick={() => deleteSet(exercise._id, set._id)}
                        className="p-2 rounded-full hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input for New Set */}
              <div className="flex gap-3 items-center pt-2">
                <Input
                  type="number"
                  placeholder="kg"
                  value={inputs[exercise._id]?.weight || ""}
                  onChange={(e) => handleInputChange(exercise._id, 'weight', e.target.value)}
                  className="bg-zinc-800 border-none text-white font-bold h-12 text-center"
                />
                <span className="text-zinc-600 font-bold">×</span>
                <Input
                  type="number"
                  placeholder="Reps"
                  value={inputs[exercise._id]?.reps || ""}
                  onChange={(e) => handleInputChange(exercise._id, 'reps', e.target.value)}
                  className="bg-zinc-800 border-none text-white font-bold h-12 text-center"
                />
                <Button 
                  onClick={() => {
                    const weight = parseFloat(inputs[exercise._id]?.weight || "0");
                    const reps = parseInt(inputs[exercise._id]?.reps || "0");
                    addSet(exercise._id, reps, weight);
                    // Clear inputs
                    handleInputChange(exercise._id, 'weight', "");
                    handleInputChange(exercise._id, 'reps', "");
                  }}
                  className="h-12 w-12 rounded-xl bg-white text-black hover:bg-zinc-200"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
          <Button
            onClick={finishWorkout}
            className="w-full h-16 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-2xl shadow-blue-500/20"
          >
            <Trophy className="w-6 h-6 mr-3" /> FINISH WORKOUT
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}