const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
  workout_session: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkoutSession', 
    required: true 
  },
  // Reference to the original exercise (for images, instructions, etc.)
  exercise_base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  },
  exercise_name: { type: String, required: true },
  muscle_group: String,
  order_index: Number,
  // [NEW] Added sets array
  sets: [{
    set_number: Number,
    weight: Number,
    reps: Number,
    completed: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('WorkoutExercise', workoutExerciseSchema);