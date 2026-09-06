import { useState } from 'react';
import { Bookmark, Camera, ChevronLeft, Clock3, PenLine, Search, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DietLog, SavedMeal } from '@/lib/types';
import { MealPhotoLogger } from './MealPhotoLogger';
import { MealTextLogger } from './MealTextLogger';

type Mode = 'menu' | 'recent' | 'saved' | 'text' | 'photo';
type Props = { open: boolean; onOpenChange: (open: boolean) => void; recent: DietLog[]; saved: SavedMeal[]; onManual: () => void; onRepeat: (id: string) => Promise<boolean>; onLogSaved: (id: string) => Promise<boolean>; onRemoveSaved: (id: string) => void; onSaved: () => void };

export function MealLogDialog({ open, onOpenChange, recent, saved, onManual, onRepeat, onLogSaved, onRemoveSaved, onSaved }: Props) {
  const [mode, setMode] = useState<Mode>('menu');
  const close = () => { onOpenChange(false); setMode('menu'); };
  const closeAfter = () => { onSaved(); close(); };
  const options = [
    { mode: 'recent' as const, icon: Clock3, title: 'Recent meals', text: 'Repeat something you logged before' },
    { mode: 'saved' as const, icon: Bookmark, title: 'Saved meals', text: 'Log one of your regular meals' },
    { mode: 'text' as const, icon: PenLine, title: 'Describe meal', text: 'Estimate food from a short description' },
    { mode: 'photo' as const, icon: Camera, title: 'Scan a plate', text: 'Review an estimate from a photo' },
  ];
  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setMode('menu'); }}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white">
    <DialogHeader><DialogTitle>{mode === 'menu' ? 'Log a meal' : mode === 'recent' ? 'Recent meals' : mode === 'saved' ? 'Saved meals' : mode === 'text' ? 'Describe meal' : 'Scan a plate'}</DialogTitle><DialogDescription>Choose the quickest way to add food.</DialogDescription></DialogHeader>
    {mode !== 'menu' && <button onClick={() => setMode('menu')} className="flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-black"><ChevronLeft className="h-4 w-4" /> Back</button>}
    {mode === 'menu' && <div className="grid gap-3 sm:grid-cols-2">
      <button onClick={onManual} className="flex items-start gap-3 rounded-xl border p-4 text-left hover:border-black"><Search className="mt-0.5 h-5 w-5" /><span><strong className="block">Search foods</strong><small className="text-neutral-500">Choose from the food library</small></span></button>
      {options.map(option => <button key={option.mode} onClick={() => setMode(option.mode)} className="flex items-start gap-3 rounded-xl border p-4 text-left hover:border-black"><option.icon className="mt-0.5 h-5 w-5" /><span><strong className="block">{option.title}</strong><small className="text-neutral-500">{option.text}</small></span></button>)}
    </div>}
    {mode === 'recent' && <MealRows empty="No recent meals yet." rows={recent.map(item => ({ id: item._id, name: item.food_name, detail: `${item.quantity_g}g · ${item.calories} kcal` }))} action="Repeat" onAction={async id => { if (await onRepeat(id)) close(); }} />}
    {mode === 'saved' && <MealRows empty="Save a meal from today’s log to see it here." rows={saved.map(item => ({ id: item._id, name: item.name, detail: `${item.quantity_g}g · ${item.calories} kcal` }))} action="Log" onAction={async id => { if (await onLogSaved(id)) close(); }} onRemove={onRemoveSaved} />}
    {mode === 'text' && <MealTextLogger onSaved={closeAfter} />}
    {mode === 'photo' && <MealPhotoLogger onSaved={closeAfter} />}
  </DialogContent></Dialog>;
}

function MealRows({ rows, empty, action, onAction, onRemove }: { rows: { id: string; name: string; detail: string }[]; empty: string; action: string; onAction: (id: string) => void; onRemove?: (id: string) => void }) {
  if (!rows.length) return <p className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-500">{empty}</p>;
  return <div className="divide-y">{rows.map(row => <div key={row.id} className="flex items-center gap-3 py-4"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{row.name}</p><p className="text-xs text-neutral-500">{row.detail}</p></div><button onClick={() => onAction(row.id)} className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white">{action}</button>{onRemove && <button aria-label={`Remove ${row.name}`} onClick={() => onRemove(row.id)} className="p-2 text-neutral-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</div>)}</div>;
}
