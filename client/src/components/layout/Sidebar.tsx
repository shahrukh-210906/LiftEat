import { Link, useLocation } from "react-router-dom";
import { Dumbbell, MessageSquare, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { primaryNavigation, isNavigationActive } from './navigation';

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  // primaryNavigation uses 'name' and 'href'. We align the extra items to match those properties.
  // Profile is already included in primaryNavigation, so we only need to append AI Coach.
  const navItems = [
    ...primaryNavigation,
    { icon: MessageSquare, name: "AI Coach", href: "/ai-chat" },
  ];

  return (
    /* Floating Sidebar Logic:
      - h-[calc(100vh-5rem)]: Makes it slightly shorter than screen height
      - top-10: Pushes it down from the top edge
      - ml-6: Pushes it away from the left edge
    */
    <div className="flex h-full flex-col overflow-y-auto border-r border-black/[0.08] bg-white p-5">
      {/* Logo Area */}
      <div className="mb-12 flex items-center gap-3 px-2 pt-2">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-black text-xl tracking-tight text-black">LiftEat</span>
          <p className="text-[0.55rem] tracking-[0.2em] text-black/35">TRAIN · FUEL · REPEAT</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          // Pass the arguments in the correct order based on your navigation.ts definition
          const isActive = isNavigationActive(item.href, location.pathname);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive
                  ? "bg-black text-white"
                  : "text-black/40 hover:bg-black/[0.04] hover:text-black"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
              <span className="font-medium">{item.name}</span>
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