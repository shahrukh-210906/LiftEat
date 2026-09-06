const mongoose = require('mongoose');

const WorkoutRoutineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  exercises: [
    {
      exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise', // <--- MAKE SURE THIS MATCHES YOUR EXERCISE MODEL NAME EXACTLY
        required: true
      },
      reps: { type: Number, min: 1, max: 30 },
      rest_seconds: { type: Number, min: 30, max: 300 },
      sets: {
        type: Number,
        default: 3,
        required: true
      }
    }
  ],
  status: { type: String, enum: ['draft', 'ready'], default: 'ready' },
  ai: { model: String, schema_version: Number, rationale: String, focus: String, duration_minutes: Number },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('workoutRoutine', WorkoutRoutineSchema);
