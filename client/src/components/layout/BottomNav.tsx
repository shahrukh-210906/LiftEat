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
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg shadow-gray-200/50 rounded-full px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                isActive 
                  ? "text-white bg-gray-900 shadow-md scale-105" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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