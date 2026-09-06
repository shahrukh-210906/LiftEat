const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DietLog = require('../models/DietLog');
const FoodItem = require('../models/FoodItem');
const SavedMeal = require('../models/SavedMeal');
const mealText = require('../controllers/mealTextController');
const mealPhoto = require('../controllers/mealPhotoController');
router.post('/estimate', auth, mealText.parse);
router.post('/estimate/:id/save', auth, mealText.save);
router.post('/photo/estimate', auth, mealPhoto.upload, mealPhoto.parse);

const copyNutrition = source => ({
  food_name: source.food_name || source.name,
  quantity_g: source.quantity_g,
  calories: source.calories,
  protein: source.protein || 0,
  carbs: source.carbs || 0,
  fat: source.fat || 0,
  items: source.items || [],
});

router.get('/recent', auth, async (req, res) => {
  const logs = await DietLog.find({ user: req.user.id }).sort({ logged_at: -1 }).limit(20).lean();
  const seen = new Set();
  res.json(logs.filter(log => {
    const key = `${log.food_name}|${log.quantity_g}|${log.calories}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8));
});

router.post('/recent/:id/repeat', auth, async (req, res) => {
  const source = await DietLog.findOne({ _id: req.params.id, user: req.user.id });
  if (!source) return res.status(404).json({ error: 'Meal not found' });
  const mealType = req.body.meal_type || source.meal_type;
  if (mealType && !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) return res.status(400).json({ error: 'Choose a valid meal type' });
  res.status(201).json(await DietLog.create({ user: req.user.id, ...copyNutrition(source), meal_type: mealType, source: 'manual' }));
});

router.get('/favorites', auth, async (req, res) => res.json(await SavedMeal.find({ user: req.user.id }).sort({ created_at: -1 })));
router.post('/favorites/from-log/:id', auth, async (req, res) => {
  const source = await DietLog.findOne({ _id: req.params.id, user: req.user.id });
  if (!source) return res.status(404).json({ error: 'Meal not found' });
  res.status(201).json(await SavedMeal.create({ user: req.user.id, name: source.food_name, ...copyNutrition(source) }));
});
router.delete('/favorites/:id', auth, async (req, res) => {
  const deleted = await SavedMeal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!deleted) return res.status(404).json({ error: 'Saved meal not found' });
  res.json({ success: true });
});
router.post('/favorites/:id/log', auth, async (req, res) => {
  const source = await SavedMeal.findOne({ _id: req.params.id, user: req.user.id });
  if (!source) return res.status(404).json({ error: 'Saved meal not found' });
  const mealType = req.body.meal_type || null;
  if (mealType && !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) return res.status(400).json({ error: 'Choose a valid meal type' });
  res.status(201).json(await DietLog.create({ user: req.user.id, ...copyNutrition(source), meal_type: mealType, source: 'manual' }));
});

// Get today's logs
router.get('/today', auth, async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const logs = await DietLog.find({ 
    user: req.user.id,
    logged_at: { $gte: startOfDay }
  }).sort({ logged_at: -1 });
  
  res.json(logs);
});

// Log food
router.post('/log', auth, async (req, res) => {
  const { food_name, quantity_g, calories, protein = 0, carbs = 0, fat = 0, meal_type } = req.body;
  if (typeof food_name !== 'string' || !food_name.trim() || !Number.isFinite(quantity_g) || quantity_g <= 0 || [calories, protein, carbs, fat].some(value => !Number.isFinite(value) || value < 0)) {
    return res.status(400).json({ error: 'Enter a food name, positive quantity and valid nutrition values' });
  }
  const log = await DietLog.create({ food_name: food_name.trim(), quantity_g, calories, protein, carbs, fat, meal_type, user: req.user.id });
  res.json(log);
});

// Delete log
router.delete('/log/:id', auth, async (req, res) => {
  const deleted = await DietLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!deleted) return res.status(404).json({ error: 'Food log not found' });
  res.json({ success: true });
});

// Get all food items (for search)
router.get('/foods', auth, async (req, res) => {
  // Check if we need to seed initial food data
  let foods = await FoodItem.find().sort({ name: 1 });
  if (foods.length === 0) {
    // Basic seed if empty
    foods = await FoodItem.insertMany([
      { name: "Chicken Breast", calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
      { name: "Rice (White, Cooked)", calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
      { name: "Banana", calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3 },
      { name: "Egg (Large)", calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11 }
    ]);
  }
  res.json(foods);
});

module.exports = router;
