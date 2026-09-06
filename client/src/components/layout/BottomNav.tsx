import { useLocation, Link } from "react-router-dom";
import { MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNavigation, isNavigationActive } from './navigation';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    ...primaryNavigation,
    { icon: MessageSquare, label: "Coach", path: "/ai-chat" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xl border border-black/10 shadow-xl shadow-black/10 rounded-2xl px-2 py-2">
        {navItems.map((item) => {
          const isActive = isNavigationActive(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "relative flex flex-col gap-1 items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
                isActive 
                  ? "text-white bg-black shadow-md"
                  : "text-black/35 hover:text-black hover:bg-black/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
