import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foods: FoodItem[];
  onAdd: (food: FoodItem, qty: number, meal: string) => Promise<boolean>;
}

export function AddFoodDialog({ open, onOpenChange, foods, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState("100");

  const handleAdd = async () => {
    if (!selected) return;
    const success = await onAdd(selected, parseFloat(qty), "");
    if (success) {
      setSelected(null);
      setSearch("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Log Food</DialogTitle></DialogHeader>
        {!selected ? (
          <div className="space-y-2">
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            {foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(food => (
              <div key={food.id} onClick={() => setSelected(food)} className="p-2 cursor-pointer hover:bg-white/5 rounded">
                {food.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold">{selected.name}</h3>
            <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Grams" />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>Back</Button>
              <Button onClick={handleAdd}>Add Log</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}