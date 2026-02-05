const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exercise = require('../models/Exercise');

// Smart mapping for broader search terms (e.g., 'legs' finds 'quadriceps')
const BODY_PART_MAPPING = {
  legs: ['legs', 'quadriceps', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors'],
  arms: ['arms', 'biceps', 'triceps', 'forearms'],
  back: ['back', 'lats', 'middle back', 'lower back', 'traps', 'trapezius'],
  chest: ['chest', 'pectorals'],
  shoulders: ['shoulders', 'deltoids'],
  abs: ['abs', 'abdominals', 'core'],
  cardio: ['cardio']
};

// ============================================================================
// 1. GET ALL EXERCISES (List View)
// ============================================================================
router.get('/', auth, async (req, res) => {
  try {
    const { bodyPart, query } = req.query;
    let filter = {};

    // Text Search
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }
    
    // Category/Body Part Smart Filter
    if (bodyPart && bodyPart !== 'all') {
      const term = bodyPart.toLowerCase();
      const synonyms = BODY_PART_MAPPING[term] || [term];
      const regexPattern = synonyms.join('|'); // e.g., "legs|quadriceps|..."

      filter.$or = [
        { bodyPart: { $regex: regexPattern, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } }
      ];
    }

    const exercises = await Exercise.find(filter).limit(100);
    res.json(exercises);
  } catch (err) {
    console.error("Get Exercises Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================================
// 2. RATE EXERCISE (With Comment & Stats Calculation)
// ============================================================================
router.post('/rate', auth, async (req, res) => {
  const { exerciseId, rating, comment } = req.body;
  const ALLOWED_RATINGS = ['INJURED', 'NO_FEEL', 'MODERATE', 'EFFECTIVE'];

  if (!ALLOWED_RATINGS.includes(rating)) {
    return res.status(400).json({ msg: "Invalid rating value" });
  }

  try {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });

    // 1. Remove previous rating by this user (to prevent duplicates)
    exercise.ratings = exercise.ratings.filter(
      r => r.user.toString() !== req.user.id
    );

    // 2. Add new rating
    exercise.ratings.push({
      user: req.user.id,
      value: rating,
      comment: comment ? comment.trim() : "" // Save optional comment
    });

    // 3. Recalculate Graph Stats
    const counts = {
      INJURED: 0,
      NO_FEEL: 0,
      MODERATE: 0,
      EFFECTIVE: 0
    };

    exercise.ratings.forEach(r => {
      if (counts[r.value] !== undefined) {
        counts[r.value]++;
      }
    });

    exercise.stats = {
      counts,
      total: exercise.ratings.length
    };

    // Force Mongoose to recognize the stats change
    exercise.markModified('stats');

    await exercise.save();

    // 4. Return populated exercise (so the UI updates the list immediately)
    await exercise.populate('ratings.user', 'full_name');
    
    res.json(exercise);
  } catch (err) {
    console.error("Rate Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================================
// 3. PERSONAL NOTES (Private to User)
// ============================================================================

// Get Note
router.get('/:id/note', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });

    const note = exercise.notes?.find(n => n.user.toString() === req.user.id);
    res.json({ text: note ? note.text : "" });
  } catch (err) {
    console.error("Get Note Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// Save Note
router.post('/note', auth, async (req, res) => {
  const { exerciseId, text } = req.body;
  try {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });

    // Ensure notes array exists
    if (!exercise.notes) exercise.notes = [];

    // Remove old note
    exercise.notes = exercise.notes.filter(n => n.user.toString() !== req.user.id);

    // Add new note (only if text exists)
    if (text && text.trim().length > 0) {
      exercise.notes.push({
        user: req.user.id,
        text: text.trim(),
        updatedAt: new Date()
      });
    }

    await exercise.save();
    res.json({ msg: "Note saved" });
  } catch (err) {
    console.error("Save Note Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================================
// 4. SEARCH LEGACY (Optional Fallback)
// ============================================================================
router.get('/search', auth, async (req, res) => {
  res.json([]); // Legacy support, returns empty array
});

// ============================================================================
// 5. GET SINGLE EXERCISE (Must be defined LAST to avoid conflict)
// ============================================================================
router.get('/:id', auth, async (req, res) => {
  try {
    // Populate user details in ratings so we can show names in the history list
    const exercise = await Exercise.findById(req.params.id)
      .populate('ratings.user', 'full_name'); 

    if (!exercise) {
      return res.status(404).json({ msg: 'Exercise not found' });
    }
    
    // Privacy: Do not send the full list of OTHER users' private notes
    exercise.notes = undefined; 
    
    res.json(exercise);
  } catch (err) {
    console.error("Get ID Error:", err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Exercise not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;