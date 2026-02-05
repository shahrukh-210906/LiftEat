import { useState, useEffect } from "react";
import { StickyNote, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

interface Props {
  exerciseId: string;
}

export function ExerciseNote({ exerciseId }: Props) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch existing note on mount
    api.get(`/exercises/${exerciseId}/note`)
      .then(res => setNote(res.data.text))
      .catch(() => {});
  }, [exerciseId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/exercises/note', { exerciseId, text: note });
      setLastSaved(new Date());
      toast.success("Note saved");
    } catch (e) {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 bg-yellow-50/30 border-yellow-100/50 relative overflow-hidden group">
      {/* Decorative Icon */}
      <StickyNote className="absolute -right-4 -top-4 w-24 h-24 text-yellow-100/50 -rotate-12 pointer-events-none" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-yellow-600" /> My Personal Note
          </h3>
          {lastSaved && (
             <span className="text-[10px] text-gray-400 font-medium">
               Saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          )}
        </div>

        <div className="relative">
          <Textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Use 20kg dumbbells, keep back straight..."
            className="bg-white/60 border-yellow-200/50 focus:border-yellow-400 focus:ring-yellow-400/20 min-h-[100px] resize-none text-gray-700 placeholder:text-gray-400"
          />
          <div className="absolute bottom-2 right-2">
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={saving}
              className="h-7 px-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold rounded-lg shadow-sm"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}