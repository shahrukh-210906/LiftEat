import { Dumbbell, Utensils, Bot, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

const actions = [
  { 
    icon: Dumbbell, 
    label: 'Start Workout', 
    path: '/workout',
    subtitle: 'Log a session'
  },
  { 
    icon: Utensils, 
    label: 'Log Meal', 
    path: '/diet',
    subtitle: 'Track macros'
  },
  { 
    icon: Bot, 
    label: 'Ask AI', 
    path: '/ai-chat',
    subtitle: 'Get advice'
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.path}
            to={action.path}
            className="hover-card group relative p-5 flex items-center gap-4 overflow-hidden"
          >
            {/* Minimal Icon Container */}
            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-black/30">
              <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 z-10">
              <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-gray-400 font-medium group-hover:text-gray-500 transition-colors">
                {action.subtitle}
              </p>
            </div>

            {/* Sliding Arrow Effect */}
            <div className="absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
              <ArrowRight className="w-5 h-5 text-black" />
            </div>
            
            {/* Subtle Gradient wash on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Link>
        );
      })}
    </div>
  );
}