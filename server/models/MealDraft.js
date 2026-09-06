const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  items: [{ name: String, quantity_g: Number, calories: Number, protein: Number, carbs: Number, fat: Number, _id: false }],
  assumptions: [String],
  source: { type: String, enum: ['text', 'photo'], default: 'text' },
  savedLog: { type: mongoose.Schema.Types.ObjectId, ref: 'DietLog' },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });
module.exports = mongoose.model('MealDraft', schema);
