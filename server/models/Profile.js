const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
   ai_analysis: {
    body_type: String,
    est_body_fat: String,
    muscle_mass: String,
    suggestion: String
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body_type: { type: String, enum: ['ectomorph', 'mesomorph', 'endomorph'] },
  fitness_goal: { type: String },
  weight_kg: Number,
  height_cm: Number,
  age: Number,
  gender: String,
  daily_calorie_goal: Number,
  // ... add other fields from your types.ts
  onboarding_complete: { type: Boolean, default: false }
}, { timestamps: true });



module.exports = mongoose.model('Profile', profileSchema);