import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Exercise } from '@/lib/types';

export function AddExerciseDialog({ open, onOpenChange, onAdd }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  onAdd: (id: string) => Promise<boolean>;
}) {
  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      api.get('/exercises', { params: { query }, signal: controller.signal })
        .then(({ data }) => setExercises(data))
        .catch(() => { if (!controller.signal.aborted) setError('Could not load exercises. Please try again.'); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, query]);
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Add an exercise</DialogTitle><DialogDescription>Search the library to add an exercise to this workout.</DialogDescription></DialogHeader>
      <Input aria-label="Search exercises" placeholder="Search exercises" value={query} onChange={e => setQuery(e.target.value)} />
      {loading ? <p>Loading exercises…</p> : error ? <p role="alert">{error}</p> : exercises.length === 0 ? <p>No exercises found.</p> : exercises.map(exercise =>
        <Button key={exercise._id} variant="outline" disabled={saving} onClick={async () => {
          setSaving(true);
          try { if (await onAdd(exercise._id)) onOpenChange(false); }
          finally { setSaving(false); }
        }}>{exercise.name}</Button>)}
    </DialogContent>
  </Dialog>;
}
