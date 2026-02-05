import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Settings, LogOut, Save, Loader2, Camera, Upload, ScanEye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import api from "@/lib/api";

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Vision AI State
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(profile?.ai_analysis || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    weight_kg: profile?.weight_kg?.toString() || "",
    height_cm: profile?.height_cm?.toString() || "",
    daily_calorie_goal: profile?.daily_calorie_goal?.toString() || "2000",
    daily_protein_goal: profile?.daily_protein_goal?.toString() || "150",
    daily_carbs_goal: profile?.daily_carbs_goal?.toString() || "200",
    daily_fat_goal: profile?.daily_fat_goal?.toString() || "65",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        weight_kg: parseFloat(formData.weight_kg) || null,
        height_cm: parseFloat(formData.height_cm) || null,
        daily_calorie_goal: parseInt(formData.daily_calorie_goal) || 2000,
        daily_protein_goal: parseInt(formData.daily_protein_goal) || 150,
        daily_carbs_goal: parseInt(formData.daily_carbs_goal) || 200,
        daily_fat_goal: parseInt(formData.daily_fat_goal) || 65,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile updated!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Vision AI Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      toast.info("AI is analyzing your physique... (Uses GPU)");
      const { data } = await api.post('/vision/analyze-body', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiAnalysis(data);
      toast.success("Analysis Complete!");
      
      // Optionally save this analysis to the profile context if needed immediately
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze. Ensure Llama 3.2 Vision is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        {/* Header */}
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* User Info */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {profile?.full_name || "Athlete"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* --- AI VISION SCANNER --- */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ScanEye className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-indigo-400" />
              AI Body Scan
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Upload a photo. Llama 3.2 Vision will analyze your physique (Ecto/Meso/Endo) and suggest a plan.
            </p>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />

            {!aiAnalysis ? (
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Pixels...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Physique Photo
                  </>
                )}
              </Button>
            ) : (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-indigo-300 uppercase tracking-wider">Body Type</span>
                    <p className="text-xl font-bold">{aiAnalysis.body_type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-300 uppercase tracking-wider">Est. Body Fat</span>
                    <p className="text-xl font-bold">{aiAnalysis.est_body_fat}</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <span className="text-xs text-indigo-300 uppercase tracking-wider">Coach Suggestion</span>
                  <p className="text-sm mt-1 text-gray-200">{aiAnalysis.suggestion}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAiAnalysis(null)}
                  className="w-full mt-3 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  Scan Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="glass-card p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Personal Info
          </h3>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                value={formData.weight_kg}
                onChange={(e) =>
                  setFormData({ ...formData, weight_kg: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                value={formData.height_cm}
                onChange={(e) =>
                  setFormData({ ...formData, height_cm: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="glass-card p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Nutrition Goals
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Calories</Label>
              <Input
                value={formData.daily_calorie_goal}
                onChange={(e) =>
                  setFormData({ ...formData, daily_calorie_goal: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input
                value={formData.daily_protein_goal}
                onChange={(e) =>
                  setFormData({ ...formData, daily_protein_goal: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input
                value={formData.daily_carbs_goal}
                onChange={(e) =>
                  setFormData({ ...formData, daily_carbs_goal: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input
                value={formData.daily_fat_goal}
                onChange={(e) =>
                  setFormData({ ...formData, daily_fat_goal: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full btn-primary-gradient"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
}