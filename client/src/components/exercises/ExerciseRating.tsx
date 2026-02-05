import { useState } from "react";
import { Frown, Meh, Smile, Zap, AlertTriangle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this component

interface Props {
  exerciseId: string;
  onRateComplete: () => void;
}

const RATINGS = [
  { value: 'INJURED', label: 'Injured', icon: AlertTriangle, color: 'text-red-500', bg: 'hover:bg-red-50' },
  { value: 'NO_FEEL', label: "Nothing", icon: Frown, color: 'text-gray-400', bg: 'hover:bg-gray-50' },
  { value: 'MODERATE', label: 'Felt it', icon: Meh, color: 'text-yellow-500', bg: 'hover:bg-yellow-50' },
  { value: 'EFFECTIVE', label: 'Effective', icon: Zap, color: 'text-green-500', bg: 'hover:bg-green-50' },
];

export function ExerciseRating({ exerciseId, onRateComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState(""); // State for comment

  const handleRate = async (rating: string) => {
    setLoading(true);
    try {
      await api.post('/exercises/rate', { 
        exerciseId, 
        rating, 
        comment // Send comment with rating
      });
      toast.success("Feedback recorded!");
      setComment(""); // Clear comment
      onRateComplete();
    } catch (e) {
      toast.error("Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs px-1">
        Add Your Rating
      </h3>
      
      {/* Comment Input */}
      <div className="relative">
        <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
        <Textarea 
          placeholder="Optional comment (e.g. 'Great pump but watch form...')"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="pl-9 bg-white/50 border-gray-200 resize-none min-h-[60px] text-sm"
          maxLength={280}
        />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {RATINGS.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRate(r.value)}
            disabled={loading}
            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-gray-100 transition-all ${r.bg} hover:border-gray-300 active:scale-[0.98]`}
          >
            <r.icon className={`w-5 h-5 ${r.color}`} />
            <span className="font-bold text-xs text-gray-700">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}