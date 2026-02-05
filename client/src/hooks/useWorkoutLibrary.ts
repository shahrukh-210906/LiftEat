import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useWorkoutLibrary() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append("query", query);
        if (category !== "All") params.append("bodyPart", category.toLowerCase());
        const { data } = await api.get(`/exercises?${params.toString()}`);
        setExercises(data);
      } finally { setLoading(false); }
    };
    fetch();
  }, [query, category]);

  const startSession = async (name: string) => {
    try {
      const { data } = await api.post('/workouts/start', { name });
      toast.success("Go crush it!");
      navigate(`/workout/${data._id}`);
    } catch { toast.error("Error starting"); }
  };

  return { exercises, query, setQuery, category, setCategory, loading, startSession };
}