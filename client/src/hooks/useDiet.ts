import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DietLog, FoodItem, SavedMeal } from "@/lib/types";

export function useDiet() {
  const { user, profile } = useAuth();
  const [todaysLogs, setTodaysLogs] = useState<DietLog[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [recentMeals, setRecentMeals] = useState<DietLog[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  
  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  const refreshData = async () => {
    try {
      const [logsRes, foodsRes, recentRes, favoritesRes] = await Promise.all([
        api.get("/diet/today"),
        api.get("/diet/foods"),
        api.get('/diet/recent'),
        api.get('/diet/favorites'),
      ]);
      setTodaysLogs(logsRes.data);
      setFoodItems(foodsRes.data);
      setRecentMeals(recentRes.data);
      setSavedMeals(favoritesRes.data);
    } catch { toast.error("Could not load your nutrition data"); }
  };

  const addLog = async (food: FoodItem, qty: number, mealType: string) => {
    const multiplier = qty / 100;
    try {
      await api.post("/diet/log", {
        food_name: food.name,
        quantity_g: qty,
        calories: Math.round((food.calories_per_100g || 0) * multiplier),
        protein: Math.round((food.protein_per_100g || 0) * multiplier * 10) / 10,
        carbs: Math.round((food.carbs_per_100g || 0) * multiplier * 10) / 10,
        fat: Math.round((food.fat_per_100g || 0) * multiplier * 10) / 10,
        meal_type: mealType || null,
      });
      toast.success(`Logged ${food.name}`);
      refreshData();
      return true;
    } catch {
      toast.error("Failed to log food");
      return false;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      await api.delete(`/diet/log/${id}`);
      refreshData();
      toast.success("Entry deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const repeatMeal = async (id: string) => {
    try { await api.post(`/diet/recent/${id}/repeat`, {}); toast.success('Meal logged again'); await refreshData(); return true; }
    catch { toast.error('Could not repeat meal'); return false; }
  };
  const saveMeal = async (id: string) => {
    try { await api.post(`/diet/favorites/from-log/${id}`); toast.success('Meal saved'); await refreshData(); }
    catch { toast.error('Could not save meal'); }
  };
  const logSavedMeal = async (id: string) => {
    try { await api.post(`/diet/favorites/${id}/log`, {}); toast.success('Saved meal logged'); await refreshData(); return true; }
    catch { toast.error('Could not log saved meal'); return false; }
  };
  const removeSavedMeal = async (id: string) => {
    try { await api.delete(`/diet/favorites/${id}`); toast.success('Removed from saved meals'); await refreshData(); }
    catch { toast.error('Could not remove saved meal'); }
  };

  const totals = todaysLogs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    protein: acc.protein + (log.protein || 0),
    carbs: acc.carbs + (log.carbs || 0),
    fat: acc.fat + (log.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return { todaysLogs, foodItems, recentMeals, savedMeals, totals, profile, addLog, deleteLog, repeatMeal, saveMeal, logSavedMeal, removeSavedMeal, refreshData };
}
