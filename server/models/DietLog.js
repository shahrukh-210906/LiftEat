const mongoose = require('mongoose');

const dietLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food_name: String,
  quantity_g: Number,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  meal_type: String,
  mealDraft: { type: mongoose.Schema.Types.ObjectId, unique: true, sparse: true },
  source: { type: String, enum: ['manual', 'ai_estimate'], default: 'manual' },
  items: [{ name: String, quantity_g: Number, calories: Number, protein: Number, carbs: Number, fat: Number, _id: false }],
  logged_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DietLog', dietLogSchema);
