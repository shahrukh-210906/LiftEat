import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Trophy, Plus } from "lucide-react";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
// Assuming you extract the exercise card similarly to the header
// import { ExerciseCard } from "@/components/workout/ExerciseCard";
// import { AddExerciseDialog } from "@/components/workout/AddExerciseDialog";

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const {
    workout,
    exercises,
    workoutName,
    setWorkoutName,
    elapsedTime,
    addSet,
    finishWorkout,
  } = useWorkoutSession(id);

  if (!workout)
    return <div className="p-8 text-center text-white">Loading Workout...</div>;

  return (
    <AppLayout hideNav>
      <div className="min-h-screen bg-gray-950 pb-32">
        <WorkoutHeader
          elapsedTime={elapsedTime}
          workoutName={workoutName}
          setWorkoutName={setWorkoutName}
        />

        <div className="p-4 space-y-6">
          {/* Map your exercises here. Ideally, move the card UI to ExerciseCard.tsx */}
          {exercises.map((exercise) => (
            <div key={exercise.id} className="text-white">
              {/* ... existing card UI code ... */}
              <h3 className="font-bold">{exercise.exercise_name}</h3>
              <Button onClick={() => addSet(exercise.id, exercise.sets || [])}>
                Add Set
              </Button>
            </div>
          ))}

          {/* Placeholder for Add Trigger */}
          <Button className="w-full h-14 bg-white/5">
            <Plus className="w-6 h-6 mr-2" /> Add Exercise
          </Button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950 pb-8">
          <Button
            onClick={finishWorkout}
            className="w-full h-14 bg-indigo-600 text-white font-bold rounded-2xl"
          >
            <Trophy className="w-5 h-5 mr-2" /> Finish Workout
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
