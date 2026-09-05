import { Clock, Dumbbell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkoutSession } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface LastWorkoutProps {
  workout: WorkoutSession | null;
  exerciseCount?: number;
}

export function LastWorkout({ workout, exerciseCount = 0 }: LastWorkoutProps) {
  if (!workout) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Last Workout</h3>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No workouts yet</p>
          <Link
            to="/workout"
            className="text-primary text-sm hover:underline mt-2 inline-block"
          >
            Start your first workout →
          </Link>
        </div>
      </div>
    );
  }

  // Calculate time string safely
  const timeString = workout.completed_at
    ? formatDistanceToNow(new Date(workout.completed_at), { addSuffix: true })
    : 'Recently';

  return (
    <Link to={`/workout/${workout._id}`} className="glass-card p-4 block glow-hover">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Last Workout</h3>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{workout.name}</span>
          <span className="text-xs text-muted-foreground">
            {timeString}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{workout.duration_minutes || 0} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            <span>{exerciseCount} exercises</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
