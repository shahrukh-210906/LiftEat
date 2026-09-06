import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, LoaderCircle, RotateCcw } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

type Item = { name: string; quantity_g: number; calories: number; protein: number; carbs: number; fat: number };
type Draft = { id: string; items: Item[]; assumptions: string[] };
const nutrients = ['calories', 'protein', 'carbs', 'fat'] as const;

export function MealPhotoLogger({ onSaved }: { onSaved: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [meal, setMeal] = useState('lunch');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!file || typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (selected?: File) => {
    setError(''); setDraft(null); setSaved(false); setPreview('');
    if (!selected) return setFile(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
      setFile(null); setError('Choose a JPEG, PNG or WebP image smaller than 5 MB.'); return;
    }
    setFile(selected);
  };
  const analyze = async () => {
    if (!file) return;
    setBusy(true); setError('');
    const form = new FormData(); form.append('image', file);
    try { const { data } = await api.post<Draft>('/diet/photo/estimate', form); setDraft(data); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not analyze this meal photo.'); }
    finally { setBusy(false); }
  };
  const edit = (index: number, key: keyof Item, value: string) => setDraft(old => old && ({ ...old, items: old.items.map((item, i) => {
    if (i !== index) return item;
    if (key === 'name') return { ...item, name: value };
    const number = Number(value);
    if (key === 'quantity_g' && item.quantity_g > 0) return { ...item, quantity_g: number, ...Object.fromEntries(nutrients.map(nutrient => [nutrient, Math.round(item[nutrient] * number / item.quantity_g * 10) / 10])) };
    return { ...item, [key]: number };
  }) }));
  const save = async () => {
    if (!draft) return;
    setBusy(true); setError('');
    try { await api.post(`/diet/estimate/${draft.id}/save`, { items: draft.items, meal_type: meal }); setDraft(null); setFile(null); setPreview(''); setSaved(true); onSaved(); }
    catch (e: any) { setError(e.response?.data?.error || 'Could not save this meal.'); }
    finally { setBusy(false); }
  };
  const valid = draft?.items.length && draft.items.every(item => item.name.trim() && item.quantity_g > 0 && nutrients.every(key => Number.isFinite(item[key]) && item[key] >= 0));

  return <section className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm md:p-7 space-y-4">
    <div><div className="mb-3 inline-flex rounded-xl bg-black p-2.5 text-white"><Camera className="h-5 w-5" /></div><h2 className="text-2xl font-black tracking-tight">Scan your plate</h2><p className="mt-1 text-sm text-black/55">Take a clear photo. Review every estimate before adding it to your log.</p></div>
    <input ref={input} className="sr-only" aria-label="Meal photo" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={event => choose(event.target.files?.[0])} />
    {!file ? <button type="button" onClick={() => input.current?.click()} className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-black/20 bg-gray-50 text-sm font-bold text-black/55 transition-colors hover:border-black hover:text-black"><ImagePlus className="h-7 w-7" /> Choose or take a photo<span className="text-xs font-normal text-black/35">JPEG, PNG or WebP · up to 5 MB</span></button>
      : <div className="relative overflow-hidden rounded-xl bg-gray-100">{preview ? <img src={preview} alt="Selected meal" className="h-48 w-full object-cover" /> : <div className="flex h-32 items-center justify-center text-sm text-black/45">{file.name}</div>}<button type="button" aria-label="Choose another photo" onClick={() => { choose(); if (input.current) input.current.value = ''; }} className="absolute right-3 top-3 rounded-lg bg-white p-2 text-black shadow"><RotateCcw className="h-4 w-4" /></button></div>}
    {!draft && <Button className="rounded-xl bg-black text-white hover:bg-black/80" disabled={!file || busy} onClick={analyze}>{busy ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</> : 'Analyze photo'}</Button>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {saved && <p role="status" className="text-sm text-green-700">Photo meal added to today’s log.</p>}
    {draft && <fieldset disabled={busy} className="space-y-4"><legend className="mb-2 font-bold">Review detected foods</legend>
      <ul className="list-disc pl-5 text-sm text-black/55">{draft.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul>
      {draft.items.map((item, index) => <div key={index} className="space-y-3 rounded-xl bg-gray-50 p-4">
        <label className="block text-xs">Food<input aria-label={`Photo food ${index + 1}`} value={item.name} onChange={event => edit(index, 'name', event.target.value)} className="mt-1 block w-full rounded-lg border bg-white p-2" /></label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{(['quantity_g', ...nutrients] as const).map(key => <label key={key} className="text-xs">{key === 'quantity_g' ? 'Portion (g)' : key === 'calories' ? 'Calories' : `${key} (g)`}<input aria-label={`Photo ${key} ${index + 1}`} type="number" min="0" step="0.1" value={item[key]} onChange={event => edit(index, key, event.target.value)} className="mt-1 block w-full rounded-lg border bg-white p-2" /></label>)}</div>
        <button type="button" className="text-xs text-red-600" onClick={() => setDraft(old => old && ({ ...old, items: old.items.filter((_, itemIndex) => itemIndex !== index) }))}>Remove food {index + 1}</button>
      </div>)}
      <label className="block text-sm">Meal type<select aria-label="Photo meal type" value={meal} onChange={event => setMeal(event.target.value)} className="mt-1 block rounded-lg border bg-white p-2">{['breakfast', 'lunch', 'dinner', 'snack'].map(value => <option key={value}>{value}</option>)}</select></label>
      <Button className="rounded-xl bg-black text-white" disabled={!valid || busy} onClick={save}>Confirm photo meal</Button>
    </fieldset>}
  </section>;
}
