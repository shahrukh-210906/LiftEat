import { Dumbbell, Utensils, Bot, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
            className="group relative rounded-xl border border-black/[0.08] bg-white p-4 flex items-center gap-4 overflow-hidden transition-all hover:bg-black/[0.03] hover:border-black/20"
          >
            {/* Minimal Icon Container */}
            <div className="w-12 h-12 rounded-2xl bg-foreground text-white flex items-center justify-center shadow-lg shadow-black/15 transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3">
              <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 z-10">
              <h3 className="font-black text-foreground transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-foreground/45 font-medium group-hover:text-foreground/65 transition-colors">
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
