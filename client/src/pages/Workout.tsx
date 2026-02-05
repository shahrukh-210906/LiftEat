import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Dumbbell, 
  Plus, 
  Play, 
  ChevronRight, 
  Star, 
  AlertTriangle, 
  Zap, 
  Activity,
  ThumbsUp,
  X
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  _id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  images: string[];
  instructions: string[];
  stats?: {
    totalReviews: number;
    injuryRate: number;
    effectiveness: number;
  };
}

export default function Workout() {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    fetchExercises("");
  }, []);

  const fetchExercises = async (searchTerm: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/exercises/search?query=${searchTerm}`);
      setExercises(data);
    } catch (error) {
      toast.error("Could not load exercises");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (ex: Exercise) => {
    setSelectedExercise(ex);
    setDetailsOpen(true);
  };

  const submitRating = async (rating: 'EFFECTIVE' | 'DIDNT_FEEL' | 'INJURED') => {
    if (!selectedExercise) return;
    try {
      await api.post('/exercises/rate', {
        exerciseId: selectedExercise._id,
        rating,
        comment: "Quick rating"
      });
      toast.success("Feedback recorded!");
      setRateModalOpen(false);
      fetchExercises(query); // Refresh to show new stats
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-8 max-w-4xl mx-auto pb-24">
        
        {/* --- Hero --- */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 p-8 text-white shadow-2xl">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                <Dumbbell className="w-8 h-8 text-indigo-400" />
                Workout
              </h1>
              <p className="text-indigo-200 max-w-sm text-sm">
                Ready for your session? Start a routine or explore the library.
              </p>
            </div>
            <Button size="icon" className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full">
              <Plus className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* --- Training Action --- */}
        <section className="space-y-3 px-1">
          <h2 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Training</h2>
          <Button className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 shadow-lg">
            <Play className="w-5 h-5 fill-current" />
            Start Empty Workout
          </Button>
        </section>

        {/* --- Search --- */}
        <div className="sticky top-4 z-20 flex gap-2 glass-card p-2 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md bg-gray-900/40">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <Input 
              placeholder="Search library..." 
              className="pl-11 bg-transparent border-0 focus-visible:ring-0 text-base text-white"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                fetchExercises(e.target.value);
              }}
            />
          </div>
        </div>

        {/* --- Library --- */}
        <section className="space-y-2">
          {loading ? (
            <div className="grid place-items-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-2">
              {exercises.map((ex) => (
                <div 
                  key={ex._id}
                  onClick={() => openDetails(ex)}
                  className="group flex items-center gap-4 p-3 bg-gray-900/50 border border-white/5 hover:border-indigo-500/50 rounded-2xl transition-all cursor-pointer active:bg-indigo-950/40"
                >
                  <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/5">
                    <img src={ex.images?.[0]} alt="" className="w-full h-full object-contain opacity-80 group-hover:opacity-100" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-indigo-400 capitalize truncate">{ex.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">{ex.bodyPart}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">{ex.equipment}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {ex.stats && ex.stats.effectiveness > 85 && <Zap className="w-4 h-4 text-yellow-500 fill-current opacity-70" />}
                    <ChevronRight className="w-5 h-5 text-indigo-500/50 group-hover:text-indigo-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --- 1. DETAILS MODAL --- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl bg-gray-950 border-gray-800 p-0 overflow-hidden">
          {selectedExercise && (
            <div className="flex flex-col md:flex-row max-h-[90vh]">
              <div className="w-full md:w-5/12 bg-black/40 p-6 flex flex-col border-r border-white/5">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-6 p-4">
                  <img src={selectedExercise.images?.[0]} className="w-full h-full object-contain" alt="" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-indigo-600 capitalize">{selectedExercise.bodyPart}</Badge>
                    <Badge variant="outline" className="text-indigo-400 border-indigo-400/30 capitalize">{selectedExercise.equipment}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 text-center">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-tighter">Safety</span>
                      <span className="text-lg font-bold text-green-400">{100 - (selectedExercise.stats?.injuryRate || 0)}%</span>
                    </div>
                    <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 text-center">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-tighter">Power</span>
                      <span className="text-lg font-bold text-indigo-400">{selectedExercise.stats?.effectiveness || 0}%</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setRateModalOpen(true)}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 mt-2"
                  >
                    <Star className="w-4 h-4 mr-2" /> Rate Form
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-white capitalize italic tracking-tight">
                    {selectedExercise.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Execution Steps
                  </h3>
                  <div className="space-y-4 border-l border-white/10 pl-4">
                    {selectedExercise.instructions.map((step, i) => (
                      <div key={i} className="relative">
                         <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                         <p className="text-sm text-gray-400 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12">
                    Add to Workout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- 2. RATING MODAL --- */}
      <Dialog open={rateModalOpen} onOpenChange={setRateModalOpen}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Rate {selectedExercise?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              How did this exercise feel today?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex flex-col h-24 gap-2 border-white/5 bg-white/5 hover:bg-green-500/20 hover:border-green-500 hover:text-green-400"
              onClick={() => submitRating('EFFECTIVE')}
            >
              <ThumbsUp className="w-8 h-8" />
              Effective
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-24 gap-2 border-white/5 bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-500 hover:text-yellow-400"
              onClick={() => submitRating('DIDNT_FEEL')}
            >
              <Activity className="w-8 h-8" />
              Okay
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-24 gap-2 border-white/5 bg-white/5 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 col-span-2"
              onClick={() => submitRating('INJURED')}
            >
              <AlertTriangle className="w-8 h-8" />
              Pain / Injury
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}