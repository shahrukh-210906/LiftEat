const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutExercise = require('../models/WorkoutExercise');
const WorkoutRoutine = require('../models/WorkoutRoutine');

// ==========================================
// 1. ROUTINE MANAGEMENT
// ==========================================

// @route   GET api/workouts/routines
// @desc    Get all saved routines
router.get('/routines', auth, async (req, res) => {
  try {
    const routines = await WorkoutRoutine.find({ user: req.user.id })
      .populate('exercises.exercise') // Populates details from the Exercise library
      .sort({ created_at: -1 });
    res.json(routines);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/workouts/routines
// @desc    Create a new routine
router.post('/routines', auth, async (req, res) => {
  try {
    const { name, exercises } = req.body;

    // Validate exercises array
    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ msg: "Invalid exercises data" });
    }

    const newRoutine = new WorkoutRoutine({
      user: req.user.id,
      name,
      // Map incoming data to schema (Stores Exercise ID + Target Sets)
      exercises: exercises.map(ex => ({
        exercise: ex._id || ex.exercise,
        sets: ex.sets || 3
      }))
    });

    const routine = await newRoutine.save();
    res.json(routine);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/workouts/routines/reset
// @desc    [DEV TOOL] Delete all routines (Fixes 500 errors from schema changes)
router.delete('/routines/reset', auth, async (req, res) => {
  try {
    await WorkoutRoutine.deleteMany({ user: req.user.id });
    res.json({ msg: 'Routines database reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/workouts/routines/:id
// @desc    Delete a specific routine
router.delete('/routines/:id', auth, async (req, res) => {
  try {
    const routine = await WorkoutRoutine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ msg: 'Routine not found' });
    }

    // Verify user owns the routine
    if (routine.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await routine.deleteOne();
    res.json({ msg: 'Routine removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. SESSION MANAGEMENT (START / LOAD / FINISH)
// ==========================================

// @route   POST api/workouts/start
// @desc    Start a Quick Workout (Empty Session)
router.post('/start', auth, async (req, res) => {
  try {
    const newSession = new WorkoutSession({
      user: req.user.id,
      name: req.body.name || "Quick Workout",
      is_active: true,
      started_at: new Date()
    });
    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/workouts/start/:routineId
// @desc    Start a session from a Saved Routine
router.post('/start/:routineId', auth, async (req, res) => {
  try {
    // 1. Fetch the Routine
    const routine = await WorkoutRoutine.findById(req.params.routineId).populate('exercises.exercise');
    if (!routine) return res.status(404).json({ msg: "Routine not found" });

    // 2. Create the Session
    const newSession = new WorkoutSession({
      user: req.user.id,
      name: routine.name,
      is_active: true,
      started_at: new Date()
    });
    const savedSession = await newSession.save();

    // 3. Copy Exercises from Routine -> WorkoutSession
    // Note: We don't copy "sets" yet because the user hasn't performed them.
    const sessionExercises = routine.exercises.map((item, index) => ({
      workout_session: savedSession._id,
      exercise_base: item.exercise._id, // Link to original exercise for info
      exercise_name: item.exercise.name,
      muscle_group: item.exercise.bodyPart,
      order_index: index,
      sets: [] // Initialize empty sets for logging
    }));

    if (sessionExercises.length > 0) {
      await WorkoutExercise.insertMany(sessionExercises);
    }

    res.json(savedSession);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/workouts/:id
// @desc    Load a specific workout session (and its exercises)
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    const exercises = await WorkoutExercise.find({ workout_session: session._id })
      .populate('exercise_base') // Get names, images, etc.
      .sort({ order_index: 1 });

    res.json({ session, exercises });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/workouts/:id/finish
// @desc    Finish a workout session
router.put('/:id/finish', auth, async (req, res) => {
  try {
    const { name, duration_minutes } = req.body;
    const session = await WorkoutSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { 
        is_active: false, 
        completed_at: new Date(),
        name,
        duration_minutes
      },
      { new: true }
    );
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 3. SET LOGGING
// ==========================================

// @route   POST api/workouts/exercises/:exerciseId/sets
// @desc    Add a set to an exercise
router.post('/exercises/:exerciseId/sets', auth, async (req, res) => {
  try {
    const { reps, weight } = req.body;
    const exercise = await WorkoutExercise.findById(req.params.exerciseId);
    
    if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });

    exercise.sets.push({
      set_number: exercise.sets.length + 1,
      reps,
      weight,
      completed: true
    });

    await exercise.save();
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/workouts/exercises/:exerciseId/sets/:setId
// @desc    Delete a specific set
router.delete('/exercises/:exerciseId/sets/:setId', auth, async (req, res) => {
  try {
    const exercise = await WorkoutExercise.findById(req.params.exerciseId);
    if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });

    // Filter out the set to delete
    exercise.sets = exercise.sets.filter(
      (set) => set._id.toString() !== req.params.setId
    );

    // Optional: Re-number sets so they are sequential (1, 2, 3...)
    exercise.sets.forEach((set, index) => {
      set.set_number = index + 1;
    });

    await exercise.save();
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;