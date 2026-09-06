import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
type Card = { id: string; title: string; body: string; action: string; href: string };
type Snapshot = { computed_at: string | null; cards: Card[]; refreshing: boolean };
export function ProactiveInsights() {
  const { user } = useAuth();
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const [dismissing, setDismissing] = useState<string | null>(null);
  useEffect(() => {
    setData(null); setError('');
    if (!user) return;
    const controller = new AbortController();
    let running = false;
    const fetchInsights = async () => {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      try { const response = await api.get<Snapshot>('/dashboard/insights', { signal: controller.signal }); if (!controller.signal.aborted) { setData(response.data); setError(''); } }
      catch { if (!controller.signal.aborted) setError('Insights could not refresh. We’ll retry automatically.'); }
      finally { running = false; }
    };
    fetchInsights();
    const timer = setInterval(fetchInsights, 60000);
    document.addEventListener('visibilitychange', fetchInsights);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', fetchInsights); };
  }, [user?.id]);
  const dismiss = async (id: string) => {
    setDismissing(id);
    try { await api.post(`/dashboard/insights/${encodeURIComponent(id)}/dismiss`); setData(old => old && ({ ...old, cards: old.cards.filter(c => c.id !== id) })); }
    catch { setError('Could not dismiss this insight. Please retry.'); }
    finally { setDismissing(null); }
  };
  return <section aria-label="Your insights" className="space-y-3">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-bold">Your next steps</h2><span className="text-xs text-gray-500">From your activity logs · no AI credits needed</span></div>
    {error && <p role="status" className="text-sm text-amber-700">{error}</p>}
    {!data && !error && <p className="text-sm text-gray-500">Checking your recent activity…</p>}
    {data && !data.cards.length && <p className="text-sm text-gray-500">{data.refreshing ? 'Preparing your insights…' : 'You’re all caught up. Insights refresh automatically.'}</p>}
    <div className="grid md:grid-cols-3 gap-3">{data?.cards.map(card => <article key={card.id} className="border border-violet-100 rounded-2xl p-4 bg-white/80 space-y-3">
      <div className="flex justify-between gap-2"><h3 className="font-bold">{card.title}</h3><button disabled={!!dismissing} aria-label={`Dismiss ${card.title}`} className="text-gray-400 hover:text-gray-800" onClick={() => dismiss(card.id)}>×</button></div>
      <p className="text-sm text-gray-600">{card.body}</p>
      <Link className="text-sm font-semibold text-violet-700 underline underline-offset-4" to={card.href}>{card.action} →</Link>
    </article>)}</div>
    {data?.computed_at && <p className="text-xs text-gray-400">Updated {new Date(data.computed_at).toLocaleTimeString()} · Checks every 5 minutes. Dismissals reset at midnight UTC.</p>}
  </section>;
}
