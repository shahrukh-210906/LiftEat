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
    <div className="h-[calc(100vh-3rem)] sticky top-6 ml-6 flex flex-col rounded-[2rem] bg-[#11151d] p-5 text-white shadow-[0_24px_70px_rgba(17,21,29,0.22)]">
      {/* Logo Area */}
      <div className="mb-10 flex items-center gap-3 px-2 pt-2">
        <div className="w-11 h-11 rounded-2xl bg-[#c6ff40] flex items-center justify-center shadow-lg shadow-[#c6ff40]/15 -rotate-3">
          <Dumbbell className="w-5 h-5 text-[#11151d]" />
        </div>
        <div><span className="font-black text-xl tracking-tight">LiftEat</span><p className="text-[0.55rem] tracking-[0.2em] text-white/40">TRAIN · FUEL · REPEAT</p></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive
                  ? "bg-[#c6ff40] text-[#11151d] shadow-xl shadow-[#c6ff40]/10"
                  : "text-white/50 hover:bg-white/[0.07] hover:text-white hover:translate-x-1"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Action */}
      <div className="mt-auto pt-5 border-t border-white/10">
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.07] transition-all duration-300 group"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
