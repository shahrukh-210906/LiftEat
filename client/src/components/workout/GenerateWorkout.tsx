import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
type Draft = { _id: string; name: string; ai: { rationale: string }; exercises: { exercise: { _id: string; name: string }; sets: number; reps: number; rest_seconds: number }[] };
export function GenerateWorkout({ onSaved }: { onSaved: () => void }) {
  const [focus, setFocus] = useState('full body');
  const [minutes, setMinutes] = useState(45);
  const [equipment, setEquipment] = useState(['body weight', 'dumbbell']);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generate = async () => {
    setBusy(true); setError(''); setDraft(null);
    try { const { data } = await api.post<Draft>('/workouts/ai/generate', { focus, duration_minutes: minutes, equipment }); setDraft(data); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not generate a workout. Please try again.'); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!draft) return;
    setBusy(true); setError('');
    try { await api.post(`/workouts/ai/${draft._id}/save`); setDraft(null); onSaved(); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not save your workout. Please retry.'); }
    finally { setBusy(false); }
  };
  return <section className="p-6 rounded-3xl border bg-white space-y-4">
    <h2 className="text-xl font-bold">Build a workout with AI</h2>
    <p className="text-sm text-gray-500">Uses your goals and recent lifts. Review the plan before saving it to your routines.</p>
    <fieldset disabled={busy} className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <label className="space-y-1">Focus<select aria-label="Workout focus" className="block border rounded-lg p-2" value={focus} onChange={e => setFocus(e.target.value)}>{['full body', 'chest', 'back', 'legs', 'shoulders', 'arms', 'abs'].map(f => <option key={f}>{f}</option>)}</select></label>
        <label className="space-y-1">Minutes<input aria-label="Workout minutes" className="block border rounded-lg p-2 w-24" type="number" min={15} max={90} value={minutes} onChange={e => setMinutes(Number(e.target.value))} /></label>
      </div>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Available equipment">{['body weight', 'dumbbell', 'barbell', 'cable', 'machine', 'kettlebells', 'bands'].map(item => <label key={item} className="flex gap-2 items-center"><input type="checkbox" checked={equipment.includes(item)} onChange={e => setEquipment(old => e.target.checked ? [...old, item] : old.filter(x => x !== item))} />{item}</label>)}</div>
      <Button onClick={generate} disabled={busy || !equipment.length || !Number.isInteger(minutes) || minutes < 15 || minutes > 90}>{busy ? 'Working…' : 'Generate workout'}</Button>
    </fieldset>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {draft && <div className="space-y-3" aria-live="polite">
      <h3 className="font-bold text-lg">{draft.name}</h3><p>{draft.ai.rationale}</p>
      <ol className="space-y-2">{draft.exercises.map(item => <li key={item.exercise._id} className="p-3 bg-gray-50 rounded-xl"><strong>{item.exercise.name}</strong><div className="text-sm">{item.sets} sets × {item.reps} reps · Rest {item.rest_seconds}s</div></li>)}</ol>
      <Button disabled={busy} onClick={save}>Save to my routines</Button>
    </div>}
  </section>;
}
