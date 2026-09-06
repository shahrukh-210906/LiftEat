const mongoose = require('mongoose');

const savedMealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  quantity_g: { type: Number, required: true, min: 0.1, max: 10000 },
  calories: { type: Number, required: true, min: 0, max: 20000 },
  protein: { type: Number, default: 0, min: 0, max: 5000 },
  carbs: { type: Number, default: 0, min: 0, max: 5000 },
  fat: { type: Number, default: 0, min: 0, max: 5000 },
  items: [{ name: String, quantity_g: Number, calories: Number, protein: Number, carbs: Number, fat: Number, _id: false }],
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

savedMealSchema.index({ user: 1, created_at: -1 });
module.exports = mongoose.model('SavedMeal', savedMealSchema);
