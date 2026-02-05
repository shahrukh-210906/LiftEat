import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Play, ArrowUpRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs", "Cardio"];

export default function Workout() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  
  // State to track favorite exercise IDs
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetch = async () => {
       const params = new URLSearchParams();
       if (query) params.append("query", query);
       if (category !== "All") params.append("bodyPart", category.toLowerCase());
       try { 
         const { data } = await api.get(`/exercises?${params.toString()}`); 
         setExercises(data); 
       } catch {}
    };
    fetch();
  }, [query, category]);

  // Handle Favorite Toggle
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents opening the details page
    
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
    
    // TODO: Add API call here to persist to backend
    // api.post(`/users/favorites/${id}`);
  };

  return (
    <AppLayout>
       <div className="space-y-8 animate-in fade-in duration-700">
         
         {/* Minimal Hero Section */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-2">
             <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">
               Library
             </h1>
             <p className="text-gray-400 font-medium max-w-sm">
               Explore the collection. Build your perfect routine.
             </p>
           </div>
           
           <Button className="btn-primary-gradient px-8 h-12 text-sm font-bold uppercase tracking-widest">
             <Play className="w-4 h-4 mr-2 fill-current" /> Quick Start
           </Button>
         </div>

         {/* Floating Filter Bar */}
         <div className="sticky top-6 z-30 glass-card p-2 flex flex-col md:flex-row gap-2 items-center shadow-xl shadow-black/5">
            <div className="relative flex-1 w-full min-w-0">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <Input 
                 className="pl-12 h-14 border-0 bg-transparent focus-visible:ring-0 placeholder:text-gray-400 text-lg font-medium w-full" 
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

         {/* GRID LAYOUT */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
           {exercises.map((ex) => {
             const isFav = favorites.has(ex._id);
             
             return (
               <div 
                 key={ex._id} 
                 onClick={() => navigate(`/exercises/${ex._id}`)}
                 className="hover-card group relative p-6 flex flex-col justify-between h-48 border border-white/60 cursor-pointer overflow-visible"
               >
                  {/* Top Row: Badge & Fav Button */}
                  <div className="flex justify-between items-start z-20">
                    {/* Popping Category Badge */}
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-500 border-0 px-2 py-1 uppercase text-[10px] tracking-widest transition-all duration-300 group-hover:scale-110 group-hover:bg-black group-hover:text-white group-hover:shadow-lg group-hover:shadow-black/20"
                    >
                      {ex.bodyPart}
                    </Badge>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(e, ex._id)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90",
                        isFav 
                          ? "bg-red-50 text-red-500 shadow-md shadow-red-100" 
                          : "bg-white/50 text-gray-300 hover:bg-white hover:text-red-400 hover:shadow-md"
                      )}
                    >
                      <Heart className={cn("w-4 h-4 transition-all", isFav && "fill-current")} />
                    </button>
                  </div>

                  {/* Middle: Content */}
                  <div className="space-y-1 z-10 relative">
                    <h3 className="text-xl font-bold text-black leading-tight transition-transform duration-300 group-hover:translate-x-1">
                      {ex.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wide group-hover:text-gray-600 transition-colors">
                      <Dumbbell className="w-3 h-3" />
                      {ex.equipment || "Bodyweight"}
                    </div>
                  </div>

                  {/* Action Arrow (Appears on Hover) */}
                  <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-lg shadow-black/20">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Background Decor */}
                  <Dumbbell className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50/50 -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none" />
               </div>
             );
           })}
         </div>

       </div>
    </AppLayout>
  );
}