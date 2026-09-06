import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div className="app-card p-5 flex items-start justify-between group transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(17,21,29,0.1)]">
      <div>
        <p className="eyebrow">{title}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-3xl font-black text-foreground tracking-tight">{value}</h3>
          {trend === "up" && <span className="w-2 h-2 rounded-full bg-black ring-4 ring-black/10 animate-pulse" />}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      
      <div className="p-3 rounded-xl bg-secondary text-foreground/55 group-hover:bg-black group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
    </div>
  );
}
