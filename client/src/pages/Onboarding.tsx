import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { BodyType, FitnessGoal } from "@/lib/types";

const bodyTypes: { value: BodyType; label: string; description: string }[] = [
  {
    value: "ectomorph",
    label: "Ectomorph",
    description: "Lean, long limbs, fast metabolism",
  },
  {
    value: "mesomorph",
    label: "Mesomorph",
    description: "Athletic, muscular, medium frame",
  },
  {
    value: "endomorph",
    label: "Endomorph",
    description: "Wider build, stores fat easily",
  },
];

const fitnessGoals: { value: FitnessGoal; label: string; icon: string }[] = [
  { value: "lose_weight", label: "Lose Weight", icon: "⚖️" },
  { value: "build_muscle", label: "Build Muscle", icon: "💪" },
  { value: "maintain", label: "Maintain", icon: "🧘" },
  { value: "gain_strength", label: "Gain Strength", icon: "🏋️" },
  { value: "improve_endurance", label: "Improve Endurance", icon: "🏃" },
];

export default function Onboarding() {
  const {
    step,
    loading,
    formData,
    updateField,
    handleNext,
    handleBack,
    handleComplete,
  } = useOnboarding();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-glow fixed inset-0 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-primary"
                  : i < step
                    ? "w-8 bg-primary/50"
                    : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Body Type */}
        {step === 1 && (
          <div className="glass-card p-6 space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold">What's your body type?</h2>
              <p className="text-muted-foreground mt-2">
                This helps us personalize your workouts
              </p>
            </div>

            <RadioGroup
              value={formData.bodyType}
              onValueChange={(value) => updateField("bodyType", value)}
              className="space-y-3"
            >
              {bodyTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.bodyType === type.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={type.value} className="sr-only" />
                  <div className="flex-1">
                    <p className="font-semibold">{type.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  {formData.bodyType === type.value && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </label>
              ))}
            </RadioGroup>

            <Button
              onClick={handleNext}
              className="w-full btn-primary-gradient"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Fitness Goal */}
        {step === 2 && (
          <div className="glass-card p-6 space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold">What's your goal?</h2>
              <p className="text-muted-foreground mt-2">
                We'll tailor your experience accordingly
              </p>
            </div>

            <RadioGroup
              value={formData.fitnessGoal}
              onValueChange={(value) => updateField("fitnessGoal", value)}
              className="grid grid-cols-2 gap-3"
            >
              {fitnessGoals.map((goal) => (
                <label
                  key={goal.value}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.fitnessGoal === goal.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={goal.value} className="sr-only" />
                  <span className="text-2xl mb-2">{goal.icon}</span>
                  <span className="text-sm font-medium text-center">
                    {goal.label}
                  </span>
                </label>
              ))}
            </RadioGroup>

            <div className="flex gap-3">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 btn-primary-gradient"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Measurements */}
        {step === 3 && (
          <div className="glass-card p-6 space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Your Measurements</h2>
              <p className="text-muted-foreground mt-2">
                Help us calculate your nutrition needs
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender (optional)</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 btn-primary-gradient"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
