import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkoutLibrary } from "@/hooks/useWorkoutLibrary";
import { Search, Plus, Save, X, Dumbbell, Info, Eye } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Ensure you have this shadcn component

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs", "Cardio"];

export default function CreateRoutine() {
  const navigate = useNavigate();
  const [routineName, setRoutineName] = useState("");
  const { exercises, query, setQuery, category, setCategory, loading } = useWorkoutLibrary();
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  
  // State for Preview Drawer
  const [previewExercise, setPreviewExercise] = useState<any | null>(null);

  const toggleExercise = (ex: any) => {
    setSelectedExercises(prev => 
      prev.find(item => item._id === ex._id) 
        ? prev.filter(item => item._id !== ex._id) 
        : [...prev, ex]
    );
  };

  const saveRoutine = async () => {
    if (!routineName) return toast.error("Please name your routine");
    if (selectedExercises.length === 0) return toast.error("Add at least one exercise");

    try {
      await api.post('/workouts/routines', {
        name: routineName,
        exercises: selectedExercises.map(ex => ex._id)
      });
      toast.success("Routine saved to library!");
      navigate('/workout');
    } catch {
      toast.error("Failed to save routine");
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <input 
            placeholder="New Routine..." 
            className="bg-transparent text-3xl font-black focus:outline-none placeholder:text-gray-200"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
          />
          <Button onClick={saveRoutine} className="bg-black text-white rounded-full px-6">
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
          
          {/* Exercise Library */}
          <div className="flex-1 flex flex-col glass-card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
               <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  className="pl-10 bg-gray-50 border-none rounded-xl" 
                  placeholder="Search..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                      category === cat ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="py-4 space-y-2">
                {exercises.map(ex => {
                  const isSelected = selectedExercises.some(s => s._id === ex._id);
                  return (
                    <div 
                      key={ex._id}
                      className={`group p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        isSelected ? "bg-black text-white border-black" : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1" onClick={() => toggleExercise(ex)}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-white/10" : "bg-gray-50"}`}>
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{ex.name}</p>
                          <p className={`text-[10px] uppercase font-bold ${isSelected ? "text-white/40" : "text-gray-400"}`}>{ex.bodyPart}</p>
                        </div>
                      </div>
                      
                      {/* PREVIEW BUTTON */}
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 hover:bg-black/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewExercise(ex);
                          }}
                        >
                          <Eye className={`w-4 h-4 ${isSelected ? "text-white/60" : "text-gray-400"}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleExercise(ex)}
                          className={`rounded-full h-8 w-8 ${isSelected ? "text-white" : "text-black"}`}
                        >
                          {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Routine Sidebar */}
          <div className="w-full md:w-80 flex flex-col bg-gray-50 rounded-3xl overflow-hidden border border-dashed border-gray-200">
            <div className="p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Routine</h3>
            </div>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2 pb-4">
                {selectedExercises.map((ex) => (
                  <div key={ex._id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                    <p className="font-bold text-xs truncate w-40">{ex.name}</p>
                    <button onClick={() => toggleExercise(ex)}><X className="w-3 h-3 text-gray-300" /></button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* QUICK PREVIEW DRAWER */}
      <Sheet open={!!previewExercise} onOpenChange={() => setPreviewExercise(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden rounded-l-[2rem] border-none bg-white">
          {previewExercise && (
            <div className="h-full flex flex-col">
              <div className="h-64 relative bg-gray-100">
                <img 
                  src={previewExercise.images?.[0] || "/placeholder-exercise.jpg"} 
                  className="w-full h-full object-cover"
                  alt={previewExercise.name}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full text-white"
                  onClick={() => setPreviewExercise(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <Badge className="bg-black text-white px-3 py-1 uppercase text-[10px] tracking-widest">
                    {previewExercise.bodyPart}
                  </Badge>
                  <h2 className="text-3xl font-black capitalize leading-none">{previewExercise.name}</h2>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-tighter">Requires: {previewExercise.equipment || "Bodyweight"}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black uppercase text-xs tracking-widest text-gray-400">Instructions</h4>
                  <div className="space-y-3">
                    {previewExercise.instructions?.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4">
                        <span className="font-black text-gray-200 text-xl leading-none">{i + 1}</span>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100">
                <Button 
                  className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest"
                  onClick={() => {
                    toggleExercise(previewExercise);
                    setPreviewExercise(null);
                  }}
                >
                  {selectedExercises.some(s => s._id === previewExercise._id) ? "Remove from Routine" : "Add to Routine"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}