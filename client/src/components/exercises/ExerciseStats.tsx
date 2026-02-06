import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";

interface StatsProps {
  stats?: {
    counts: {
      INJURED: number;
      NO_FEEL: number;
      MODERATE: number;
      EFFECTIVE: number;
    };
    total: number;
  };
}

const CATEGORIES = [
  { key: 'EFFECTIVE', label: 'Effective', color: '#000000' },
  { key: 'MODERATE', label: 'Moderate', color: '#9CA3AF' },
  { key: 'NO_FEEL', label: 'No Feel', color: '#E5E7EB' },
  { key: 'INJURED', label: 'Injured', color: '#EF4444' },
];

export function ExerciseStats({ stats }: StatsProps) {
  const total = stats?.total || 0;
  
  if (total === 0) {
    return (
      <div className="py-4 text-sm text-gray-400 italic">
        No ratings yet. Be the first!
      </div>
    );
  }

  // Transform data for the chart
  const data = CATEGORIES.map(cat => ({
    name: cat.label,
    // @ts-ignore
    value: stats?.counts?.[cat.key] || 0,
    color: cat.color
  }));

  return (
    <div className="w-full py-6 space-y-4">
      <div className="flex items-baseline justify-between px-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Community Feedback</h3>
        <span className="text-xs font-bold text-black">{total} Votes</span>
      </div>

      {/* Modern Canvas-based Chart Container */}
      <div className="bg-white/50 rounded-3xl p-4 border border-gray-100 shadow-sm">
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
              />
              <YAxis hide domain={[0, 'dataMax + 1']} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold">
                        {payload[0].value} votes
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}