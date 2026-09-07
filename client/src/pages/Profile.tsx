import { useEffect, useState } from "react";
import { Download, LogOut, Save, ShieldCheck, Trash2, User } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VisionScanner } from "@/components/profile/VisionScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ full_name: "", weight: "", calories: "2000" });

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name || "",
      weight: profile.weight_kg ? String(profile.weight_kg) : "",
      calories: String(profile.daily_calorie_goal || 2000),
    });
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: form.full_name.trim(),
      weight_kg: form.weight ? Number(form.weight) : null,
      daily_calorie_goal: Number(form.calories),
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved.");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/profile/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lifteat-data-export.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Your data export is ready.');
    } catch {
      toast.error('Failed to export data.');
    } finally { setExporting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete your LiftEat account and all of its data? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete('/profile/delete');
      await signOut();
      toast.success('Your account was deleted.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6 pb-24">
        <header className="flex items-end justify-between gap-4 border-b border-black/10 pb-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">Account</p><h1 className="mt-2 text-3xl font-black tracking-tight">Profile</h1></div>
          <Button variant="outline" size="sm" onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
        </header>

        <section className="app-card flex items-center gap-4 p-6">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-black text-white"><User className="h-6 w-6" /></div>
          <div><h2 className="text-lg font-bold">{profile?.full_name || 'Athlete'}</h2><p className="text-sm text-black/45">{user?.email}</p></div>
        </section>

        <section className="app-card space-y-5 p-6">
          <h2 className="text-lg font-bold">Your goals</h2>
          <div className="space-y-2"><Label htmlFor="profile-name">Name</Label><Input id="profile-name" value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="profile-weight">Weight (kg)</Label><Input id="profile-weight" type="number" min="1" max="1000" value={form.weight} onChange={event => setForm({ ...form, weight: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="profile-calories">Daily calories</Label><Input id="profile-calories" type="number" min="1" value={form.calories} onChange={event => setForm({ ...form, calories: event.target.value })} /></div>
          </div>
          <Button onClick={handleSave} disabled={saving || !form.full_name.trim()} className="w-full"><Save className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}</Button>
        </section>

        <VisionScanner onScanComplete={() => undefined} />

        <section className="app-card space-y-3 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="h-5 w-5" /> AI and your data</h2>
          <p className="text-sm leading-6 text-black/55">LiftEat sends relevant profile, workout, and nutrition records to its configured AI services to create personal coaching and estimates. Your name, email, and login credentials are excluded from those requests.</p>
          <p className="text-sm leading-6 text-black/55">Uploaded meal and physique photos are processed in memory and are not saved by LiftEat. The resulting analysis and any meal you confirm are stored with your account.</p>
        </section>

        <section className="app-card space-y-4 border-red-200 p-6">
          <div><h2 className="text-lg font-bold">Your data</h2><p className="mt-1 text-sm text-black/50">Download a copy or permanently remove your account and records.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={handleExport} disabled={exporting}><Download className="mr-2 h-4 w-4" /> {exporting ? 'Preparing…' : 'Export data'}</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}><Trash2 className="mr-2 h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete account'}</Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
