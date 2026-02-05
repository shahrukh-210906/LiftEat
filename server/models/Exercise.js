const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, 
  bodyPart: { type: String }, 
  equipment: { type: String }, 
  images: [String], 
  instructions: [String],
  
  // Ratings with Comment
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { 
      type: String, 
      enum: ['INJURED', 'NO_FEEL', 'MODERATE', 'EFFECTIVE'] 
    },
    comment: { type: String, maxlength: 280 }, // Twitter-style length
    date: { type: Date, default: Date.now }
  }],

  // Personal Notes
  notes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }],
  
  // Stats Cache
  stats: {
    counts: {
      INJURED: { type: Number, default: 0 },
      NO_FEEL: { type: Number, default: 0 },
      MODERATE: { type: Number, default: 0 },
      EFFECTIVE: { type: Number, default: 0 }
    },
    total: { type: Number, default: 0 }
  }
}, { timestamps: true });

ExerciseSchema.index({ name: 'text', bodyPart: 'text' });

module.exports = mongoose.model('Exercise', ExerciseSchema);