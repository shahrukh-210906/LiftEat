const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  started_at: { type: Date, default: Date.now },
  completed_at: Date,
  duration_minutes: Number,
  is_active: { type: Boolean, default: true }
});

workoutSessionSchema.index({ user: 1, is_active: 1, completed_at: -1 });
module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
