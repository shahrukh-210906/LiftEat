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
    <div className="h-screen sticky top-0 flex flex-col border-r border-black/[0.08] bg-white p-5">
      {/* Logo Area */}
      <div className="mb-12 flex items-center gap-3 px-2 pt-2">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <div><span className="font-black text-xl tracking-tight text-black">LiftEat</span><p className="text-[0.55rem] tracking-[0.2em] text-black/35">TRAIN · FUEL · REPEAT</p></div>
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
                  ? "bg-black text-white"
                  : "text-black/40 hover:bg-black/[0.04] hover:text-black"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Action */}
      <div className="mt-auto pt-5 border-t border-black/[0.08]">
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-black/40 hover:text-black hover:bg-black/[0.04] transition-all duration-300 group"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
