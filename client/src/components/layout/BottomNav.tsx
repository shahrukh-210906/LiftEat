import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Dumbbell, Utensils, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
    { icon: Dumbbell, label: "Workout", path: "/workout" },
    { icon: Utensils, label: "Diet", path: "/diet" },
    { icon: MessageSquare, label: "Coach", path: "/ai-chat" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex items-center gap-1 bg-[#11151d]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/25 rounded-full px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                isActive 
                  ? "text-[#11151d] bg-[#c6ff40] shadow-md scale-105"
                  : "text-white/45 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
