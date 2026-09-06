import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
type Item = { name: string; quantity_g: number; calories: number; protein: number; carbs: number; fat: number };
type Draft = { id: string; items: Item[]; assumptions: string[] };
const nutrients = ['calories', 'protein', 'carbs', 'fat'] as const;
export function MealTextLogger({ onSaved }: { onSaved: () => void }) {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [meal, setMeal] = useState('lunch');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const estimate = async () => {
    setBusy(true); setError(''); setSaved(false); setDraft(null);
    try { const { data } = await api.post<Draft>('/diet/estimate', { text }); setDraft(data); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not estimate your meal. Try again.'); }
    finally { setBusy(false); }
  };
  const edit = (index: number, key: keyof Item, value: string) => {
    setDraft(old => old && ({ ...old, items: old.items.map((item, i) => {
      if (i !== index) return item;
      if (key === 'name') return { ...item, name: value };
      const n = Number(value);
      if (key === 'quantity_g' && item.quantity_g > 0) return { ...item, quantity_g: n, ...Object.fromEntries(nutrients.map(k => [k, Math.round(item[k] * n / item.quantity_g * 10) / 10])) };
      return { ...item, [key]: n };
    }) }));
  };
  const save = async () => {
    if (!draft) return;
    setBusy(true); setError('');
    try { await api.post(`/diet/estimate/${draft.id}/save`, { items: draft.items, meal_type: meal }); setDraft(null); setText(''); setSaved(true); onSaved(); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not save. Retry to avoid creating a duplicate estimate.'); }
    finally { setBusy(false); }
  };
  return <section className="rounded-3xl border border-violet-100 bg-violet-50/50 p-5 space-y-4">
    <h2 className="font-bold text-xl">Describe your meal</h2>
    <p className="text-sm text-gray-600">Gemini estimates portions and macros from your description. Review and adjust before logging.</p>
    <textarea aria-label="Meal description" maxLength={2000} rows={3} disabled={busy} value={text} onChange={e => { setText(e.target.value); setDraft(null); setSaved(false); }} placeholder="Two boiled eggs, 150 g cooked rice and a banana" className="w-full rounded-xl border p-3" />
    <Button disabled={busy || !text.trim()} onClick={estimate}>{busy ? 'Working…' : 'Estimate meal'}</Button>
    {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
    {saved && <p role="status" className="text-green-700">Meal added to today’s log.</p>}
    {draft && <fieldset disabled={busy} className="space-y-4">
      <legend className="font-bold mb-2">Review estimated nutrition</legend>
      <ul className="list-disc pl-5 text-sm text-gray-600">{draft.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
      <p className="text-xs text-gray-500">Values are totals for each portion. Changing grams scales its macros; you can also edit each value.</p>
      {draft.items.map((item, index) => <div key={index} className="bg-white rounded-xl p-3 space-y-3">
        <label className="block text-xs">Food<input aria-label={`Food ${index + 1}`} value={item.name} onChange={e => edit(index, 'name', e.target.value)} className="block border rounded p-2 w-full" /></label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{(['quantity_g', ...nutrients] as const).map(key => <label key={key} className="text-xs">{key === 'quantity_g' ? 'Portion (g)' : key === 'calories' ? 'Calories (kcal)' : `${key} (g)`}<input aria-label={`${key} ${index + 1}`} type="number" min="0" step="0.1" value={item[key]} onChange={e => edit(index, key, e.target.value)} className="block border rounded p-2 w-full" /></label>)}</div>
        <button type="button" className="text-xs text-red-600" onClick={() => setDraft(d => d && ({ ...d, items: d.items.filter((_, i) => i !== index) }))}>Remove food {index + 1}</button>
      </div>)}
      <label className="block text-sm">Meal type<select aria-label="Meal type" value={meal} onChange={e => setMeal(e.target.value)} className="block p-2 border rounded-lg">{['breakfast', 'lunch', 'dinner', 'snack'].map(m => <option key={m}>{m}</option>)}</select></label>
      <Button disabled={busy || !draft.items.length || draft.items.some(i => !i.name.trim() || i.quantity_g <= 0 || nutrients.some(k => !Number.isFinite(i[k]) || i[k] < 0))} onClick={save}>Confirm and log meal</Button>
    </fieldset>}
  </section>;
}
