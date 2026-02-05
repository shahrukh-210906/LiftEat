import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BodyType, FitnessGoal } from '@/lib/types';

export function useOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bodyType: '' as BodyType | '',
    fitnessGoal: '' as FitnessGoal | '',
    weight: '',
    height: '',
    age: '',
    gender: '',
  });

  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && !formData.bodyType) {
      toast.error('Please select your body type');
      return;
    }
    if (step === 2 && !formData.fitnessGoal) {
      toast.error('Please select your fitness goal');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!formData.weight || !formData.height) {
      toast.error('Please enter your weight and height');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateProfile({
        body_type: formData.bodyType as BodyType,
        fitness_goal: formData.fitnessGoal as FitnessGoal,
        weight_kg: parseFloat(formData.weight),
        height_cm: parseFloat(formData.height),
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        onboarding_complete: true,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Profile set up successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Helper to update specific fields
  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    step,
    loading,
    formData,
    updateField,
    handleNext,
    handleBack,
    handleComplete
  };
}