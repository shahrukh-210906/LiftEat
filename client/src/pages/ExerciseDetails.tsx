import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Plus } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

// Component Imports
import { ExerciseHero } from "@/components/exercises/ExerciseHero";
import { ExerciseInstructions } from "@/components/exercises/ExerciseInstructions";
import { ExerciseStats } from "@/components/exercises/ExerciseStats";
import { ExerciseRating } from "@/components/exercises/ExerciseRating";
import { ExerciseNote } from "@/components/exercises/ExerciseNote";
import { RatingsList } from "@/components/exercises/RatingsList"; // NEW Import

export default function ExerciseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchExercise = async () => {
    try {
      const { data } = await api.get(`/exercises/${id}`);
      setExercise(data);
    } catch (error) {
      toast.error("Could not load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchExercise();
  }, [id]);

  if (loading) return <div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  if (!exercise) return null;

  return (
    <AppLayout>
      <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full hover:bg-white/80 -ml-3 text-gray-500 hover:text-black transition-all">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <Button variant="outline" size="icon" className="rounded-full border-gray-200 hover:bg-white hover:border-black transition-colors">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Hero */}
        <ExerciseHero 
          image={exercise.images?.[0]} 
          name={exercise.name} 
          bodyPart={exercise.bodyPart} 
          equipment={exercise.equipment} 
        />

        {/* Title & Graph Stats */}
        <div className="space-y-4 px-2">
          <h1 className="text-4xl md:text-6xl font-black text-black capitalize tracking-tighter leading-[0.9]">
            {exercise.name}
          </h1>
          <ExerciseStats stats={exercise.stats} />
        </div>

        {/* Personal Note */}
        <div className="px-2">
           <ExerciseNote exerciseId={exercise._id} />
        </div>

        {/* 1. INSTRUCTIONS (Moved UP as requested) */}
        <ExerciseInstructions instructions={exercise.instructions} />

        {/* 2. RATING INPUT & RATINGS BOX (Moved DOWN) */}
        <div className="grid gap-6 md:grid-cols-2">
           {/* Left: Input */}
           <div>
             <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-3 px-2">Add Your Rating</h3>
             <ExerciseRating 
               exerciseId={exercise._id} 
               onRateComplete={fetchExercise} 
             />
           </div>

           {/* Right: History Log (New Box) */}
           <div>
              <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-3 px-2">History</h3>
              <RatingsList ratings={exercise.ratings} />
           </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 z-40 md:pl-72 pointer-events-none">
           <div className="max-w-4xl mx-auto pointer-events-auto">
             <Button className="w-full h-16 rounded-2xl bg-black text-white hover:bg-neutral-800 shadow-2xl shadow-black/20 text-lg font-bold flex items-center justify-center gap-3 transition-transform active:scale-[0.98]">
               <Plus className="w-6 h-6" /> Add to Routine
             </Button>
           </div>
        </div>

      </div>
    </AppLayout>
  );
}