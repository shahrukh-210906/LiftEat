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
    <div className="hover-card p-5 flex items-start justify-between group">
      <div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-3xl font-black text-black tracking-tight">{value}</h3>
          {trend === "up" && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      
      <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300 shadow-sm">
        {icon}
      </div>
    </div>
  );
}