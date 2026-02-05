import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VisionScanner } from "@/components/profile/VisionScanner";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    weight: profile?.weight_kg || "",
    calories: profile?.daily_calorie_goal || 2000,
  });

  const handleSave = async () => {
    const { error } = await updateProfile({
      full_name: form.full_name,
      weight_kg: Number(form.weight),
      daily_calorie_goal: Number(form.calories),
    });
    if (!error) toast.success("Saved!");
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <VisionScanner onScanComplete={() => {}} />

        <div className="glass-card p-4 space-y-4">
          <h3 className="font-semibold">Settings</h3>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Calorie Goal</Label>
              <Input
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full btn-primary-gradient">
            <Save className="mr-2 w-4 h-4" /> Save
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
