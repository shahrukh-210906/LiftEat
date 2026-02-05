import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Dumbbell, Utensils, MessageSquare, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Dumbbell, label: "Workout", path: "/workout" },
    { icon: Utensils, label: "Diet", path: "/diet" },
    { icon: MessageSquare, label: "AI Coach", path: "/ai-chat" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    /* Floating Sidebar Logic:
      - h-[calc(100vh-5rem)]: Makes it slightly shorter than screen height
      - top-10: Pushes it down from the top edge
      - ml-6: Pushes it away from the left edge
    */
    <div className="h-[calc(100vh-5rem)] sticky top-10 ml-6 flex flex-col glass-card p-6">
      {/* Logo Area */}
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-black/20">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-black">GymFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive
                  ? "bg-black text-white shadow-xl shadow-black/10 translate-x-2"
                  : "text-gray-400 hover:bg-white/60 hover:text-black hover:translate-x-1"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Action */}
      <div className="mt-auto pt-6 border-t border-gray-100/50">
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300 group"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}