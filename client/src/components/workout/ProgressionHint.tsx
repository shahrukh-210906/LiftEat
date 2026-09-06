import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
type Suggestion = { decision: string; weight_kg: number | null; reps: number | null; reason: string; evidence: { completed_at: string; sets: { weight: number; reps: number }[] }[] };
export function ProgressionHint({ exerciseId, onApply }: { exerciseId: string; onApply: (weight: string, reps: string) => void }) {
  const [increment, setIncrement] = useState(2.5);
  const [result, setResult] = useState<Suggestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const check = async () => {
    setBusy(true); setError(''); setResult(null);
    try { const { data } = await api.get(`/workouts/exercises/${exerciseId}/progression`, { params: { increment } }); setResult(data); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not check your progression. Try again.'); }
    finally { setBusy(false); }
  };
  return <div className="bg-violet-50 rounded-xl p-3 space-y-2">
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-xs font-medium">Equipment increment (kg)<input aria-label="Equipment increment in kg" type="number" min="0.25" max="10" step="0.25" value={increment} disabled={busy} onChange={e => { setIncrement(Number(e.target.value)); setResult(null); }} className="block w-24 rounded border p-2" /></label>
      <Button variant="outline" disabled={busy || increment < 0.25 || increment > 10} onClick={check}>{busy ? 'Checking…' : 'Check progression'}</Button>
    </div>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {result && <div aria-live="polite" className="space-y-2 text-sm">
      <p className="font-bold">{result.decision === 'increase' ? 'Ready for a small increase' : result.decision === 'hold' ? 'Keep building consistency' : 'More history needed'}</p>
      <p>{result.reason}</p>
      {result.evidence.map((h, i) => <p key={i} className="text-xs text-gray-500">{new Date(h.completed_at).toLocaleDateString()}: {h.sets.map(s => `${s.weight} kg × ${s.reps}`).join(' · ') || 'No consistent working sets'}</p>)}
      {result.weight_kg !== null && result.reps !== null && <Button variant="outline" onClick={() => onApply(String(result.weight_kg), String(result.reps))}>Use {result.weight_kg} kg × {result.reps} reps</Button>}
      <p className="text-xs text-gray-500">Fills the next set only. Adjust for form, fatigue or discomfort; nothing is logged automatically.</p>
    </div>}
  </div>;
}
