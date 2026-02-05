import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export function useAuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { email: "", password: "", fullName: "" };
    let isValid = true;

    try {
      emailSchema.parse(formData.email);
    } catch (e: any) {
      newErrors.email = e.errors[0].message;
      isValid = false;
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (e: any) {
      newErrors.password = e.errors[0].message;
      isValid = false;
    }

    if (isSignUp && !formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
        );
        if (error) toast.error(error.message);
        else {
          toast.success("Account created!");
          navigate("/onboarding");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) toast.error(error.message);
        else {
          toast.success("Welcome back!");
          navigate("/dashboard");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    isSignUp,
    setIsSignUp,
    loading,
    formData,
    setFormData,
    errors,
    handleSubmit,
  };
}
