const mongoose = require('mongoose');

const WorkoutRoutineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  exercises: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'exercise' // Must match your Exercise model name
    }
  ],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('workoutRoutine', WorkoutRoutineSchema);