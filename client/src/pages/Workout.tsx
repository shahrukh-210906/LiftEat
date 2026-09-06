import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Play, ArrowUpRight, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useWorkoutLibrary } from "@/hooks/useWorkoutLibrary";
import api from '@/lib/api';
import { WorkoutRoutine, WorkoutSession } from '@/lib/types';

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs", "Cardio"];

export default function Workout() {
  const navigate = useNavigate();
  const { startSession, exercises, query, setQuery, category, setCategory, loading } = useWorkoutLibrary();
  const { user } = useAuth();
  const favoritesKey = 'lifteat:favorites:' + user?.id;
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [overview, setOverview] = useState<{ activeWorkout: WorkoutSession | null; routines: WorkoutRoutine[] }>({ activeWorkout: null, routines: [] });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
      setFavorites(new Set(Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : []));
    } catch { setFavorites(new Set()); }
  }, [favoritesKey]);
  useEffect(() => { api.get('/workouts/overview').then(({ data }) => setOverview(data)).catch(() => toast.error('Could not load your training overview')); }, []);

  const handleQuickStart = async () => {
    if (overview.activeWorkout) return navigate(`/workout/${overview.activeWorkout._id}`);
    try {
      await startSession("Quick Start Workout");
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  const handleCreateRoutine = () => {
    navigate('/routines/new');
  };

  const startRoutine = async (id: string) => { try { const { data } = await api.post(`/workouts/start/${id}`); navigate(`/workout/${data._id}`); } catch { toast.error('Failed to start workout'); } };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(id)) {
        newFavs.delete(id);
        toast("Removed from favorites");
      } else {
        newFavs.add(id);
        toast.success("Added to favorites");
      }
      localStorage.setItem(favoritesKey, JSON.stringify([...newFavs]));
      return newFavs;
    });
  };

  return (
    <AppLayout>
       <div className="space-y-8 animate-in fade-in duration-700">
         
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-7 border-b border-black/10 pb-8">
           <div className="space-y-2"><span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-black/35">Exercise library</span>
             <h1 className="text-4xl md:text-5xl font-black tracking-[-0.04em]">Build your session.</h1>
             <p className="text-black/45 font-medium max-w-md">Find a movement, save it, or start a routine.</p>
           </div>
           
           <div className="flex flex-wrap gap-3">
             <Button 
               variant="outline"
               onClick={handleCreateRoutine}
               className="h-11 px-5 border-black/15 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
             >
               <Plus className="w-4 h-4 mr-2" /> Create Routine
             </Button>

             <Button 
               onClick={handleQuickStart}
               className="bg-black text-white hover:bg-black/80 px-7 h-11 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors"
             >
               <Play className="w-4 h-4 mr-2 fill-current" /> {overview.activeWorkout ? 'Continue' : 'Quick Start'}
             </Button>
           </div>
         </header>

         {overview.activeWorkout && <section className="app-card flex flex-col justify-between gap-4 border-black bg-black p-5 text-white sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-widest text-white/45">In progress</p><h2 className="mt-1 text-xl font-black">{overview.activeWorkout.name}</h2></div><Button onClick={() => navigate(`/workout/${overview.activeWorkout?._id}`)} className="bg-white text-black hover:bg-gray-200"><Play className="mr-2 h-4 w-4" /> Continue workout</Button></section>}

         <section className="space-y-4"><div className="flex items-end justify-between"><div><p className="eyebrow">Start here</p><h2 className="mt-1 text-2xl font-black">Your routines</h2></div><button onClick={() => navigate('/routines')} className="text-sm font-bold underline underline-offset-4">View all</button></div>
           {overview.routines.length ? <div className="grid gap-3 md:grid-cols-3">{overview.routines.slice(0, 3).map(routine => <article key={routine._id} className="app-card p-5"><p className="text-xs font-bold uppercase tracking-widest text-gray-400">{routine.exercises.length} exercises</p><h3 className="mt-2 truncate text-lg font-black capitalize">{routine.name}</h3><Button disabled={!!overview.activeWorkout} onClick={() => startRoutine(routine._id)} className="mt-5 w-full bg-black text-white">{overview.activeWorkout ? 'Finish active workout first' : 'Start routine'}</Button></article>)}</div> : <div className="rounded-2xl border border-dashed p-6 text-sm text-gray-500">No routines yet. <button onClick={handleCreateRoutine} className="font-bold text-black underline">Create your first routine</button>.</div>}
         </section>

         <div className="border-t border-black/10 pt-8"><p className="eyebrow">Exercise library</p><h2 className="mt-1 text-2xl font-black">Browse movements</h2></div>
         
         {/* Floating Filter Bar */}
         <div className="sticky top-4 z-30 app-card p-2 flex flex-col md:flex-row gap-2 items-center">
            <div className="relative flex-1 w-full min-w-0">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                 className="pl-12 h-14 border-0 bg-transparent focus-visible:ring-0 placeholder:text-gray-400 text-lg font-medium w-full focus:outline-none" 
                 placeholder="Search exercises..."
                 value={query} 
                 onChange={e => setQuery(e.target.value)}
               />
            </div>
            
            <div className="flex gap-1 overflow-x-auto w-full md:w-auto md:max-w-[40%] p-1 scrollbar-hide md:border-l md:border-gray-200 md:pl-3">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    category === cat 
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-400 hover:bg-secondary hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
         </div>

         {loading && <p>Loading exercises…</p>}
         {!loading && exercises.length === 0 && <p>No exercises found.</p>}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
           {exercises.map((ex) => {
             const isFav = favorites.has(ex._id);
             
             return (
               <div 
                 key={ex._id} 
                 onClick={() => navigate(`/exercises/${ex._id}`)}
                 className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1"
               >
                 <div className="absolute inset-0 z-0">
                   <img 
                     src={ex.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"} 
                     alt={ex.name}
                     className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                 </div>

                 <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                   <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 px-3 py-1 uppercase text-[10px] tracking-widest">
                     {ex.bodyPart}
                   </Badge>
                   
                   <button
                     onClick={(e) => toggleFavorite(e, ex._id)}
                     className={cn(
                       "w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 active:scale-90",
                       isFav 
                         ? "bg-red-500 text-white" 
                         : "bg-white/10 text-white hover:bg-white hover:text-red-500"
                     )}
                   >
                     <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
                   </button>
                 </div>

                 <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                   <div className="space-y-2">
                     <h3 className="text-2xl font-black text-white leading-none tracking-tight">
                       {ex.name}
                     </h3>
                     
                     <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] text-gray-200 font-bold uppercase tracking-wider">
                         <Dumbbell className="w-3 h-3 text-white" />
                         {ex.equipment || "Bodyweight"}
                       </div>
                       
                       {ex.stats?.total > 0 && (
                         <div className="text-[10px] text-gray-400 font-bold">
                           {ex.stats.total} VOTES
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                   <div className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
                     View Details <ArrowUpRight className="w-4 h-4" />
                   </div>
                 </div>
               </div>
             );
           })}
         </div>

       </div>
    </AppLayout>
  );
}
