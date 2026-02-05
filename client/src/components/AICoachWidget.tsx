import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface AIWidgetProps {
  page: 'diet' | 'workout' | 'dashboard';
  contextData: any; // e.g., current calories, last lift weight
}

export function AICoachWidget({ page, contextData }: AIWidgetProps) {
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const { data } = await api.post('/chat/tip', { page, contextData });
        setTip(data.tip);
      } catch (err) {
        console.error("AI asleep");
      } finally {
        setLoading(false);
      }
    };
    fetchTip();
  }, [page]); // Re-run if page changes

  if (loading) return <div className="animate-pulse h-10 bg-muted rounded-lg" />;

  return (
    <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-4 rounded-xl flex gap-3 items-start">
      <div className="bg-violet-100 p-2 rounded-lg text-violet-700 mt-1">
        <Sparkles className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-bold text-sm text-violet-900 dark:text-violet-100 mb-1">Coach's Insight</h4>
        <p className="text-sm text-muted-foreground">{tip}</p>
      </div>
    </div>
  );
}