import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Frown, Meh, Zap, MessageCircle } from "lucide-react";

interface Rating {
  _id: string;
  user: {
    _id: string;
    full_name: string;
  };
  value: 'INJURED' | 'NO_FEEL' | 'MODERATE' | 'EFFECTIVE';
  comment?: string; // Add optional comment
  date: string;
}

interface Props {
  ratings: Rating[];
}

const ICONS = {
  INJURED: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", label: "Injured" },
  NO_FEEL: { icon: Frown, color: "text-gray-400", bg: "bg-gray-50", label: "No Feel" },
  MODERATE: { icon: Meh, color: "text-yellow-500", bg: "bg-yellow-50", label: "Moderate" },
  EFFECTIVE: { icon: Zap, color: "text-green-500", bg: "bg-green-50", label: "Effective" },
};

export function RatingsList({ ratings }: Props) {
  const sortedRatings = [...(ratings || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="glass-card p-6 h-full flex flex-col">
       <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-4">
        Community History
      </h3>
      
      <ScrollArea className="flex-1 pr-4 -mr-4">
        {sortedRatings.length === 0 ? (
          <div className="text-center text-gray-400 py-10 italic text-sm">
            No ratings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRatings.map((rating) => {
              const config = ICONS[rating.value] || ICONS.NO_FEEL;
              const Icon = config.icon;
              const initial = rating.user?.full_name?.[0] || "?";

              return (
                <div key={rating._id} className="p-3 rounded-xl bg-white/40 border border-white/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-gray-100">
                        <AvatarFallback className="bg-black text-white text-[10px]">{initial}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{rating.user?.full_name || "User"}</p>
                        <p className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(rating.date))} ago</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bg}`}>
                      <Icon className={`w-3 h-3 ${config.color}`} />
                      <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
                    </div>
                  </div>

                  {/* Comment Display */}
                  {rating.comment && (
                    <div className="text-xs text-gray-600 bg-white/50 p-2 rounded-lg border border-white/20 flex gap-2">
                       <MessageCircle className="w-3 h-3 text-gray-300 flex-shrink-0 mt-0.5" />
                       <span className="italic">"{rating.comment}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}