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
      exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise', // <--- MAKE SURE THIS MATCHES YOUR EXERCISE MODEL NAME EXACTLY
        required: true
      },
      sets: {
        type: Number,
        default: 3,
        required: true
      }
    }
  ],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('workoutRoutine', WorkoutRoutineSchema);