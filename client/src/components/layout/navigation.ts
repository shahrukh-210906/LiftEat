import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  LineChart,
  User,
} from "lucide-react";

export const primaryNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workout", href: "/workout", icon: Dumbbell },
  { name: "Diet", href: "/diet", icon: Utensils },
  { name: "Progress", href: "/progress", icon: LineChart },
  { name: "Profile", href: "/profile", icon: User },
];

// This is the missing function your layout is looking for
export const isNavigationActive = (href: string, currentPath: string) => {
  if (href === "/dashboard") {
    return currentPath === "/dashboard" || currentPath === "/";
  }
  return currentPath.startsWith(href);
};
