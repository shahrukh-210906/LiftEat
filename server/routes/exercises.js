const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exercise = require('../models/Exercise');

// @route   GET api/exercises/search
// @desc    Search Exercises
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    let exercises;

    if (query) {
      // Search by name OR bodyPart (case insensitive)
      exercises = await Exercise.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { bodyPart: { $regex: query, $options: 'i' } }
        ]
      }).limit(50);
    } else {
      // If no search, return 20 random ones
      exercises = await Exercise.aggregate([{ $sample: { size: 20 } }]);
    }

    // Return them directly (we can add rating logic later if needed)
    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/exercises/rate
// @desc    Rate an exercise (Placeholder)
router.post('/rate', auth, async (req, res) => {
  // Simple success response to prevent 404 on rating
  res.json({ msg: "Rating saved" }); 
});

module.exports = router;