import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Play, ArrowUpRight, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { useWorkoutLibrary } from "@/hooks/useWorkoutLibrary";

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs", "Cardio"];

export default function Workout() {
  const navigate = useNavigate();
  const { startSession } = useWorkoutLibrary();
  const [exercises, setExercises] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  
  // State to track favorite exercise IDs
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch Exercises based on search and category
  useEffect(() => {
    const fetch = async () => {
       const params = new URLSearchParams();
       if (query) params.append("query", query);
       if (category !== "All") params.append("bodyPart", category.toLowerCase());
       try { 
         const { data } = await api.get(`/exercises?${params.toString()}`); 
         setExercises(data); 
       } catch (error) {
         console.error("Failed to fetch exercises", error);
       }
    };
    fetch();
  }, [query, category]);

  // Logic for Quick Start: Initializes a new session via the library hook
  const handleQuickStart = async () => {
    try {
      await startSession("Quick Start Workout");
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  // Logic for Create Routine: Navigates to the routine builder
  const handleCreateRoutine = () => {
    navigate('/routines/new');
  };

  // Handle Favorite Toggle
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
      return newFavs;
    });
  };

  return (
    <AppLayout>
       <div className="space-y-8 animate-in fade-in duration-700">
         
         {/* Hero Section with Action Buttons */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-2">
             <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">
               Library
             </h1>
             <p className="text-gray-400 font-medium max-w-sm">
               Explore the collection. Build your perfect routine.
             </p>
           </div>
           
           <div className="flex flex-wrap gap-3">
             <Button 
               variant="outline"
               onClick={handleCreateRoutine}
               className="h-12 px-6 border-2 border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95"
             >
               <Plus className="w-4 h-4 mr-2" /> Create Routine
             </Button>

             <Button 
               onClick={handleQuickStart}
               className="btn-primary-gradient px-8 h-12 text-sm font-bold uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-transform"
             >
               <Play className="w-4 h-4 mr-2 fill-current" /> Quick Start
             </Button>
           </div>
         </div>

         {/* Floating Filter Bar */}
         <div className="sticky top-6 z-30 glass-card p-2 flex flex-col md:flex-row gap-2 items-center shadow-xl shadow-black/5">
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
                    ? "bg-black text-white shadow-lg shadow-black/20 scale-105" 
                    : "text-gray-400 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
         </div>

         {/* Enhanced Grid Layout with Glassmorphism Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
           {exercises.map((ex) => {
             const isFav = favorites.has(ex._id);
             
             return (
               <div 
                 key={ex._id} 
                 onClick={() => navigate(`/exercises/${ex._id}`)}
                 className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1"
               >
                 {/* Background Image with Zoom Effect */}
                 <div className="absolute inset-0 z-0">
                   <img 
                     src={ex.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"} 
                     alt={ex.name}
                     className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                 </div>

                 {/* Top Action Row */}
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

                 {/* Bottom Content (Glassmorphism) */}
                 <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                   <div className="space-y-2">
                     <h3 className="text-2xl font-black text-white leading-none tracking-tight transition-colors group-hover:text-blue-400">
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

                 {/* "View Details" Hover Overlay */}
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