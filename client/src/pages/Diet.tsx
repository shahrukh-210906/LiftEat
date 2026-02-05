import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Flame } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { FoodItem, DietLog } from "@/lib/types";
import { toast } from "sonner";
import { AICoachWidget } from "@/components/AICoachWidget"; // <-- IMPORT
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Diet() {
  const { user, profile } = useAuth();
  const [todaysLogs, setTodaysLogs] = useState<DietLog[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: logs } = await api.get("/diet/today");
      setTodaysLogs(logs);

      const { data: foods } = await api.get("/foods");
      setFoodItems(foods);
    } catch (error) {
      console.error("Error fetching diet data", error);
    }
  };

  const logFood = async () => {
    if (!selectedFood || !quantity) return;

    const qty = parseFloat(quantity);
    const multiplier = qty / 100;

    const newLog = {
      food_name: selectedFood.name,
      quantity_g: qty,
      calories: Math.round((selectedFood.calories_per_100g || 0) * multiplier),
      protein: Math.round((selectedFood.protein_per_100g || 0) * multiplier * 10) / 10,
      carbs: Math.round((selectedFood.carbs_per_100g || 0) * multiplier * 10) / 10,
      fat: Math.round((selectedFood.fat_per_100g || 0) * multiplier * 10) / 10,
      meal_type: mealType || null,
    };

    try {
      await api.post("/diet/log", newLog);
      toast.success(`Logged ${selectedFood.name}`);
      setShowAddFood(false);
      setSelectedFood(null);
      setQuantity("100");
      setMealType("");
      await fetchData();
    } catch (error) {
      toast.error("Failed to log food");
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      await api.delete(`/diet/log/${logId}`);
      toast.success("Entry deleted");
      await fetchData();
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const todayTotals = todaysLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const filteredFoods = foodItems.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Diet Tracker</h1>
          <Button
            onClick={() => setShowAddFood(true)}
            className="btn-primary-gradient"
          >
            <Plus className="w-4 h-4 mr-2" /> Log Meal
          </Button>
        </div>

        {/* --- AI WIDGET --- */}
        <AICoachWidget 
          page="diet" 
          contextData={{
            caloriesConsumed: todayTotals.calories,
            calorieGoal: profile?.daily_calorie_goal,
            proteinConsumed: todayTotals.protein,
            proteinGoal: profile?.daily_protein_goal
          }} 
        />

        {/* Today's Summary */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Today's Nutrition</h2>
            <div className="flex items-center gap-1 text-primary">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{todayTotals.calories}</span>
              <span className="text-sm text-muted-foreground">
                / {profile?.daily_calorie_goal || 2000} cal
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold">
                {Math.round(todayTotals.protein)}g
              </p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {Math.round(todayTotals.carbs)}g
              </p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {Math.round(todayTotals.fat)}g
              </p>
              <p className="text-xs text-muted-foreground">Fat</p>
            </div>
          </div>

          {/* Today's Logs */}
          <div className="space-y-4">
            {todaysLogs.map((log) => (
              <div key={log.id} className="glass-card p-4 flex justify-between">
                <div>{log.food_name}</div>
                <button onClick={() => deleteLog(log.id)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Food Dialog */}
      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent className="glass-card max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Food</DialogTitle>
          </DialogHeader>
          {!selectedFood ? (
            <div className="space-y-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
              />
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className="p-2 cursor-pointer hover:bg-white/5 rounded"
                >
                  {food.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h3>{selectedFood.name}</h3>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Button onClick={logFood}>Add</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}