const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
   ai_analysis: {
    body_type: String,
    est_body_fat: String,
    muscle_mass: String,
    suggestion: String
  },
  full_name: { type: String, trim: true },
  daily_protein_goal: { type: Number, min: 0, default: 150 },
  daily_carbs_goal: { type: Number, min: 0, default: 250 },
  daily_fat_goal: { type: Number, min: 0, default: 65 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body_type: { type: String, enum: ['ectomorph', 'mesomorph', 'endomorph'] },
  fitness_goal: { type: String },
  weight_kg: { type: Number, min: 1, max: 1000 },
  height_cm: { type: Number, min: 1, max: 300 },
  age: { type: Number, min: 1, max: 120 },
  gender: String,
  daily_calorie_goal: { type: Number, min: 1, default: 2000 },
  // ... add other fields from your types.ts
  onboarding_complete: { type: Boolean, default: false }
}, { timestamps: true });



module.exports = mongoose.model('Profile', profileSchema);
