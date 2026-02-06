const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutExercise = require('../models/WorkoutExercise');
const WorkoutRoutine = require('../models/WorkoutRoutine');

// @route   GET api/workouts/routines
// @desc    Get all routines for the logged-in user
router.get('/routines', auth, async (req, res) => {
  try {
    const routines = await WorkoutRoutine.find({ user: req.user.id })
      .sort({ created_at: -1 });
    res.json(routines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/workouts/routines
// @desc    Save a new custom workout routine
router.post('/routines', auth, async (req, res) => {
  try {
    const { name, exercises } = req.body;
    
    // Expects exercises: [{ exercise: id, name, muscle_group, default_sets, default_reps }]
    const newRoutine = new WorkoutRoutine({
      user: req.user.id,
      name,
      exercises 
    });

    const routine = await newRoutine.save();
    res.json(routine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/workouts/exercises/:exerciseId/sets
// @desc    Log a set with weight and reps
router.post('/exercises/:exerciseId/sets', auth, async (req, res) => {
  try {
    const { reps, weight, set_number } = req.body;
    const exercise = await WorkoutExercise.findById(req.params.exerciseId);
    
    if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });

    exercise.sets.push({
      set_number: set_number || exercise.sets.length + 1,
      reps: reps || 0,
      weight: weight || 0,
      completed: true
    });

    await exercise.save();
    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/workouts/start/:routineId
// @desc    Start a session from a saved routine
router.post('/start/:routineId', auth, async (req, res) => {
  try {
    const routine = await WorkoutRoutine.findById(req.params.routineId);
    if (!routine) return res.status(404).json({ msg: "Routine not found" });

    const newSession = new WorkoutSession({
      user: req.user.id,
      name: routine.name,
      is_active: true,
      started_at: new Date()
    });

    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;