const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // e.g., "strength"
  bodyPart: { type: String }, // e.g., "waist", "chest"
  equipment: { type: String }, // e.g., "body weight"
  images: [String], // Array of image URLs
  instructions: [String], // Step-by-step guide
}, { timestamps: true });

// Enable text search
ExerciseSchema.index({ name: 'text', bodyPart: 'text' });

module.exports = mongoose.model('Exercise', ExerciseSchema);